import { describe, expect, it } from 'vitest'
import { estimateMemoryFit } from './memory'

describe('estimateMemoryFit', () => {
  it('uses the larger of 2 GiB and ten percent when runtime overhead is not measured', () => {
    const small = estimateMemoryFit({ weightGiB: 8, kvCacheGiB: 1, concurrency: 1, deviceMemoryGiB: 16 })
    const large = estimateMemoryFit({ weightGiB: 40, kvCacheGiB: 2, concurrency: 1, deviceMemoryGiB: 80 })

    expect(small.runtimeOverheadGiB).toBe(2)
    expect(small.requiredGiB).toBe(11)
    expect(large.runtimeOverheadGiB).toBe(4)
    expect(large.requiredGiB).toBe(46)
  })

  it('multiplies KV cache by concurrency without multiplying model weights', () => {
    const result = estimateMemoryFit({
      weightGiB: 18,
      kvCacheGiB: 3,
      concurrency: 3,
      deviceMemoryGiB: 40,
      measuredRuntimeOverheadGiB: 2.5,
    })

    expect(result.requiredGiB).toBe(29.5)
  })

  it('uses only 80 percent of total memory when usable memory is unverified', () => {
    const result = estimateMemoryFit({ weightGiB: 20, kvCacheGiB: 2, concurrency: 1, deviceMemoryGiB: 28 })

    expect(result.usableGiB).toBe(22.4)
    expect(result.status).toBe('constrained')
    expect(result.headroomGiB).toBeCloseTo(-1.6)
  })

  it('honors verified usable memory and marks a fitting artifact', () => {
    const result = estimateMemoryFit({
      weightGiB: 20,
      kvCacheGiB: 2,
      concurrency: 1,
      deviceMemoryGiB: 32,
      verifiedUsableMemoryGiB: 30,
      measuredRuntimeOverheadGiB: 2,
    })

    expect(result.usableGiB).toBe(30)
    expect(result.status).toBe('fits')
    expect(result.headroomGiB).toBe(6)
  })
})
