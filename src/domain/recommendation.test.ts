import { describe, expect, it } from 'vitest'
import type { Catalog, LabScenario } from '@/data/schema'
import { recommendLab, recommendationPrice } from './recommendation'

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
  constraints: { offlineRequired: false, maxPowerW: null, noise: 'quiet', compactOnly: true },
  ownedDeviceIds: [],
  infrastructure: { tenGigabitEthernet: true, nas: true, ups: true },
} satisfies LabScenario

describe('recommendLab', () => {
  it('returns exactly one NVIDIA, one AMD, and one Apple slot', () => {
    const result = recommendLab(scenario, catalog)
    if (result.status === 'ineligible') throw new Error('Expected an eligible package')

    expect(result.slots.map((slot) => slot.ecosystem)).toEqual(['nvidia', 'amd', 'apple'])
  })

  it('uses an owned NVIDIA node at zero acquisition cost', () => {
    const result = recommendLab({ ...scenario, ownedDeviceIds: ['n-high'], budget: 100_000 }, catalog)
    if (result.status === 'ineligible') throw new Error('Expected an eligible package')
    const nvidia = result.slots.find((slot) => slot.ecosystem === 'nvidia')

    expect(nvidia).toMatchObject({ deviceId: 'n-high', acquisitionCost: 0, owned: true })
    expect(result.status).toBe('complete')
  })

  it('fills an ecosystem slot with owned equipment before considering a higher-scoring purchase', () => {
    const result = recommendLab({ ...scenario, constraints: { ...scenario.constraints, compactOnly: false }, ownedDeviceIds: ['n-low'], budget: 200_000 }, catalog)
    if (result.status === 'ineligible') throw new Error('Expected an eligible package')
    const nvidia = result.slots.find((slot) => slot.ecosystem === 'nvidia')

    expect(nvidia).toMatchObject({ deviceId: 'n-low', acquisitionCost: 0, owned: true })
    expect(result.status).toBe('complete')
  })

  it('does not invent an under-budget package when no three-node package fits', () => {
    const result = recommendLab({ ...scenario, budget: 80_000 }, catalog)
    if (result.status === 'ineligible') throw new Error('Expected an eligible package')

    expect(result.status).toBe('phased')
    expect(result.budgetGap).toBeGreaterThan(0)
    expect(result.phases.length).toBeGreaterThan(1)
  })

  it('maximizes the weakest node after workload coverage', () => {
    const result = recommendLab({ ...scenario, budget: 160_000 }, catalog)
    if (result.status === 'ineligible') throw new Error('Expected an eligible package')

    expect(result.slots.find((slot) => slot.ecosystem === 'nvidia')?.deviceId).toBe('n-high')
    expect(result.weakestFitScore).toBeGreaterThan(80)
  })

  it('does not let owned equipment bypass compact requirements', () => {
    const result = recommendLab({ ...scenario, ownedDeviceIds: ['n-low'] }, catalog)
    expect(result.status).not.toBe('ineligible')
    if (result.status !== 'ineligible') expect(result.slots[0].deviceId).toBe('n-high')
  })

  it('rejects a power limit when total system power is unknown', () => {
    expect(recommendLab({ ...scenario, constraints: { ...scenario.constraints, maxPowerW: 500 } }, catalog).status).toBe('ineligible')
  })

  it('accepts only documented system power within the limit', () => {
    const documented = structuredClone(catalog) as Catalog
    documented.devices.forEach((device) => { device.powerW.scope = 'system' })
    expect(recommendLab({ ...scenario, constraints: { ...scenario.constraints, maxPowerW: 170 } }, documented).status).not.toBe('ineligible')
    expect(recommendLab({ ...scenario, constraints: { ...scenario.constraints, maxPowerW: 169 } }, documented).status).toBe('ineligible')
  })

  it('fails closed when offline model evidence is absent', () => {
    const result = recommendLab({ ...scenario, constraints: { ...scenario.constraints, offlineRequired: true } }, catalog)
    expect(result).toMatchObject({ status: 'ineligible', exclusions: [{ ecosystem: 'nvidia', reasons: expect.arrayContaining(['offline']) }, { ecosystem: 'amd' }, { ecosystem: 'apple' }] })
  })

  it('does not recommend out-of-stock or mismatched-tax purchases', () => {
    const unavailable = structuredClone(catalog) as Catalog
    unavailable.prices.filter((price) => price.deviceId.startsWith('n-')).forEach((price) => { price.stock = 'out-of-stock' })
    expect(recommendLab(scenario, unavailable).status).toBe('ineligible')
    unavailable.prices.forEach((price) => { price.stock = 'in-stock'; price.taxBasis = 'vat-excluded' })
    expect(recommendLab(scenario, unavailable).status).toBe('ineligible')
  })

  it('selects the newest eligible price deterministically', () => {
    const multiple = structuredClone(catalog) as Catalog
    multiple.prices.push({ ...multiple.prices[1], id: 'new', amount: 65_000, observedAt: '2026-09-02' })
    expect(recommendationPrice('n-high', scenario, multiple)?.amount).toBe(65_000)
    expect(recommendationPrice('n-high', scenario, { ...multiple, prices: [...multiple.prices].reverse() })?.amount).toBe(65_000)
  })
})
