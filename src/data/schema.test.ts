import { describe, expect, it } from 'vitest'
import { catalogSchema, modelReleaseSchema } from './schema'

const validModel = {
  id: 'openai-gpt-oss-20b',
  publisher: 'OpenAI',
  family: 'gpt-oss',
  name: 'gpt-oss-20b',
  revision: 'official-release',
  modalities: ['text', 'code', 'reasoning'],
  parameterCountB: 20,
  activeParameterCountB: 3.6,
  license: { name: 'Apache 2.0', spdx: 'Apache-2.0', url: 'https://www.apache.org/licenses/LICENSE-2.0', commercialUse: true },
  gated: false,
  remoteCode: 'not-required',
  offline: 'supported',
  telemetry: 'runtime-dependent',
  modelCardUrl: 'https://huggingface.co/openai/gpt-oss-20b',
  sourceUrl: 'https://openai.com/open-models/',
  lastVerifiedAt: '2026-09-01',
  recommendationEligible: true,
  artifacts: [{
    id: 'gpt-oss-20b-mxfp4',
    format: 'safetensors',
    quantization: 'MXFP4',
    fileSizeGiB: 12.1,
    sha256: 'a'.repeat(64),
    provenance: 'publisher',
    contextTokens: 131072,
    sourceUrl: 'https://huggingface.co/openai/gpt-oss-20b',
  }],
}

describe('catalog schema', () => {
  it('accepts a complete official model record', () => {
    expect(modelReleaseSchema.safeParse(validModel).success).toBe(true)
  })

  it('rejects a recommendation artifact without publisher or reproducible provenance', () => {
    const candidate = structuredClone(validModel)
    candidate.artifacts[0].provenance = 'community'

    expect(modelReleaseSchema.safeParse(candidate).success).toBe(false)
  })

  it('rejects malformed artifact hashes', () => {
    const candidate = structuredClone(validModel)
    candidate.artifacts[0].sha256 = 'not-a-sha-256'

    expect(modelReleaseSchema.safeParse(candidate).success).toBe(false)
  })

  it('rejects a catalog with a dangling device price', () => {
    const result = catalogSchema.safeParse({
      schemaVersion: '1.0.0',
      snapshotId: 'fixture',
      generatedAt: '2026-09-01T02:30:00.000Z',
      sources: [],
      models: [validModel],
      devices: [],
      prices: [{
        id: 'dangling', deviceId: 'missing', market: 'TR', currency: 'TRY', amount: 1,
        taxBasis: 'vat-included', shipping: 'excluded', stock: 'in-stock', observedAt: '2026-09-01',
        sourceUrl: 'https://example.test', status: 'verified',
      }],
      compatibilities: [],
      benchmarks: [],
      evidence: [],
    })

    expect(result.success).toBe(false)
  })
})
