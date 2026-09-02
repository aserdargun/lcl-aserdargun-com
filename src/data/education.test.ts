import { describe, expect, it } from 'vitest'
import { learnCategories, learnConceptIds, learnConcepts } from './education'

describe('education data', () => {
  it('uses lowercase kebab-case ids and never duplicates them', () => {
    const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    const seen = new Set<string>()
    for (const id of learnConceptIds) {
      expect(id).toMatch(idPattern)
      expect(seen.has(id)).toBe(false)
      seen.add(id)
    }
  })

  it('covers every category referenced by a concept', () => {
    const categoryIds = new Set(learnCategories.map((category) => category.id))
    for (const concept of learnConcepts) {
      expect(categoryIds.has(concept.category)).toBe(true)
    }
  })

  it('provides a non-empty TR and EN translation for every field', () => {
    for (const concept of learnConcepts) {
      for (const locale of ['tr', 'en'] as const) {
        expect(concept.term[locale].length, `${concept.id} term ${locale}`).toBeGreaterThan(0)
        expect(concept.definition[locale].length, `${concept.id} definition ${locale}`).toBeGreaterThan(40)
        expect(concept.example[locale].length, `${concept.id} example ${locale}`).toBeGreaterThan(10)
        expect(concept.whyItMatters[locale].length, `${concept.id} why ${locale}`).toBeGreaterThan(10)
      }
    }
  })

  it('keeps difficulty values in the intro/core/advanced ladder', () => {
    for (const concept of learnConcepts) {
      expect(['intro', 'core', 'advanced']).toContain(concept.difficulty)
    }
  })

  it('orders categories by an explicit `order` value with no gaps', () => {
    const orders = learnCategories.map((category) => category.order).sort((a, b) => a - b)
    expect(orders).toEqual([1, 2, 3, 4, 5])
  })
})
