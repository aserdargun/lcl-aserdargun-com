import { describe, expect, it } from 'vitest'
import { defaultScenario, parseScenarioQuery, serializeScenarioQuery } from './scenario-url'

describe('versioned scenario URLs', () => {
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
