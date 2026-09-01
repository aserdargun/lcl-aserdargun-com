import { describe, expect, it } from 'vitest'
import { canComparePricePerformance, detectPriceAnomaly, marketTaxDisclosure } from './pricing'

describe('market price safeguards', () => {
  it('quarantines a price source when the same configuration jumps more than 35 percent', () => {
    expect(detectPriceAnomaly(100_000, 136_000)).toMatchObject({ quarantined: true, changePercent: 36 })
    expect(detectPriceAnomaly(100_000, 135_000)).toMatchObject({ quarantined: false, changePercent: 35 })
  })

  it('does not compare different tax bases in a single value ranking', () => {
    expect(canComparePricePerformance(
      { market: 'TR', taxBasis: 'vat-included', currency: 'TRY' },
      { market: 'US', taxBasis: 'sales-tax-excluded', currency: 'USD' },
    )).toBe(false)
  })

  it('requires identical benchmark cohorts before price performance is compared', () => {
    const cohort = {
      modelRevision: 'rev-a',
      artifactId: 'model-q4',
      runtime: 'llama.cpp@b7000',
      contextTokens: 8192,
      powerMode: 'balanced',
      protocol: 'lcl-text-v1',
      modality: 'text' as const,
    }

    expect(canComparePricePerformance(
      { market: 'DE', taxBasis: 'vat-included', currency: 'EUR', cohort },
      { market: 'DE', taxBasis: 'vat-included', currency: 'EUR', cohort: { ...cohort, contextTokens: 16_384 } },
    )).toBe(false)
    expect(canComparePricePerformance(
      { market: 'DE', taxBasis: 'vat-included', currency: 'EUR', cohort },
      { market: 'DE', taxBasis: 'vat-included', currency: 'EUR', cohort },
    )).toBe(true)
  })

  it('states each market tax convention explicitly', () => {
    expect(marketTaxDisclosure('TR', 'tr')).toMatch(/KDV dahil/)
    expect(marketTaxDisclosure('US', 'tr')).toMatch(/satış vergisi hariç/)
    expect(marketTaxDisclosure('DE', 'en')).toMatch(/VAT/)
  })
})
