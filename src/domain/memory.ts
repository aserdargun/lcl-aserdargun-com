import type { CompatibilityEdge } from '@/data/schema'

interface MemoryFitInput {
  weightGiB: number
  kvCacheGiB: number
  concurrency: number
  deviceMemoryGiB: number
  verifiedUsableMemoryGiB?: number
  measuredRuntimeOverheadGiB?: number
}

export interface MemoryFitResult {
  requiredGiB: number
  usableGiB: number
  runtimeOverheadGiB: number
  headroomGiB: number
  status: CompatibilityEdge['status']
}

function round(value: number) {
  return Math.round(value * 100) / 100
}

export function estimateMemoryFit(input: MemoryFitInput): MemoryFitResult {
  const runtimeOverheadGiB = input.measuredRuntimeOverheadGiB ?? Math.max(2, input.weightGiB * 0.1)
  const requiredGiB = input.weightGiB + input.kvCacheGiB * input.concurrency + runtimeOverheadGiB
  const usableGiB = input.verifiedUsableMemoryGiB ?? input.deviceMemoryGiB * 0.8
  const headroomGiB = usableGiB - requiredGiB

  return {
    requiredGiB: round(requiredGiB),
    usableGiB: round(usableGiB),
    runtimeOverheadGiB: round(runtimeOverheadGiB),
    headroomGiB: round(headroomGiB),
    status: headroomGiB >= 0 ? 'fits' : requiredGiB <= input.deviceMemoryGiB ? 'constrained' : 'unsupported',
  }
}
