import { describe, expect, it } from 'vitest'
import { isArtifactRecommendationEligible, isPublisherAllowed } from './allowlist'

describe('catalog recommendation allowlist', () => {
  it.each(['OpenAI', 'Qwen', 'DeepSeek', 'Google', 'Wan-AI'])('allows curated publisher %s', (publisher) => {
    expect(isPublisherAllowed(publisher)).toBe(true)
  })

  it('does not automatically admit an unknown publisher', () => {
    expect(isPublisherAllowed('Anonymous Upload')).toBe(false)
  })

  it('admits a reproducible conversion only when both recipe and source hash exist', () => {
    expect(isArtifactRecommendationEligible({ provenance: 'reproducible-conversion', conversionRecipe: 'llama.cpp convert', sourceSha256: 'a'.repeat(64) })).toBe(true)
    expect(isArtifactRecommendationEligible({ provenance: 'reproducible-conversion', conversionRecipe: 'llama.cpp convert' })).toBe(false)
  })

  it('admits publisher artifacts and rejects unverified community artifacts', () => {
    expect(isArtifactRecommendationEligible({ provenance: 'publisher' })).toBe(true)
    expect(isArtifactRecommendationEligible({ provenance: 'community' })).toBe(false)
  })
})
