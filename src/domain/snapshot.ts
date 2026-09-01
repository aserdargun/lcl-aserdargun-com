import { createHash } from 'node:crypto'

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, normalize(child)]),
    )
  }
  return value
}

export function canonicalJson(value: unknown) {
  return JSON.stringify(normalize(value))
}

export function buildSnapshotManifest(catalog: unknown, generatedAt: string) {
  const hashInput = catalog && typeof catalog === 'object' && !Array.isArray(catalog)
    ? { ...(catalog as Record<string, unknown>), snapshotId: '' }
    : catalog
  const canonical = canonicalJson(hashInput)
  const sha256 = createHash('sha256').update(canonical).digest('hex')
  return {
    schemaVersion: '1.0.0',
    snapshotId: `lcl-${generatedAt.slice(0, 10)}-${sha256.slice(0, 12)}`,
    generatedAt,
    sha256,
    bytes: Buffer.byteLength(canonical),
  }
}
