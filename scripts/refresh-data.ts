import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { catalog as seedCatalog } from '../src/data/catalog'
import { changeLog } from '../src/data/change-log'
import { catalogSchema, changesFeedSchema, snapshotManifestSchema, type Catalog } from '../src/data/schema'
import { detectPriceAnomaly } from '../src/domain/pricing'
import { buildSnapshotManifest } from '../src/domain/snapshot'

const root = process.cwd()
const publicDataRoot = path.join(root, 'public/data')
const targetDirectory = path.join(publicDataRoot, 'v1')
const stagingRoot = path.join(root, '.lcl-refresh')
const stagingDirectory = path.join(stagingRoot, 'candidate-v1')
const stagingAliases = path.join(stagingRoot, 'candidate-root')
const backupDirectory = path.join(stagingRoot, 'last-good-v1')
const backupAliases = path.join(stagingRoot, 'last-good-root')
const rootManifestPath = path.join(root, 'public/manifest.json')
const rootChangesPath = path.join(root, 'public/changes.json')
const appVersion = '0.1.0'

function readPreviousCatalog(): Catalog | null {
  const catalogPath = path.join(targetDirectory, 'catalog.json')
  if (!existsSync(catalogPath)) return null
  const parsed = catalogSchema.safeParse(JSON.parse(readFileSync(catalogPath, 'utf8')))
  return parsed.success ? parsed.data : null
}

function applyPriceGuard(candidate: Catalog, previous: Catalog | null): Catalog {
  if (!previous) return candidate
  return {
    ...candidate,
    prices: candidate.prices.map((price) => {
      const old = previous.prices.find((item) => item.id === price.id && item.configuration === price.configuration)
      if (!old) return price
      const anomaly = detectPriceAnomaly(old.amount, price.amount)
      if (!anomaly.quarantined) return price
      return { ...old, status: 'quarantined' as const, candidateAmount: price.amount, observedAt: candidate.generatedAt.slice(0, 10) }
    }),
  }
}

function writeJson(filePath: string, value: unknown) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function publishAtomically() {
  rmSync(backupDirectory, { recursive: true, force: true })
  rmSync(backupAliases, { recursive: true, force: true })
  mkdirSync(backupAliases, { recursive: true })
  let movedLastGood = false
  try {
    if (existsSync(rootManifestPath)) copyFileSync(rootManifestPath, path.join(backupAliases, 'manifest.json'))
    if (existsSync(rootChangesPath)) copyFileSync(rootChangesPath, path.join(backupAliases, 'changes.json'))
    if (existsSync(targetDirectory)) {
      renameSync(targetDirectory, backupDirectory)
      movedLastGood = true
    }
    renameSync(stagingDirectory, targetDirectory)
    renameSync(path.join(stagingAliases, 'manifest.json'), rootManifestPath)
    renameSync(path.join(stagingAliases, 'changes.json'), rootChangesPath)
    rmSync(backupDirectory, { recursive: true, force: true })
    rmSync(backupAliases, { recursive: true, force: true })
    rmSync(stagingAliases, { recursive: true, force: true })
  } catch (error) {
    rmSync(targetDirectory, { recursive: true, force: true })
    if (movedLastGood && existsSync(backupDirectory)) renameSync(backupDirectory, targetDirectory)
    const previousManifest = path.join(backupAliases, 'manifest.json')
    const previousChanges = path.join(backupAliases, 'changes.json')
    if (existsSync(previousManifest)) copyFileSync(previousManifest, rootManifestPath)
    else rmSync(rootManifestPath, { force: true })
    if (existsSync(previousChanges)) copyFileSync(previousChanges, rootChangesPath)
    else rmSync(rootChangesPath, { force: true })
    throw error
  }
}

function main() {
  const previous = readPreviousCatalog()
  const guarded = applyPriceGuard(structuredClone(seedCatalog), previous)
  const provisional = buildSnapshotManifest(guarded, guarded.generatedAt)
  const candidate = catalogSchema.parse({ ...guarded, snapshotId: provisional.snapshotId })
  const manifest = snapshotManifestSchema.parse({
    ...buildSnapshotManifest(candidate, candidate.generatedAt),
    catalogPath: '/data/v1/catalog.json',
    changesPath: '/data/v1/changes.json',
    appVersion,
    sourceStatus: {
      current: candidate.sources.filter((source) => source.status === 'current').length,
      stale: candidate.sources.filter((source) => source.status === 'stale').length,
      quarantined: candidate.sources.filter((source) => source.status === 'quarantined').length,
      review: candidate.sources.filter((source) => source.status === 'review').length,
    },
  })
  if (candidate.snapshotId !== manifest.snapshotId) throw new Error('Snapshot identity is not deterministic')
  const changes = changesFeedSchema.parse({ schemaVersion: '1.0.0', snapshotId: candidate.snapshotId, changes: changeLog })

  rmSync(stagingDirectory, { recursive: true, force: true })
  rmSync(stagingAliases, { recursive: true, force: true })
  mkdirSync(stagingDirectory, { recursive: true })
  mkdirSync(stagingAliases, { recursive: true })
  writeJson(path.join(stagingDirectory, 'catalog.json'), candidate)
  writeJson(path.join(stagingDirectory, 'manifest.json'), manifest)
  writeJson(path.join(stagingDirectory, 'changes.json'), changes)
  writeJson(path.join(stagingAliases, 'manifest.json'), manifest)
  writeJson(path.join(stagingAliases, 'changes.json'), changes)

  catalogSchema.parse(JSON.parse(readFileSync(path.join(stagingDirectory, 'catalog.json'), 'utf8')))
  snapshotManifestSchema.parse(JSON.parse(readFileSync(path.join(stagingDirectory, 'manifest.json'), 'utf8')))
  changesFeedSchema.parse(JSON.parse(readFileSync(path.join(stagingDirectory, 'changes.json'), 'utf8')))

  mkdirSync(publicDataRoot, { recursive: true })
  publishAtomically()
  console.log(`Accepted ${candidate.snapshotId}; ${candidate.models.length} models, ${candidate.devices.length} devices, ${candidate.prices.length} prices.`)
}

try {
  main()
} catch (error) {
  rmSync(stagingDirectory, { recursive: true, force: true })
  rmSync(stagingAliases, { recursive: true, force: true })
  console.error(`Refresh rejected; last known-good snapshot preserved. ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
}
