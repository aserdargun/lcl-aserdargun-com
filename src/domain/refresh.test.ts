import { describe, expect, it } from 'vitest'
import type { RefreshFixture } from './refresh'
import { reconcileRefresh } from './refresh'

const previous = {
  snapshotId: 'lcl-2026-08-31',
  sources: [
    { id: 'openai', status: 'current', checkedAt: '2026-08-31' },
    { id: 'shop-tr', status: 'current', checkedAt: '2026-08-31' },
  ],
  models: [{ id: 'm1', publisher: 'OpenAI', license: 'Apache-2.0', weightHash: 'a'.repeat(64), gated: false, recommendationEligible: true }],
  prices: [{ id: 'p1', deviceId: 'd1', market: 'TR', configuration: '128 GB', amount: 100_000, status: 'verified' }],
} satisfies RefreshFixture

describe('fixture-driven refresh reconciliation', () => {
  it('accepts a successful price refresh inside the anomaly boundary', () => {
    const result = reconcileRefresh(previous, {
      observedAt: '2026-09-01',
      sourceResults: [{ sourceId: 'shop-tr', status: 'ok', prices: [{ ...previous.prices[0], amount: 110_000 }] }],
    })

    expect(result.prices[0]).toMatchObject({ amount: 110_000, status: 'verified' })
    expect(result.sources.find((source) => source.id === 'shop-tr')).toMatchObject({ status: 'current', checkedAt: '2026-09-01' })
  })

  it('preserves source records and marks them stale during a partial outage', () => {
    const result = reconcileRefresh(previous, {
      observedAt: '2026-09-01',
      sourceResults: [{ sourceId: 'openai', status: 'failed' }],
    })

    expect(result.models).toEqual(previous.models)
    expect(result.sources.find((source) => source.id === 'openai')).toMatchObject({ status: 'stale', checkedAt: '2026-08-31' })
  })

  it('quarantines a price jump above 35 percent and keeps the last verified amount', () => {
    const result = reconcileRefresh(previous, {
      observedAt: '2026-09-01',
      sourceResults: [{ sourceId: 'shop-tr', status: 'ok', prices: [{ ...previous.prices[0], amount: 140_000 }] }],
    })

    expect(result.prices[0]).toMatchObject({ amount: 100_000, status: 'quarantined', candidateAmount: 140_000 })
  })

  it('removes a changed-license model from recommendations until review', () => {
    const result = reconcileRefresh(previous, {
      observedAt: '2026-09-01',
      sourceResults: [{ sourceId: 'openai', status: 'ok', models: [{ ...previous.models[0], license: 'MIT' }] }],
    })

    expect(result.models[0]).toMatchObject({ license: 'MIT', recommendationEligible: false, reviewReason: 'license' })
  })

  it('discovers a new model only from a curated publisher source', () => {
    const result = reconcileRefresh(previous, {
      observedAt: '2026-09-01',
      sourceResults: [{ sourceId: 'openai', status: 'ok', models: [
        previous.models[0],
        { id: 'm2', publisher: 'OpenAI', license: 'Apache-2.0', weightHash: 'b'.repeat(64), gated: false, recommendationEligible: true },
      ] }],
    })

    expect(result.models.map((model) => model.id)).toEqual(['m1', 'm2'])
  })
})
