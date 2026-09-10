import { copyFileSync, existsSync, mkdirSync, renameSync, rmSync } from 'node:fs'
import path from 'node:path'

export function publishSnapshot(root: string) {
  const stagingRoot = path.join(root, '.lcl-refresh')
  const target = path.join(root, 'public/data/v1')
  const candidate = path.join(stagingRoot, 'candidate-v1')
  const candidateAliases = path.join(stagingRoot, 'candidate-root')
  const backup = path.join(stagingRoot, 'last-good-v1')
  const backupAliases = path.join(stagingRoot, 'last-good-root')
  const aliases = ['manifest.json', 'changes.json']
  let movedLastGood = false
  let installedCandidate = false
  const replacedAliases: string[] = []

  rmSync(backup, { recursive: true, force: true })
  rmSync(backupAliases, { recursive: true, force: true })
  mkdirSync(backupAliases, { recursive: true })
  try {
    for (const name of aliases) {
      const current = path.join(root, 'public', name)
      if (existsSync(current)) copyFileSync(current, path.join(backupAliases, name))
    }
    if (existsSync(target)) {
      renameSync(target, backup)
      movedLastGood = true
    }
    renameSync(candidate, target)
    installedCandidate = true
    for (const name of aliases) {
      renameSync(path.join(candidateAliases, name), path.join(root, 'public', name))
      replacedAliases.push(name)
    }
  } catch (error) {
    // A failure during backup must never delete an untouched live snapshot.
    if (installedCandidate) rmSync(target, { recursive: true, force: true })
    if (movedLastGood) renameSync(backup, target)
    for (const name of replacedAliases) {
      const previous = path.join(backupAliases, name)
      const current = path.join(root, 'public', name)
      if (existsSync(previous)) copyFileSync(previous, current)
      else rmSync(current, { force: true })
    }
    throw error
  }

  // Cleanup happens after commit; failure here cannot invalidate published data.
  for (const directory of [backup, backupAliases, candidateAliases]) {
    try { rmSync(directory, { recursive: true, force: true }) } catch { /* Retain for later cleanup. */ }
  }
}
