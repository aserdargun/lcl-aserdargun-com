interface RefreshOutcomeInput {
  lastGoodSnapshotId: string
  fetchedSnapshotId: string | null
  schemaValid: boolean
}

interface ModelMutationState {
  license: string
  weightHash: string
  gated: boolean
}

export function selectRefreshOutcome(input: RefreshOutcomeInput) {
  if (!input.fetchedSnapshotId || !input.schemaValid) {
    return { acceptedSnapshotId: input.lastGoodSnapshotId, status: 'preserved' as const, reason: 'source-or-schema-failure' as const }
  }
  return { acceptedSnapshotId: input.fetchedSnapshotId, status: 'accepted' as const, reason: null }
}

export function assessModelMutation(previous: ModelMutationState, next: ModelMutationState) {
  const changes: string[] = []
  if (previous.license !== next.license) changes.push('license')
  if (previous.weightHash !== next.weightHash) changes.push('weight-hash')
  if (previous.gated !== next.gated) changes.push('gated-access')
  return {
    recommendationEligible: changes.length === 0,
    requiresReview: changes.length > 0,
    changes,
  }
}
