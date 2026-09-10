import { z } from 'zod'

export const ecosystemSchema = z.enum(['nvidia', 'amd', 'apple'])
export const marketSchema = z.enum(['TR', 'US', 'DE'])
export const currencySchema = z.enum(['TRY', 'USD', 'EUR'])
export const workloadSchema = z.enum(['text', 'vision', 'image', 'video', 'audio'])
export const modalitySchema = z.enum(['text', 'code', 'reasoning', 'vision', 'image', 'video', 'audio'])
export const compatibilityStatusSchema = z.enum(['verified', 'fits', 'constrained', 'unsupported', 'unknown'])

const httpUrl = z.string().url().refine((value) => value.startsWith('https://'), 'Only HTTPS evidence URLs are accepted')
const sha256 = z.string().regex(/^[a-f0-9]{64}$/i, 'Expected a SHA-256 digest')
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const sourceRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: httpUrl,
  kind: z.enum(['publisher', 'manufacturer', 'retailer', 'runtime', 'benchmark', 'fx']),
  scope: z.array(z.string().min(1)).min(1),
  cadence: z.enum(['daily', 'weekly', 'manual']),
  status: z.enum(['current', 'stale', 'quarantined', 'review']),
  checkedAt: isoDate,
})

export const modelArtifactSchema = z.object({
  id: z.string().min(1),
  format: z.enum(['safetensors', 'gguf', 'mlx', 'onnx', 'other']),
  quantization: z.string().min(1),
  fileSizeGiB: z.number().positive(),
  sha256,
  hashScope: z.enum(['file', 'manifest']).default('file'),
  hashRecipe: z.string().min(1).optional(),
  provenance: z.enum(['publisher', 'reproducible-conversion', 'community']),
  conversionRecipe: z.string().min(1).optional(),
  sourceSha256: sha256.optional(),
  contextTokens: z.number().int().positive().nullable(),
  sourceUrl: httpUrl,
})

export const modelReleaseSchema = z.object({
  id: z.string().min(1),
  publisher: z.string().min(1),
  family: z.string().min(1),
  name: z.string().min(1),
  revision: z.string().min(1),
  modalities: z.array(modalitySchema).min(1),
  parameterCountB: z.number().positive().optional(),
  activeParameterCountB: z.number().positive().optional(),
  license: z.object({
    name: z.string().min(1),
    spdx: z.string().min(1).nullable(),
    url: httpUrl,
    commercialUse: z.boolean().nullable(),
    notes: z.string().optional(),
  }),
  gated: z.boolean(),
  remoteCode: z.enum(['not-required', 'optional', 'required', 'unknown']),
  offline: z.enum(['supported', 'conditional', 'unsupported', 'unknown']),
  telemetry: z.enum(['none-known', 'runtime-dependent', 'required', 'unknown']),
  modelCardUrl: httpUrl,
  safetyUrl: httpUrl.optional(),
  sourceUrl: httpUrl,
  lastVerifiedAt: isoDate,
  recommendationEligible: z.boolean(),
  artifacts: z.array(modelArtifactSchema).min(1),
}).superRefine((model, context) => {
  if (!model.recommendationEligible) return
  for (const [index, artifact] of model.artifacts.entries()) {
    const reproducible = artifact.provenance === 'reproducible-conversion'
      && Boolean(artifact.conversionRecipe)
      && Boolean(artifact.sourceSha256)
    if (artifact.provenance !== 'publisher' && !reproducible) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Recommendation artifacts must be publisher-produced or reproducible from a source hash',
        path: ['artifacts', index, 'provenance'],
      })
    }
  }
})

