import type { Market } from '@/data/schema'

type Locale = 'tr' | 'en'

interface BenchmarkCohort {
  modelRevision: string
  artifactId: string
  runtime: string
  contextTokens: number
  powerMode: string
  protocol: string
  modality: 'text' | 'vision' | 'image' | 'video' | 'audio'
}

interface ComparablePrice {
  market: Market
  taxBasis: string
  currency: string
  cohort?: BenchmarkCohort
}

export function detectPriceAnomaly(previousAmount: number, candidateAmount: number) {
  const changePercent = Math.abs((candidateAmount - previousAmount) / previousAmount) * 100
  return { changePercent: Math.round(changePercent * 100) / 100, quarantined: changePercent > 35 }
}

export function canComparePricePerformance(left: ComparablePrice, right: ComparablePrice) {
  if (left.market !== right.market || left.taxBasis !== right.taxBasis || left.currency !== right.currency) return false
  if (!left.cohort || !right.cohort) return false
  return left.cohort.modelRevision === right.cohort.modelRevision
    && left.cohort.artifactId === right.cohort.artifactId
    && left.cohort.runtime === right.cohort.runtime
    && left.cohort.contextTokens === right.cohort.contextTokens
    && left.cohort.powerMode === right.cohort.powerMode
    && left.cohort.protocol === right.cohort.protocol
    && left.cohort.modality === right.cohort.modality
}

const disclosures: Record<Locale, Record<Market, string>> = {
  tr: {
    TR: 'Türkiye fiyatları KDV dahil olarak gösterilir; kargo durumu ayrıca belirtilir.',
    US: 'ABD fiyatları satış vergisi hariçtir; eyalet vergisi satın alma anında eklenebilir.',
    DE: 'Almanya fiyatları KDV dahil olarak gösterilir; kargo durumu ayrıca belirtilir.',
  },
  en: {
    TR: 'Türkiye prices include VAT; shipping is disclosed separately.',
    US: 'US prices exclude sales tax; state tax may be added at checkout.',
    DE: 'Germany prices include VAT; shipping is disclosed separately.',
  },
}

export function marketTaxDisclosure(market: Market, locale: Locale) {
  return disclosures[locale][market]
}
