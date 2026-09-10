import { describe, expect, it } from 'vitest'
import { horizonNodes } from './horizon'

describe('horizon data', () => {
  it('identifies USL and HNS as learning and harness tools', () => {
    expect(horizonNodes.find((node) => node.id === 'usl')?.title.en).toBe('Unsloth Studio Learning Atlas')
    expect(horizonNodes.find((node) => node.id === 'hns')?.title.en).toBe('Harness Engineering Observatory')
  })
  it('uses https URLs and lowercase ids for every sibling node', () => {
    const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    const seen = new Set<string>()
    for (const node of horizonNodes) {
      expect(node.id).toMatch(idPattern)
      expect(seen.has(node.id)).toBe(false)
      seen.add(node.id)
      expect(node.url.startsWith('https://'), `${node.id} must use https`).toBe(true)
      expect(node.url.endsWith('/'), `${node.id} must end with a trailing slash for canonical normalization`).toBe(true)
    }
  })

  it('provides non-empty TR and EN copy for every node', () => {
    for (const node of horizonNodes) {
      expect(node.title.tr.length).toBeGreaterThan(0)
      expect(node.title.en.length).toBeGreaterThan(0)
      expect(node.blurb.tr.length).toBeGreaterThan(10)
      expect(node.blurb.en.length).toBeGreaterThan(10)
    }
  })

  it('does not list LCL itself as a sibling node', () => {
    expect(horizonNodes.some((node) => node.id === 'lcl')).toBe(false)
  })
})
