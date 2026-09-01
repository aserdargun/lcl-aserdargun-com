import { describe, expect, it } from 'vitest'
import type { Catalog, LabScenario } from '@/data/schema'
import { recommendLab } from './recommendation'

const catalog = {
  schemaVersion: '1.0.0',
  snapshotId: 'fixture',
  generatedAt: '2026-09-01T02:30:00.000Z',
  sources: [],
  models: [],
  prices: [
    { id: 'p-n-low', deviceId: 'n-low', market: 'TR', currency: 'TRY', amount: 40_000, taxBasis: 'vat-included', shipping: 'excluded', stock: 'in-stock', observedAt: '2026-09-01', sourceUrl: 'https://example.test/n-low', status: 'verified' },
    { id: 'p-n-high', deviceId: 'n-high', market: 'TR', currency: 'TRY', amount: 60_000, taxBasis: 'vat-included', shipping: 'excluded', stock: 'in-stock', observedAt: '2026-09-01', sourceUrl: 'https://example.test/n-high', status: 'verified' },
    { id: 'p-a', deviceId: 'amd', market: 'TR', currency: 'TRY', amount: 50_000, taxBasis: 'vat-included', shipping: 'excluded', stock: 'in-stock', observedAt: '2026-09-01', sourceUrl: 'https://example.test/amd', status: 'verified' },
    { id: 'p-m', deviceId: 'apple', market: 'TR', currency: 'TRY', amount: 50_000, taxBasis: 'vat-included', shipping: 'excluded', stock: 'in-stock', observedAt: '2026-09-01', sourceUrl: 'https://example.test/apple', status: 'verified' },
  ],
  devices: [
    { id: 'n-low', maker: 'N', name: 'N low', ecosystem: 'nvidia', category: 'desktop-reference', processor: 'x', accelerator: 'RTX', memory: { totalGiB: 16, usableGiB: 15, unified: false }, powerW: { idle: 20, max: 300 }, network: ['1GbE'], formFactor: 'tower', os: ['linux'], runtimes: ['ollama'], noiseClass: 'audible', workloadFit: { text: 70, vision: 65, image: 80, video: 70, audio: 70 }, sourceIds: [] },
    { id: 'n-high', maker: 'N', name: 'N high', ecosystem: 'nvidia', category: 'ai-cube', processor: 'x', accelerator: 'GB10', memory: { totalGiB: 128, usableGiB: 110, unified: true }, powerW: { idle: 15, max: 170 }, network: ['10GbE'], formFactor: 'cube', os: ['linux'], runtimes: ['ollama'], noiseClass: 'quiet', workloadFit: { text: 94, vision: 92, image: 90, video: 88, audio: 91 }, sourceIds: [] },
    { id: 'amd', maker: 'A', name: 'AMD node', ecosystem: 'amd', category: 'mini-pc', processor: 'AI Max+ 395', accelerator: 'Radeon 8060S', memory: { totalGiB: 128, usableGiB: 110, unified: true }, powerW: { idle: 14, max: 160 }, network: ['10GbE'], formFactor: 'mini-pc', os: ['linux'], runtimes: ['llama.cpp'], noiseClass: 'quiet', workloadFit: { text: 86, vision: 84, image: 72, video: 70, audio: 82 }, sourceIds: [] },
    { id: 'apple', maker: 'Apple', name: 'Apple node', ecosystem: 'apple', category: 'mac-studio', processor: 'M5 Max', accelerator: 'Apple GPU', memory: { totalGiB: 128, usableGiB: 112, unified: true }, powerW: { idle: 10, max: 140 }, network: ['10GbE'], formFactor: 'studio', os: ['macos'], runtimes: ['mlx'], noiseClass: 'silent', workloadFit: { text: 91, vision: 90, image: 84, video: 92, audio: 90 }, sourceIds: [] },
  ],
  compatibilities: [],
  benchmarks: [],
  evidence: [],
} satisfies Catalog

const scenario = {
  version: 1,
  market: 'TR',
  currency: 'TRY',
  budget: 150_000,
  workloads: [{ kind: 'text', priority: 5 }, { kind: 'vision', priority: 3 }],
  constraints: { offlineRequired: true, maxPowerW: null, noise: 'quiet', compactOnly: true },
  ownedDeviceIds: [],
  infrastructure: { tenGigabitEthernet: true, nas: true, ups: true },
} satisfies LabScenario

describe('recommendLab', () => {
  it('returns exactly one NVIDIA, one AMD, and one Apple slot', () => {
    const result = recommendLab(scenario, catalog)

    expect(result.slots.map((slot) => slot.ecosystem)).toEqual(['nvidia', 'amd', 'apple'])
  })

  it('uses an owned NVIDIA node at zero acquisition cost', () => {
    const result = recommendLab({ ...scenario, ownedDeviceIds: ['n-high'], budget: 100_000 }, catalog)
    const nvidia = result.slots.find((slot) => slot.ecosystem === 'nvidia')

    expect(nvidia).toMatchObject({ deviceId: 'n-high', acquisitionCost: 0, owned: true })
    expect(result.status).toBe('complete')
  })

  it('fills an ecosystem slot with owned equipment before considering a higher-scoring purchase', () => {
    const result = recommendLab({ ...scenario, ownedDeviceIds: ['n-low'], budget: 200_000 }, catalog)
    const nvidia = result.slots.find((slot) => slot.ecosystem === 'nvidia')

    expect(nvidia).toMatchObject({ deviceId: 'n-low', acquisitionCost: 0, owned: true })
    expect(result.status).toBe('complete')
  })

  it('does not invent an under-budget package when no three-node package fits', () => {
    const result = recommendLab({ ...scenario, budget: 80_000 }, catalog)

    expect(result.status).toBe('phased')
    expect(result.budgetGap).toBeGreaterThan(0)
    expect(result.phases.length).toBeGreaterThan(1)
  })

  it('maximizes the weakest node after workload coverage', () => {
    const result = recommendLab({ ...scenario, budget: 160_000 }, catalog)

    expect(result.slots.find((slot) => slot.ecosystem === 'nvidia')?.deviceId).toBe('n-high')
    expect(result.weakestFitScore).toBeGreaterThan(80)
  })
})