export const deviceSkuSchema = z.object({
  id: z.string().min(1),
  maker: z.string().min(1),
  name: z.string().min(1),
  ecosystem: ecosystemSchema,
  category: z.enum(['ai-cube', 'mini-pc', 'mac-mini', 'mac-studio', 'desktop-reference']),
  acquisitionScope: z.enum(['system', 'component']).optional(),
  processor: z.string().min(1),
  accelerator: z.string().min(1),
  memory: z.object({
    totalGiB: z.number().positive(),
    usableGiB: z.number().positive().optional(),
    unified: z.boolean(),
  }),
  bandwidthGBs: z.number().positive().optional(),
  powerW: z.object({ idle: z.number().finite().nonnegative().nullable(), max: z.number().finite().positive().nullable(), scope: z.enum(['system', 'component', 'unknown']).optional() }),
  network: z.array(z.string().min(1)).min(1),
  formFactor: z.string().min(1),
  os: z.array(z.string().min(1)).min(1),
  runtimes: z.array(z.string().min(1)).min(1),
  noiseClass: z.enum(['silent', 'quiet', 'audible', 'unknown']),
  workloadFit: z.object({
    text: z.number().min(0).max(100),
    vision: z.number().min(0).max(100),
    image: z.number().min(0).max(100),
    video: z.number().min(0).max(100),
    audio: z.number().min(0).max(100),
  }),
  trainingSupport: z.enum(['verified', 'limited', 'not-assessed']).optional(),
  sourceIds: z.array(z.string()),
})

export const marketPriceSchema = z.object({
  id: z.string().min(1),
  deviceId: z.string().min(1),
  market: marketSchema,
  configuration: z.string().min(1).optional(),
  currency: currencySchema,
  amount: z.number().positive(),
  taxBasis: z.enum(['vat-included', 'vat-excluded', 'sales-tax-excluded', 'unknown']),
  shipping: z.enum(['included', 'excluded', 'unknown']),
  stock: z.enum(['in-stock', 'preorder', 'out-of-stock', 'unknown']),
  observedAt: isoDate,
  sourceUrl: httpUrl,
  status: z.enum(['verified', 'reference', 'stale', 'quarantined']),
  candidateAmount: z.number().positive().optional(),
})

export const compatibilityEdgeSchema = z.object({
  id: z.string().min(1),
  modelId: z.string().min(1),
  artifactId: z.string().min(1),
  deviceId: z.string().min(1),
  runtime: z.string().min(1),
  runtimeVersion: z.string().min(1),
  status: compatibilityStatusSchema,
  contextTokens: z.number().int().positive(),
  concurrency: z.number().int().positive(),
  weightGiB: z.number().positive(),
  kvCacheGiB: z.number().nonnegative(),
  runtimeOverheadGiB: z.number().nonnegative().optional(),
  requiredMemoryGiB: z.number().positive(),
  usableMemoryGiB: z.number().positive(),
  fitScore: z.number().min(0).max(100),
  verifiedAt: isoDate.optional(),
  evidenceIds: z.array(z.string()),
})

export const benchmarkRunSchema = z.object({
  id: z.string().min(1),
  modelId: z.string().min(1),
  artifactId: z.string().min(1),
  deviceId: z.string().min(1),
  runtime: z.string().min(1),
  runtimeVersion: z.string().min(1),
  contextTokens: z.number().int().positive().nullable(),
  powerMode: z.string().min(1).nullable(),
  protocol: z.string().min(1),
  modality: workloadSchema,
  metric: z.enum(['tokens-per-second', 'ttft-ms', 'images-per-minute', 'output-seconds-per-minute', 'inverse-real-time-factor']),
  value: z.number().positive(),
  measuredAt: isoDate,
  reproducible: z.boolean(),
  evidenceIds: z.array(z.string()).min(1),
})

export const evidenceClaimSchema = z.object({
  id: z.string().min(1),
  subjectType: z.enum(['model', 'artifact', 'device', 'price', 'compatibility', 'benchmark', 'runtime']),
  subjectId: z.string().min(1),
  claim: z.string().min(1),
  sourceId: z.string().min(1),
  sourceUrl: httpUrl,
  observedAt: isoDate,
  status: z.enum(['current', 'stale', 'quarantined', 'review']),
  confidence: z.enum(['high', 'medium', 'low']),
})

