import { labScenarioSchema, type Catalog, type DeviceSku, type Ecosystem, type ExclusionReason, type LabPackage, type LabRecommendation, type LabScenario, type MarketPrice, type RecommendationSlot, type Workload } from '@/data/schema'

const ecosystemOrder: Ecosystem[] = ['nvidia', 'amd', 'apple']

interface Candidate extends RecommendationSlot {
  device: DeviceSku
  valueIndex: number
}

export function recommendationPrice(deviceId: string, scenario: LabScenario, catalog: Catalog) {
  const taxBasis = scenario.market === 'US' ? 'sales-tax-excluded' : 'vat-included'
  return catalog.prices.filter((price) => price.deviceId === deviceId && price.market === scenario.market
    && price.currency === scenario.currency && price.taxBasis === taxBasis
    && price.status !== 'quarantined' && price.stock !== 'out-of-stock')
    .sort((left, right) => right.observedAt.localeCompare(left.observedAt) || left.amount - right.amount)[0]
}

export function eligibleModelMatches(deviceId: string, scenario: LabScenario, catalog: Catalog) {
  return catalog.compatibilities.filter((edge) => edge.deviceId === deviceId
    && ['fits', 'verified'].includes(edge.status)
    && catalog.models.some((model) => model.id === edge.modelId && model.recommendationEligible
      && (!scenario.constraints.offlineRequired || model.offline === 'supported')))
}

export function deviceExclusions(device: DeviceSku, scenario: LabScenario, catalog: Catalog): ExclusionReason[] {
  const reasons: ExclusionReason[] = []
  if (device.acquisitionScope === 'component' && !scenario.ownedDeviceIds.includes(device.id)) reasons.push('host')
  if (scenario.constraints.compactOnly && device.category === 'desktop-reference') reasons.push('compact')
  if (scenario.constraints.maxPowerW !== null && (device.powerW.scope !== 'system'
    || device.powerW.max === null || device.powerW.max > scenario.constraints.maxPowerW)) reasons.push('power')
  if (scenario.constraints.offlineRequired && !eligibleModelMatches(device.id, scenario, catalog).length) reasons.push('offline')
  if (!scenario.ownedDeviceIds.includes(device.id) && !recommendationPrice(device.id, scenario, catalog)) reasons.push('price')
  return reasons
}

function weightedWorkloadFit(device: DeviceSku, scenario: LabScenario) {
  const weighted = scenario.workloads.reduce((total, workload) => total + device.workloadFit[workload.kind] * workload.priority, 0)
  const priorities = scenario.workloads.reduce((total, workload) => total + workload.priority, 0)
  return weighted / priorities
}

function physicalFit(device: DeviceSku, scenario: LabScenario) {
  let score = 100
  if (scenario.constraints.noise === 'silent' && device.noiseClass !== 'silent') score -= 35
  if (scenario.constraints.noise === 'quiet' && !['silent', 'quiet'].includes(device.noiseClass)) score -= 25
  return Math.max(0, score)
}

function fitScore(device: DeviceSku, price: MarketPrice | undefined, scenario: LabScenario) {
  const coverage = weightedWorkloadFit(device, scenario)
  const usableMemory = device.memory.usableGiB ?? device.memory.totalGiB * 0.8
  const memoryContext = Math.min(100, (usableMemory / 96) * 100)
  const runtimeEvidence = device.runtimes.length > 0 ? 88 : 20
  const physical = physicalFit(device, scenario)
  const freshness = price?.status === 'verified' ? 100 : price?.status === 'reference' ? 70 : 35
  return Math.round(coverage * 0.4 + memoryContext * 0.25 + runtimeEvidence * 0.2 + physical * 0.1 + freshness * 0.05)
}

