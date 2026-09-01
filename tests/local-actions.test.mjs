import assert from 'node:assert/strict'
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync } from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'))
const listenerSource = `
  const net = require('node:net')
  const server = net.createServer()
  server.listen(Number(process.env.TEST_PORT), '127.0.0.1', () => process.stdout.write('ready\\n'))
  process.on('SIGTERM', () => server.close(() => process.exit(0)))
`

function reservePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      server.close((error) => error ? reject(error) : resolve(address.port))
    })
  })
}

function startListener(cwd, port) {
  const child = spawn(process.execPath, ['-e', listenerSource], {
    cwd,
    env: { ...process.env, TEST_PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`listener did not start on ${port}`)), 5_000)
    child.once('error', reject)
    child.stdout.on('data', (chunk) => {
      if (!chunk.toString().includes('ready')) return
      clearTimeout(timer)
      resolve(child)
    })
  })
}

function runStop(port) {
  return spawnSync(process.execPath, ['tools/stop-local.mjs'], {
    cwd: root,
    env: { ...process.env, CODEX_LOCAL_PORT: String(port) },
    encoding: 'utf8',
    timeout: 10_000,
  })
}

function isRunning(child) {
  return child.exitCode === null && child.signalCode === null
}

function waitForExit(child) {
  if (!isRunning(child)) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`process ${child.pid} did not exit`)), 2_000)
    child.once('exit', () => {
      clearTimeout(timer)
      resolve()
    })
  })
}

test('Codex environment delegates Setup, Run, Validate, and Stop to repository commands', () => {
  const config = readFileSync(path.join(root, '.codex/environments/environment.toml'), 'utf8')
  const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))

  assert.match(config, /^version = 1$/m)
  assert.match(config, /^name = "LCL — Local Compute Lab"$/m)
  assert.match(config, /\[setup\]\nscript = "npm ci && npx playwright install chromium"/)

  const actionNames = [...config.matchAll(/^name = "(Run|Validate|Stop)"$/gm)].map((match) => match[1])
  assert.deepEqual(actionNames, ['Run', 'Validate', 'Stop'])
  assert.match(config, /name = "Run"[\s\S]*?command = "npm run run:local"/)
  assert.match(config, /name = "Validate"[\s\S]*?command = "npm run validate"/)
  assert.match(config, /name = "Stop"[\s\S]*?command = "npm run stop:local"/)

  assert.equal(packageJson.scripts['run:local'], 'npm run stop:local && vite --host 127.0.0.1 --port 4173 --strictPort')
  assert.equal(packageJson.scripts['stop:local'], 'node tools/stop-local.mjs')
  assert.equal(packageJson.scripts.validate, 'npm run stop:local && npm run check && npm run test:e2e && git diff --check')
})

test('production headers block framing and unneeded browser capabilities', () => {
  const swaConfig = JSON.parse(readFileSync(path.join(root, 'public/staticwebapp.config.json'), 'utf8'))
  assert.match(swaConfig.globalHeaders['Content-Security-Policy'], /frame-ancestors 'none'/)
  assert.match(swaConfig.globalHeaders['Permissions-Policy'], /microphone=\(\)/)
  assert.match(swaConfig.globalHeaders['Content-Security-Policy'], /font-src 'self' data:/)
})

test('package lock contains the native Rollup package required by the Linux CI runner', () => {
  const packageLock = JSON.parse(readFileSync(path.join(root, 'package-lock.json'), 'utf8'))
  const linuxRollup = packageLock.packages['node_modules/@rollup/rollup-linux-x64-gnu']

  assert.ok(linuxRollup, 'Linux x64 Rollup package is missing from package-lock.json')
  assert.deepEqual(linuxRollup.os, ['linux'])
  assert.deepEqual(linuxRollup.cpu, ['x64'])
})

test('Azure production workflow validates and uploads only the prebuilt dist artifact', () => {
  const workflowPath = path.join(root, '.github/workflows/deploy-swa-lcl-aserdargun-com.yml')
  assert.ok(existsSync(workflowPath), 'Azure production workflow is missing')

  const workflow = readFileSync(workflowPath, 'utf8')
  const actionReferences = [...workflow.matchAll(/^\s+(?:- )?uses: ([^\s#]+)/gm)].map((match) => match[1])

  assert.match(workflow, /push:\n\s+branches: \[main\]/)
  assert.match(workflow, /workflow_dispatch:/)
  assert.match(workflow, /group: swa-lcl-aserdargun-com-production/)
  assert.match(workflow, /cancel-in-progress: false/)
  assert.match(workflow, /permissions:\n\s+contents: read/)
  assert.ok(actionReferences.length >= 3)
  assert.ok(actionReferences.every((reference) => /@[0-9a-f]{40}$/.test(reference)))
  assert.match(workflow, /run: npm ci/)
  assert.match(workflow, /run: npx playwright install --with-deps chromium/)
  assert.match(workflow, /run: npm run validate/)
  assert.match(workflow, /azure_static_web_apps_api_token: \$\{\{ secrets\.AZURE_STATIC_WEB_APPS_API_TOKEN_SWA_LCL_ASERDARGUN_COM \}\}/)
  assert.match(workflow, /action: upload/)
  assert.match(workflow, /app_location: dist/)
  assert.match(workflow, /skip_app_build: true/)
  assert.match(workflow, /output_location: ""/)
})

test('Stop terminates a listener owned by this checkout', async (t) => {
  const port = await reservePort()
  const child = await startListener(root, port)
  t.after(() => {
    if (isRunning(child)) child.kill('SIGKILL')
  })

  const result = runStop(port)

  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.match(result.stdout, /Stopped checkout-owned listener/)
  await waitForExit(child)
  assert.equal(isRunning(child), false)
})

test('Stop refuses a listener owned by another working directory', async (t) => {
  const foreignDirectory = mkdtempSync(path.join(os.tmpdir(), 'lcl-foreign-'))
  const port = await reservePort()
  const child = await startListener(foreignDirectory, port)
  t.after(() => {
    if (isRunning(child)) child.kill('SIGKILL')
    rmSync(foreignDirectory, { recursive: true, force: true })
  })

  const result = runStop(port)

  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /Refusing to stop listener/)
  assert.equal(isRunning(child), true)
})
