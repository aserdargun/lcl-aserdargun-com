import { describe, expect, it } from 'vitest'
import { buildSnapshotManifest, canonicalJson } from './snapshot'

describe('snapshot manifest', () => {
  it('produces the same SHA-256 digest for equivalent objects with different key order', () => {
    const left = { schemaVersion: '1.0.0', models: [{ id: 'b', name: 'B' }], devices: [{ id: 'a' }] }
    const right = { devices: [{ id: 'a' }], models: [{ name: 'B', id: 'b' }], schemaVersion: '1.0.0' }

    expect(canonicalJson(left)).toBe(canonicalJson(right))
    expect(buildSnapshotManifest(left, '2026-09-01T02:30:00.000Z').sha256)
      .toBe(buildSnapshotManifest(right, '2026-09-01T02:30:00.000Z').sha256)
  })

  it('changes the digest when catalog evidence changes', () => {
    const before = buildSnapshotManifest({ evidence: [{ id: 'claim', status: 'current' }] }, '2026-09-01T02:30:00.000Z')
    const after = buildSnapshotManifest({ evidence: [{ id: 'claim', status: 'stale' }] }, '2026-09-01T02:30:00.000Z')

    expect(after.sha256).not.toBe(before.sha256)
  })
})