function candidatesForEcosystem(ecosystem: Ecosystem, scenario: LabScenario, catalog: Catalog): Candidate[] {
  const candidates = catalog.devices
    .filter((device) => device.ecosystem === ecosystem && deviceExclusions(device, scenario, catalog).length === 0)
    .map((device) => {
      const owned = scenario.ownedDeviceIds.includes(device.id)
      const price = recommendationPrice(device.id, scenario, catalog)
      if (!owned && !price) return null
      const workloadCoverage = weightedWorkloadFit(device, scenario)
      const acquisitionCost = owned ? 0 : price?.amount ?? Number.POSITIVE_INFINITY
      const score = fitScore(device, price, scenario)
      return {
        ecosystem,
        deviceId: device.id,
        acquisitionCost,
        owned,
        fitScore: score,
        workloadCoverage: Math.round(workloadCoverage),
        valueIndex: acquisitionCost === 0 ? score : score / acquisitionCost,
        device,
      }
    })
    .filter((candidate): candidate is Candidate => candidate !== null)

  const ownedCandidates = candidates.filter((candidate) => candidate.owned)
  return ownedCandidates.length > 0 ? ownedCandidates : candidates
}

function cartesian<T>(groups: T[][]): T[][] {
  return groups.reduce<T[][]>((result, group) => result.flatMap((prefix) => group.map((item) => [...prefix, item])), [[]])
}

function comparePackages(left: Candidate[], right: Candidate[]) {
  const metrics = (items: Candidate[]) => ({
    coverage: items.reduce((sum, item) => sum + item.workloadCoverage, 0) / items.length,
    weakest: Math.min(...items.map((item) => item.fitScore)),
    value: items.reduce((sum, item) => sum + item.valueIndex, 0),
    cost: items.reduce((sum, item) => sum + item.acquisitionCost, 0),
  })
  const a = metrics(left)
  const b = metrics(right)
  return b.coverage - a.coverage || b.weakest - a.weakest || b.value - a.value || a.cost - b.cost
}

function createRecommendation(selected: Candidate[], scenario: LabScenario): LabPackage {
  const totalCost = selected.reduce((sum, slot) => sum + slot.acquisitionCost, 0)
  const status = totalCost <= scenario.budget ? 'complete' : 'phased'
  const phases = [...selected]
    .sort((left, right) => Number(right.owned) - Number(left.owned) || left.acquisitionCost - right.acquisitionCost)
    .map((slot, index) => ({ order: index + 1, deviceId: slot.deviceId, ecosystem: slot.ecosystem, acquisitionCost: slot.acquisitionCost }))

  return {
    status,
    slots: ecosystemOrder.map((ecosystem) => {
      const slot = selected.find((candidate) => candidate.ecosystem === ecosystem)
      if (!slot) throw new Error(`Missing ${ecosystem} recommendation slot`)
      return {
        ecosystem: slot.ecosystem,
        deviceId: slot.deviceId,
        acquisitionCost: slot.acquisitionCost,
        owned: slot.owned,
        fitScore: slot.fitScore,
        workloadCoverage: slot.workloadCoverage,
      }
    }),
    totalCost,
    budgetGap: Math.max(0, totalCost - scenario.budget),
    weakestFitScore: Math.min(...selected.map((slot) => slot.fitScore)),
    workloadCoverage: Math.round(selected.reduce((sum, slot) => sum + slot.workloadCoverage, 0) / selected.length),
    phases,
  }
}

export function recommendLab(scenario: LabScenario, catalog: Catalog): LabRecommendation {
  labScenarioSchema.parse(scenario)
  const groups = ecosystemOrder.map((ecosystem) => candidatesForEcosystem(ecosystem, scenario, catalog))
  if (groups.some((group) => group.length === 0)) return {
    status: 'ineligible',
    exclusions: ecosystemOrder.filter((_, index) => groups[index].length === 0).map((ecosystem) => ({
      ecosystem,
      reasons: [...new Set(catalog.devices.filter((device) => device.ecosystem === ecosystem)
        .flatMap((device) => deviceExclusions(device, scenario, catalog)))],
    })),
  }

  const packages = cartesian(groups)
  const withinBudget = packages.filter((items) => items.reduce((sum, item) => sum + item.acquisitionCost, 0) <= scenario.budget)
  const selected = (withinBudget.length ? withinBudget : packages).sort(comparePackages)[0]
  return createRecommendation(selected, scenario)
}

export function metricForWorkload(workload: Workload) {
  const metrics: Record<Workload, string> = {
    text: 'tokens-per-second / TTFT',
    vision: 'tokens-per-second / TTFT',
    image: 'images-per-minute',
    video: 'output-seconds-per-minute',
    audio: 'inverse-real-time-factor',
  }
  return metrics[workload]
}