export const labScenarioSchema = z.object({
  version: z.literal(1),
  market: marketSchema,
  currency: currencySchema,
  budget: z.number().finite().nonnegative(),
  workloads: z.array(z.object({ kind: workloadSchema, priority: z.number().int().min(1).max(5) })).min(1),
  constraints: z.object({
    offlineRequired: z.boolean(),
    maxPowerW: z.number().finite().positive().nullable(),
    noise: z.enum(['silent', 'quiet', 'balanced']),
    compactOnly: z.boolean(),
  }),
  ownedDeviceIds: z.array(z.string()),
  infrastructure: z.object({
    tenGigabitEthernet: z.boolean(),
    nas: z.boolean(),
    ups: z.boolean(),
  }),
}).superRefine((scenario, context) => {
  if (scenario.currency !== ({ TR: 'TRY', US: 'USD', DE: 'EUR' } as const)[scenario.market]) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Currency must match the purchase market', path: ['currency'] })
  }
  if (new Set(scenario.workloads.map((item) => item.kind)).size !== scenario.workloads.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: 'Workloads must be unique', path: ['workloads'] })
  }
})

export const snapshotManifestSchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  snapshotId: z.string().min(1),
  generatedAt: z.string().datetime(),
  sha256,
  bytes: z.number().int().positive(),
  catalogPath: z.literal('/data/v1/catalog.json'),
  changesPath: z.literal('/data/v1/changes.json'),
  appVersion: z.string().min(1),
  sourceStatus: z.object({
    current: z.number().int().nonnegative(),
    stale: z.number().int().nonnegative(),
    quarantined: z.number().int().nonnegative(),
    review: z.number().int().nonnegative(),
  }),
})

export const changeEntrySchema = z.object({
  id: z.string().min(1),
  date: isoDate,
  type: z.enum(['catalog', 'model', 'device', 'price', 'license', 'availability', 'benchmark']),
  severity: z.enum(['info', 'watch', 'review']),
  title: z.object({ tr: z.string().min(1), en: z.string().min(1) }),
  summary: z.object({ tr: z.string().min(1), en: z.string().min(1) }),
  entityIds: z.array(z.string()),
  sourceIds: z.array(z.string()),
})

export const changesFeedSchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  snapshotId: z.string().min(1),
  changes: z.array(changeEntrySchema),
})

const baseCatalogSchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  snapshotId: z.string().min(1),
  generatedAt: z.string().datetime(),
  sources: z.array(sourceRecordSchema),
  models: z.array(modelReleaseSchema),
  devices: z.array(deviceSkuSchema),
  prices: z.array(marketPriceSchema),
  compatibilities: z.array(compatibilityEdgeSchema),
  benchmarks: z.array(benchmarkRunSchema),
  evidence: z.array(evidenceClaimSchema),
})

