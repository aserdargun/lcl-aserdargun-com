import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { publishSnapshot } from '../../scripts/publish-snapshot'

const roots: string[] = []
afterEach(() => { for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true }) })

function fixture() {
  const root = mkdtempSync(path.join(os.tmpdir(), 'lcl-snapshot-'))
  roots.push(root)
  for (const directory of ['public/data/v1', '.lcl-refresh/candidate-v1', '.lcl-refresh/candidate-root']) mkdirSync(path.join(root, directory), { recursive: true })
  for (const file of ['public/data/v1/catalog.json', 'public/manifest.json', 'public/changes.json']) writeFileSync(path.join(root, file), 'old')
  for (const file of ['.lcl-refresh/candidate-v1/catalog.json', '.lcl-refresh/candidate-root/manifest.json', '.lcl-refresh/candidate-root/changes.json']) writeFileSync(path.join(root, file), 'new')
  return root
}

describe('snapshot publication rollback', () => {
  it('publishes catalog and both aliases together', () => {
    const root = fixture()
    publishSnapshot(root)
    for (const file of ['public/data/v1/catalog.json', 'public/manifest.json', 'public/changes.json']) expect(readFileSync(path.join(root, file), 'utf8')).toBe('new')
  })

  it('preserves the live catalog when backup copying fails before any rename', () => {
    const root = fixture()
    rmSync(path.join(root, 'public/changes.json'))
    mkdirSync(path.join(root, 'public/changes.json'))
    expect(() => publishSnapshot(root)).toThrow()
    expect(readFileSync(path.join(root, 'public/data/v1/catalog.json'), 'utf8')).toBe('old')
    expect(readFileSync(path.join(root, 'public/manifest.json'), 'utf8')).toBe('old')
  })

  it('restores the old catalog and replaced alias on a partial publish failure', () => {
    const root = fixture()
    rmSync(path.join(root, '.lcl-refresh/candidate-root/changes.json'))
    expect(() => publishSnapshot(root)).toThrow()
    for (const file of ['public/data/v1/catalog.json', 'public/manifest.json', 'public/changes.json']) expect(readFileSync(path.join(root, file), 'utf8')).toBe('old')
  })
})
