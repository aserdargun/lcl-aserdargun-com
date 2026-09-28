import { describe, expect, it } from 'vitest'

import { horizonNodes } from './horizon'
import lock from './portfolio.lock.json'

// The canonical manifest lives in the sibling aserdargun-com repo
// (data/living-system.json). src/data/portfolio.lock.json is a committed
// projection of the fields horizon.ts mirrors; refresh it with
// `npm run sync:portfolio`. CI has no network access, so this lock is the
// contract these assertions run against.
interface LockedApplication {
  code: string
  address: string
  title: { en: string; tr: string }
}

const locked = lock.applications as LockedApplication[]
const lockedByCode = new Map(locked.map((application) => [application.code, application]))

describe('horizon nodes against the canonical portfolio lock', () => {
  it('stamps the lock with its canonical source', () => {
    expect(lock.source).toBe('aserdargun-com/data/living-system.json')
  })

  it('resolves every node id against the lock', () => {
    for (const node of horizonNodes) {
      expect(lockedByCode.has(node.id), `${node.id} is not in portfolio.lock.json`).toBe(true)
    }
  })

  it('mirrors the locked id set exactly, so an add or a removal cannot slip through', () => {
    expect(horizonNodes.map((node) => node.id).sort()).toEqual(locked.map((app) => app.code).sort())
  })

  it('uses the canonical address for every node url', () => {
    for (const node of horizonNodes) {
      expect(node.url, `${node.id} url must equal the canonical manifest address`).toBe(
        lockedByCode.get(node.id)?.address,
      )
    }
  })

  it('mirrors the canonical bilingual titles, and keeps local blurbs out of the contract', () => {
    for (const node of horizonNodes) {
      const application = lockedByCode.get(node.id)
      expect(node.title.en, `${node.id} English title drifted from the manifest`).toBe(
        application?.title.en,
      )
      expect(node.title.tr, `${node.id} Turkish title drifted from the manifest`).toBe(
        application?.title.tr,
      )
    }
    for (const application of locked) {
      expect(Object.keys(application)).toEqual(['code', 'address', 'title'])
    }
  })
})
