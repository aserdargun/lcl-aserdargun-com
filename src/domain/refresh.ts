import { isPublisherAllowed } from './allowlist'
import { assessModelMutation } from './evidence'
import { detectPriceAnomaly } from './pricing'

interface RefreshSource {
  id: string
  status: 'current' | 'stale'
  checkedAt: string
}

interface RefreshModel {
  id: string
  publisher: string
  license: string
  weightHash: string
  gated: boolean
  recommendationEligible: boolean
  reviewReason?: string
}

interface RefreshPrice {
  id: string
  deviceId: string
  market: 'TR' | 'US' | 'DE'
  configuration: string
  amount: number
  status: 'verified' | 'quarantined'
  candidateAmount?: number
}

export interface RefreshFixture {
  snapshotId: string
  sources: RefreshSource[]
  models: RefreshModel[]
  prices: RefreshPrice[]
}

interface SourceResult {
  sourceId: string
  status: 'ok' | 'failed'
  models?: RefreshModel[]
  prices?: RefreshPrice[]
}

interface RefreshInput {
  observedAt: string
  sourceResults: SourceResult[]
}

function reconcileModels(previous: RefreshModel[], incoming: RefreshModel[]) {
  return incoming.filter((model) => isPublisherAllowed(model.publisher)).map((model) => {
    const old = previous.find((candidate) => candidate.id === model.id)
    if (!old) return model
    const mutation = assessModelMutation(old, model)
    if (!mutation.requiresReview) return model
    return { ...model, recommendationEligible: false, reviewReason: mutation.changes[0] }
  })
}

function reconcilePrices(previous: RefreshPrice[], incoming: RefreshPrice[]) {
  return incoming.map((candidate) => {
    const old = previous.find((price) => price.id === candidate.id)
    if (!old) return candidate
    const anomaly = detectPriceAnomaly(old.amount, candidate.amount)
    return anomaly.quarantined
      ? { ...old, status: 'quarantined' as const, candidateAmount: candidate.amount }
      : { ...candidate, status: 'verified' as const, candidateAmount: undefined }
  })
}

export function reconcileRefresh(previous: RefreshFixture, input: RefreshInput): RefreshFixture {
  let models = previous.models
  let prices = previous.prices
  const sources = previous.sources.map((source) => ({ ...source }))

  for (const result of input.sourceResults) {
    const source = sources.find((item) => item.id === result.sourceId)
    if (result.status === 'failed') {
      if (source) source.status = 'stale'
      continue
    }
    if (source) {
      source.status = 'current'
      source.checkedAt = input.observedAt
    }
    if (result.models) models = reconcileModels(previous.models, result.models)
    if (result.prices) prices = reconcilePrices(previous.prices, result.prices)
  }

  return { ...previous, sources, models, prices }
}
