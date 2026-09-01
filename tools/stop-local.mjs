import { execFileSync } from 'node:child_process'
import { realpathSync } from 'node:fs'

const root = realpathSync(process.cwd())
const port = Number.parseInt(process.env.CODEX_LOCAL_PORT ?? '4173', 10)

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  console.error(`Invalid local port: ${process.env.CODEX_LOCAL_PORT}`)
  process.exit(1)
}

function lsof(args) {
  try {
    return execFileSync('lsof', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  } catch (error) {
    if (error.status === 1) return ''
    throw error
  }
}

function listenerPids() {
  const output = lsof(['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t'])
  if (!output) return []
  return [...new Set(output.split(/\s+/).map(Number).filter(Number.isInteger))]
}

function processCwd(pid) {
  const output = lsof(['-a', '-p', String(pid), '-d', 'cwd', '-Fn'])
  const cwd = output.split('\n').find((line) => line.startsWith('n'))?.slice(1)
  if (!cwd) return null
  try {
    return realpathSync(cwd)
  } catch {
    return null
  }
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

async function waitForPortToClose(timeoutMilliseconds) {
  const deadline = Date.now() + timeoutMilliseconds
  while (Date.now() < deadline) {
    if (listenerPids().length === 0) return true
    await delay(100)
  }
  return listenerPids().length === 0
}

const pids = listenerPids()
if (pids.length === 0) {
  console.log(`Port ${port} is already free; nothing to stop.`)
  process.exit(0)
}

const listeners = pids.map((pid) => ({ pid, cwd: processCwd(pid) }))
const foreign = listeners.filter(({ cwd }) => cwd !== root)
if (foreign.length > 0) {
  for (const { pid, cwd } of foreign) {
    console.error(`Refusing to stop listener ${pid} on port ${port}; cwd is ${cwd ?? 'unresolved'}, expected ${root}.`)
  }
  process.exit(1)
}

for (const { pid } of listeners) {
  try {
    process.kill(pid, 'SIGTERM')
  } catch (error) {
    if (error.code !== 'ESRCH') throw error
  }
}

if (!(await waitForPortToClose(5_000))) {
  const verifiedPids = new Set(listeners.map(({ pid }) => pid))
  for (const pid of listenerPids()) {
    if (!verifiedPids.has(pid) || processCwd(pid) !== root) continue
    try {
      process.kill(pid, 'SIGKILL')
    } catch (error) {
      if (error.code !== 'ESRCH') throw error
    }
  }
}

if (!(await waitForPortToClose(2_000))) {
  console.error(`Port ${port} is still in use after stopping verified checkout-owned listeners.`)
  process.exit(1)
}

console.log(`Stopped checkout-owned listener${listeners.length === 1 ? '' : 's'} on port ${port}.`)
