import type { LabScenario } from '@/data/schema'

export const defaultScenario: LabScenario = {
  version: 1,
  market: 'TR',
  currency: 'TRY',
  budget: 250_000,
  workloads: [{ kind: 'text', priority: 5 }, { kind: 'vision', priority: 3 }],
  constraints: { offlineRequired: true, maxPowerW: null, noise: 'balanced', compactOnly: true },
  ownedDeviceIds: [],
  infrastructure: { tenGigabitEthernet: true, nas: true, ups: true },
}

const marketCurrency = { TR: 'TRY', US: 'USD', DE: 'EUR' } as const
const workloadKinds = new Set(['text', 'vision', 'image', 'video', 'audio'])
const noiseOptions = new Set(['silent', 'quiet', 'balanced'])

export function serializeScenarioQuery(scenario: LabScenario) {
  const query = new URLSearchParams()
  query.set('v', '1')
  query.set('market', scenario.market)
  query.set('budget', String(scenario.budget))
  query.set('workloads', scenario.workloads.map(({ kind, priority }) => `${kind}:${priority}`).join(','))
  query.set('offline', scenario.constraints.offlineRequired ? '1' : '0')
  if (scenario.constraints.maxPowerW !== null) query.set('power', String(scenario.constraints.maxPowerW))
  query.set('noise', scenario.constraints.noise)
  query.set('compact', scenario.constraints.compactOnly ? '1' : '0')
  if (scenario.ownedDeviceIds.length) query.set('owned', scenario.ownedDeviceIds.join(','))
  const infrastructure = [
    scenario.infrastructure.tenGigabitEthernet ? '10gbe' : null,
    scenario.infrastructure.nas ? 'nas' : null,
    scenario.infrastructure.ups ? 'ups' : null,
  ].filter(Boolean)
  query.set('infra', infrastructure.join(','))
  return `?${query.toString()}`
}

export function parseScenarioQuery(value: string): LabScenario {
  const query = new URLSearchParams(value.startsWith('?') ? value.slice(1) : value)
  if (query.get('v') !== '1') return structuredClone(defaultScenario)

  const marketValue = query.get('market')
  const market = marketValue && Object.hasOwn(marketCurrency, marketValue) ? marketValue as keyof typeof marketCurrency : defaultScenario.market
  const budgetValue = query.get('budget')?.trim() ? Number(query.get('budget')) : NaN
  const budget = Number.isFinite(budgetValue) && budgetValue >= 0 ? budgetValue : defaultScenario.budget
  const workloadEntries = query.get('workloads')?.split(',').map((entry) => {
    const [kind, priorityText] = entry.split(':')
    const priority = Number(priorityText)
    return workloadKinds.has(kind) && Number.isInteger(priority) && priority >= 1 && priority <= 5
      ? { kind: kind as LabScenario['workloads'][number]['kind'], priority }
      : null
  }).filter((entry): entry is LabScenario['workloads'][number] => Boolean(entry))
  const noiseValue = query.get('noise')
  const noise = noiseValue && noiseOptions.has(noiseValue)
    ? noiseValue as LabScenario['constraints']['noise']
    : defaultScenario.constraints.noise
  const powerValue = query.has('power') ? Number(query.get('power')) : null
  const infrastructure = new Set(query.get('infra')?.split(',').filter(Boolean) ?? [])

  return {
    version: 1,
    market,
    currency: marketCurrency[market],
    budget,
    workloads: workloadEntries?.length ? [...new Map(workloadEntries.map((item) => [item.kind, item])).values()] : structuredClone(defaultScenario.workloads),
    constraints: {
      offlineRequired: query.get('offline') === null ? defaultScenario.constraints.offlineRequired : query.get('offline') === '1',
      maxPowerW: powerValue !== null && Number.isFinite(powerValue) && powerValue > 0 ? powerValue : null,
      noise,
      compactOnly: query.get('compact') === null ? defaultScenario.constraints.compactOnly : query.get('compact') === '1',
    },
    ownedDeviceIds: [...new Set(query.get('owned')?.split(',').filter(Boolean) ?? [])],
    infrastructure: {
      tenGigabitEthernet: query.has('infra') ? infrastructure.has('10gbe') : defaultScenario.infrastructure.tenGigabitEthernet,
      nas: query.has('infra') ? infrastructure.has('nas') : defaultScenario.infrastructure.nas,
      ups: query.has('infra') ? infrastructure.has('ups') : defaultScenario.infrastructure.ups,
    },
  }
}
