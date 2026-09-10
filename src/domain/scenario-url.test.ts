import { describe, expect, it } from 'vitest'
import { defaultScenario, parseScenarioQuery, serializeScenarioQuery } from './scenario-url'

describe('versioned scenario URLs', () => {
  it('does not interpret missing or blank budget as zero', () => {
    for (const query of ['?v=1', '?v=1&budget=', '?v=1&budget=%20']) expect(parseScenarioQuery(query).budget).toBe(defaultScenario.budget)
    expect(parseScenarioQuery('?v=1&budget=0').budget).toBe(0)
  })

  it('rejects prototype property names as markets', () => {
    for (const market of ['constructor', 'toString', '__proto__']) expect(parseScenarioQuery(`?v=1&market=${market}`).market).toBe('TR')
  })

  it('deduplicates workloads and owned devices', () => {
    const parsed = parseScenarioQuery('?v=1&workloads=text:1,text:5&owned=a,a')
    expect(parsed.workloads).toEqual([{ kind: 'text', priority: 5 }])
    expect(parsed.ownedDeviceIds).toEqual(['a'])
  })
  it('round-trips a scenario without including private browser state', () => {
    const scenario = {
      ...defaultScenario,
      market: 'DE' as const,
      currency: 'EUR' as const,
      budget: 9_500,
      workloads: [{ kind: 'vision' as const, priority: 5 }, { kind: 'text' as const, priority: 3 }],
      constraints: { offlineRequired: true, maxPowerW: 480, noise: 'quiet' as const, compactOnly: true },
      ownedDeviceIds: ['nvidia-dgx-spark'],
      infrastructure: { tenGigabitEthernet: true, nas: false, ups: true },
    }

    const query = serializeScenarioQuery(scenario)

    expect(query).toContain('v=1')
    expect(query).not.toContain('lastResult')
    expect(parseScenarioQuery(query)).toEqual(scenario)
  })

  it('fails closed to defaults for an unsupported scenario version', () => {
    expect(parseScenarioQuery('?v=99&market=US&budget=1')).toEqual(defaultScenario)
  })

  it('sanitizes malformed numeric and enum values', () => {
    expect(parseScenarioQuery('?v=1&market=XX&budget=-40&noise=impossible')).toMatchObject({
      market: 'TR',
      currency: 'TRY',
      budget: 250_000,
      constraints: { noise: 'balanced' },
    })
  })
})
