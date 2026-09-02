export type LearnConceptStatus = 'new' | 'learning' | 'known'

/**
 * Spaced-repetition bucket key. Concepts move toward `known` over time
 * based on `nextReviewAt` plus the user's marks; this keeps the schedule
 * deterministic and easy to reason about in tests.
 */
export type LearnBucket = 'fresh' | 'soon' | 'later' | 'mastered'

export interface LearnProgress {
  /** Last update timestamp (epoch ms). */
  updatedAt: number
  /** Map of conceptId → status. */
  status: Record<string, LearnConceptStatus>
  /** Map of conceptId → next scheduled review (epoch ms). */
  nextReviewAt: Record<string, number>
}

export interface LearnCounts {
  total: number
  new: number
  learning: number
  known: number
  dueNow: number
  buckets: Record<LearnBucket, number>
}

const ONE_HOUR = 60 * 60 * 1000
const ONE_DAY = 24 * ONE_HOUR

const intervals: Record<LearnConceptStatus, number> = {
  new: 0,
  learning: 4 * ONE_HOUR,
  known: 3 * ONE_DAY,
}

export const learnStorageKey = 'lcl-learn-progress-v1'

/**
 * Build a fresh progress record for a list of concept ids. Used both
 * on first run and after a `reset` action.
 */
export function emptyLearnProgress(conceptIds: readonly string[]): LearnProgress {
  const status: Record<string, LearnConceptStatus> = {}
  for (const id of conceptIds) status[id] = 'new'
  return { updatedAt: 0, status, nextReviewAt: {} }
}

/**
 * Move a concept one step in the SRS ladder. The function is pure: it
 * does not touch storage; callers persist the returned value.
 */
export function markLearnConcept(progress: LearnProgress, conceptId: string, next: LearnConceptStatus, now: number = Date.now()): LearnProgress {
  const status = { ...progress.status, [conceptId]: next }
  const nextReviewAt = { ...progress.nextReviewAt }
  if (next === 'known' || next === 'learning') {
    nextReviewAt[conceptId] = now + intervals[next]
  } else {
    delete nextReviewAt[conceptId]
  }
  return { updatedAt: now, status, nextReviewAt }
}

export function bucketFor(progress: LearnProgress, conceptId: string, now: number = Date.now()): LearnBucket {
  const status = progress.status[conceptId] ?? 'new'
  const due = progress.nextReviewAt[conceptId] ?? 0
  if (due && due <= now) return 'soon'
  if (status === 'known') return 'mastered'
  if (status === 'learning') return 'later'
  return 'fresh'
}

export function countLearnProgress(progress: LearnProgress, conceptIds: readonly string[], now: number = Date.now()): LearnCounts {
  const buckets: Record<LearnBucket, number> = { fresh: 0, soon: 0, later: 0, mastered: 0 }
  let newCount = 0
  let learningCount = 0
  let knownCount = 0
  let dueNow = 0
  for (const id of conceptIds) {
    const bucket = bucketFor(progress, id, now)
    buckets[bucket] += 1
    const status = progress.status[id] ?? 'new'
    if (status === 'new') newCount += 1
    if (status === 'learning') learningCount += 1
    if (status === 'known') knownCount += 1
    const due = progress.nextReviewAt[id] ?? 0
    if (due && due <= now) dueNow += 1
  }
  return { total: conceptIds.length, new: newCount, learning: learningCount, known: knownCount, dueNow, buckets }
}

export function loadLearnProgress(conceptIds: readonly string[]): LearnProgress {
  if (typeof localStorage === 'undefined') return emptyLearnProgress(conceptIds)
  try {
    const raw = localStorage.getItem(learnStorageKey)
    if (!raw) return emptyLearnProgress(conceptIds)
    const parsed = JSON.parse(raw) as Partial<LearnProgress>
    if (!parsed || typeof parsed !== 'object') return emptyLearnProgress(conceptIds)
    const base = emptyLearnProgress(conceptIds)
    const status = { ...base.status, ...(parsed.status ?? {}) }
    const nextReviewAt = { ...(parsed.nextReviewAt ?? {}) }
    return { updatedAt: parsed.updatedAt ?? 0, status, nextReviewAt }
  } catch {
    return emptyLearnProgress(conceptIds)
  }
}

export function saveLearnProgress(progress: LearnProgress) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(learnStorageKey, JSON.stringify(progress))
  } catch {
    // ignore quota/disabled storage; the in-memory state is the source of truth for the session
  }
}
