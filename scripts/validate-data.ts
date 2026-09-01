import { readFileSync } from 'node:fs'
import path from 'node:path'
import { catalogSchema, changesFeedSchema, snapshotManifestSchema } from '../src/data/schema'
import { isArtifactRecommendationEligible, isPublisherAllowed } from '../src/domain/allowlist'
import { buildSnapshotManifest } from '../src/domain/snapshot'

const root = process.cwd()
const dataRoot = path.join(root, 'public/data/v1')
const readJson = (name: string) => JSON.parse(readFileSync(path.join(dataRoot, name), 'utf8'))

const catalog = catalogSchema.parse(readJson('catalog.json'))
const manifest = snapshotManifestSchema.parse(readJson('manifest.json'))
const changes = changesFeedSchema.parse(readJson('changes.json'))
const rootManifest = snapshotManifestSchema.parse(JSON.parse(readFileSync(path.join(root, 'public/manifest.json'), 'utf8')))
const rootChanges = changesFeedSchema.parse(JSON.parse(readFileSync(path.join(root, 'public/changes.json'), 'utf8')))
const calculated = buildSnapshotManifest(catalog, catalog.generatedAt)

if (manifest.sha256 !== calculated.sha256 || manifest.bytes !== calculated.bytes) {
  throw new Error(`Manifest mismatch: expected ${calculated.sha256}, found ${manifest.sha256}`)
}
if (catalog.snapshotId !== manifest.snapshotId || changes.snapshotId !== manifest.snapshotId) {
  throw new Error('Catalog, manifest, and changes snapshot identities differ')
}
if (JSON.stringify(rootManifest) !== JSON.stringify(manifest) || JSON.stringify(rootChanges) !== JSON.stringify(changes)) {
  throw new Error('Root manifest/changes aliases differ from the versioned data contract')
}

for (const model of catalog.models.filter((item) => item.recommendationEligible)) {
  if (!isPublisherAllowed(model.publisher)) throw new Error(`Unallowlisted publisher in recommendations: ${model.publisher}`)
  for (const artifact of model.artifacts) {
    if (!isArtifactRecommendationEligible(artifact)) throw new Error(`Unallowlisted artifact in recommendations: ${artifact.id}`)
  }
}

console.log(`Validated ${manifest.snapshotId} (${manifest.sha256.slice(0, 16)}…): ${catalog.models.length} models, ${catalog.devices.length} devices, ${catalog.evidence.length} evidence claims.`)
