import { describe, expect, it } from 'vitest'
import { assessModelMutation, selectRefreshOutcome } from './evidence'

describe('fail-closed refresh policy', () => {
  it('keeps the last known-good snapshot when a source fails or schema validation fails', () => {
    expect(selectRefreshOutcome({ lastGoodSnapshotId: 'lcl-2026-08-31', fetchedSnapshotId: null, schemaValid: false }))
      .toEqual({ acceptedSnapshotId: 'lcl-2026-08-31', status: 'preserved', reason: 'source-or-schema-failure' })
  })

  it('accepts a valid candidate snapshot', () => {
    expect(selectRefreshOutcome({ lastGoodSnapshotId: 'old', fetchedSnapshotId: 'new', schemaValid: true }))
      .toEqual({ acceptedSnapshotId: 'new', status: 'accepted', reason: null })
  })

  it.each([
    ['license', { license: 'Apache-2.0', weightHash: 'abc', gated: false }, { license: 'MIT', weightHash: 'abc', gated: false }],
    ['weight hash', { license: 'Apache-2.0', weightHash: 'abc', gated: false }, { license: 'Apache-2.0', weightHash: 'def', gated: false }],
    ['gated access', { license: 'Apache-2.0', weightHash: 'abc', gated: false }, { license: 'Apache-2.0', weightHash: 'abc', gated: true }],
  ])('removes a model from recommendations when %s changes', (_label, previous, next) => {
    expect(assessModelMutation(previous, next)).toMatchObject({ recommendationEligible: false, requiresReview: true })
  })

  it('keeps an unchanged model recommendation-eligible', () => {
    const state = { license: 'Apache-2.0', weightHash: 'abc', gated: false }
    expect(assessModelMutation(state, state)).toEqual({ recommendationEligible: true, requiresReview: false, changes: [] })
  })
})
