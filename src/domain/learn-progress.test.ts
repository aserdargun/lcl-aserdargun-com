import { describe, expect, it } from 'vitest'
import { bucketFor, countLearnProgress, emptyLearnProgress, loadLearnProgress, markLearnConcept, saveLearnProgress } from './learn-progress'

describe('learn-progress', () => {
  const conceptIds = ['a', 'b', 'c']

  it('builds an empty progress record with new status for every id', () => {
    const progress = emptyLearnProgress(conceptIds)
    expect(progress.updatedAt).toBe(0)
    for (const id of conceptIds) expect(progress.status[id]).toBe('new')
  })

  it('moves a concept from new → learning → known and schedules the next review', () => {
    const start = 1_700_000_000_000
    const learning = markLearnConcept(emptyLearnProgress(conceptIds), 'a', 'learning', start)
    expect(learning.status.a).toBe('learning')
    expect(learning.nextReviewAt.a).toBe(start + 4 * 60 * 60 * 1000)
    expect(learning.updatedAt).toBe(start)

    const known = markLearnConcept(learning, 'a', 'known', start + 60_000)
    expect(known.status.a).toBe('known')
    expect(known.nextReviewAt.a).toBe(start + 60_000 + 3 * 24 * 60 * 60 * 1000)
  })

  it('clears the next review when the user sends a concept back to new', () => {
    const start = 1_700_000_000_000
    const learning = markLearnConcept(emptyLearnProgress(conceptIds), 'a', 'learning', start)
    const fresh = markLearnConcept(learning, 'a', 'new', start + 10)
    expect(fresh.nextReviewAt.a).toBeUndefined()
  })

  it('buckets concepts into fresh / soon / later / mastered based on due dates', () => {
    const start = 1_700_000_000_000
    const progress = markLearnConcept(markLearnConcept(markLearnConcept(emptyLearnProgress(conceptIds), 'a', 'known', start), 'b', 'learning', start), 'c', 'new', start)
    expect(bucketFor(progress, 'c', start)).toBe('fresh')
    expect(bucketFor(progress, 'b', start)).toBe('later')
    expect(bucketFor(progress, 'a', start)).toBe('mastered')
    // 'a' is now past its 3-day review window → needs another pass
    expect(bucketFor(progress, 'a', start + 3 * 24 * 60 * 60 * 1000 + 1)).toBe('soon')
    // 'b' is past its 4-hour review window → needs another pass
    expect(bucketFor(progress, 'b', start + 4 * 60 * 60 * 1000 + 1)).toBe('soon')
  })

  it('counts new, learning, known, and due-now correctly', () => {
    const start = 1_700_000_000_000
    const progress = markLearnConcept(markLearnConcept(emptyLearnProgress(conceptIds), 'a', 'known', start), 'b', 'learning', start)
    const countsAtStart = countLearnProgress(progress, conceptIds, start)
    expect(countsAtStart.total).toBe(3)
    expect(countsAtStart.known).toBe(1)
    expect(countsAtStart.learning).toBe(1)
    expect(countsAtStart.new).toBe(1)
    expect(countsAtStart.dueNow).toBe(0)

    const countsAfterDue = countLearnProgress(progress, conceptIds, start + 4 * 60 * 60 * 1000 + 1)
    expect(countsAfterDue.dueNow).toBe(1) // 'b' became due
  })

  it('persists and reloads progress through localStorage shim', () => {
    const store = new Map<string, string>()
    ;(globalThis as { localStorage?: Storage }).localStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value) },
      removeItem: (key: string) => { store.delete(key) },
      clear: () => { store.clear() },
      key: () => null,
      length: 0,
    } as Storage

    const start = 1_700_000_000_000
    const progress = markLearnConcept(emptyLearnProgress(conceptIds), 'a', 'known', start)
    saveLearnProgress(progress)
    const restored = loadLearnProgress(conceptIds)
    expect(restored.status.a).toBe('known')
    expect(restored.nextReviewAt.a).toBe(start + 3 * 24 * 60 * 60 * 1000)
  })

  it('returns a fresh record when localStorage payload is corrupt', () => {
    const store = new Map<string, string>([['lcl-learn-progress-v1', 'not-json']])
    ;(globalThis as { localStorage?: Storage }).localStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => { store.set(key, value) },
      removeItem: (key: string) => { store.delete(key) },
      clear: () => { store.clear() },
      key: () => null,
      length: 0,
    } as Storage
    const restored = loadLearnProgress(conceptIds)
    expect(restored.status.a).toBe('new')
  })
})
