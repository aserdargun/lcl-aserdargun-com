const CURATED_PUBLISHERS = new Set(['OpenAI', 'Qwen', 'DeepSeek', 'Google', 'Wan-AI'])

interface ArtifactPolicyInput {
  provenance: 'publisher' | 'reproducible-conversion' | 'community'
  conversionRecipe?: string
  sourceSha256?: string
}

export function isPublisherAllowed(publisher: string) {
  return CURATED_PUBLISHERS.has(publisher)
}

export function isArtifactRecommendationEligible(artifact: ArtifactPolicyInput) {
  if (artifact.provenance === 'publisher') return true
  if (artifact.provenance === 'community') return false
  return Boolean(artifact.conversionRecipe?.trim()) && /^[a-f0-9]{64}$/i.test(artifact.sourceSha256 ?? '')
}