export const catalogSchema = baseCatalogSchema.superRefine((catalog, context) => {
  const issue = (message: string, path: (string | number)[]) => context.addIssue({ code: z.ZodIssueCode.custom, message, path })
  for (const [collection, records] of Object.entries(catalog)) {
    if (!Array.isArray(records)) continue
    const ids = new Set<string>()
    for (const [index, record] of records.entries()) {
      if (ids.has(record.id)) issue('Duplicate record ID', [collection, index, 'id'])
      ids.add(record.id)
    }
  }
  const deviceIds = new Set(catalog.devices.map((device) => device.id))
  const models = new Map(catalog.models.map((model) => [model.id, model]))
  const sourceIds = new Set(catalog.sources.map((source) => source.id))
  const evidenceIds = new Set(catalog.evidence.map((claim) => claim.id))
  for (const [index, device] of catalog.devices.entries()) {
    if (device.memory.usableGiB && device.memory.usableGiB > device.memory.totalGiB) issue('Usable memory exceeds total memory', ['devices', index, 'memory'])
    for (const id of device.sourceIds) if (!sourceIds.has(id)) issue('Device references a missing source', ['devices', index, 'sourceIds'])
  }
  for (const [index, claim] of catalog.evidence.entries()) {
    if (!sourceIds.has(claim.sourceId)) issue('Evidence references a missing source', ['evidence', index, 'sourceId'])
  }
  for (const [index, price] of catalog.prices.entries()) {
    if (price.currency !== ({ TR: 'TRY', US: 'USD', DE: 'EUR' } as const)[price.market]) issue('Price currency does not match market', ['prices', index, 'currency'])
    if (!deviceIds.has(price.deviceId)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Price references a missing device', path: ['prices', index, 'deviceId'] })
    }
  }
  for (const [index, edge] of catalog.compatibilities.entries()) {
    for (const id of edge.evidenceIds) if (!evidenceIds.has(id)) issue('Compatibility references missing evidence', ['compatibilities', index, 'evidenceIds'])
    if (edge.status === 'verified' && (!edge.verifiedAt || !edge.evidenceIds.length)) issue('Verified compatibility requires dated evidence', ['compatibilities', index, 'status'])
    const model = models.get(edge.modelId)
    if (!deviceIds.has(edge.deviceId)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Compatibility references a missing device', path: ['compatibilities', index, 'deviceId'] })
    }
    if (!model || !model.artifacts.some((artifact) => artifact.id === edge.artifactId)) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'Compatibility references a missing artifact', path: ['compatibilities', index, 'artifactId'] })
    }
  }
  for (const [index, run] of catalog.benchmarks.entries()) {
    if (!deviceIds.has(run.deviceId)) issue('Benchmark references a missing device', ['benchmarks', index, 'deviceId'])
    if (!models.get(run.modelId)?.artifacts.some((artifact) => artifact.id === run.artifactId)) issue('Benchmark references a missing artifact', ['benchmarks', index, 'artifactId'])
    for (const id of run.evidenceIds) if (!evidenceIds.has(id)) issue('Benchmark references missing evidence', ['benchmarks', index, 'evidenceIds'])
  }
})

export type Ecosystem = z.infer<typeof ecosystemSchema>
export type Market = z.infer<typeof marketSchema>
export type Currency = z.infer<typeof currencySchema>
export type Workload = z.infer<typeof workloadSchema>
export type ModelRelease = z.infer<typeof modelReleaseSchema>
export type ModelArtifact = z.infer<typeof modelArtifactSchema>
export type DeviceSku = z.infer<typeof deviceSkuSchema>
export type MarketPrice = z.infer<typeof marketPriceSchema>
export type CompatibilityEdge = z.infer<typeof compatibilityEdgeSchema>
export type BenchmarkRun = z.infer<typeof benchmarkRunSchema>
export type EvidenceClaim = z.infer<typeof evidenceClaimSchema>
export type Catalog = z.infer<typeof catalogSchema>
export type LabScenario = z.infer<typeof labScenarioSchema>
export type SnapshotManifest = z.infer<typeof snapshotManifestSchema>
export type ChangeEntry = z.infer<typeof changeEntrySchema>

export interface RecommendationSlot {
  ecosystem: Ecosystem
  deviceId: string
  acquisitionCost: number
  owned: boolean
  fitScore: number
  workloadCoverage: number
}

export interface LabPackage {
  status: 'complete' | 'phased'
  slots: RecommendationSlot[]
  totalCost: number
  budgetGap: number
  weakestFitScore: number
  workloadCoverage: number
  phases: Array<{ order: number; deviceId: string; ecosystem: Ecosystem; acquisitionCost: number }>
}

export type ExclusionReason = 'compact' | 'power' | 'offline' | 'price' | 'host'
export type LabRecommendation = LabPackage | {
  status: 'ineligible'
  exclusions: Array<{ ecosystem: Ecosystem; reasons: ExclusionReason[] }>
}
