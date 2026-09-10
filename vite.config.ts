import path from 'node:path'
import { watch } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), {
    name: 'accepted-snapshot-reload',
    configureServer(server) {
      if (server.config.mode === 'test') return
      let pending: ReturnType<typeof setTimeout> | undefined
      const dataRoot = path.resolve(import.meta.dirname, 'public/data')
      const watcher = watch(dataRoot, { recursive: true }, (_event, file) => {
        if (!file || (file !== 'v1' && !file.startsWith(`v1${path.sep}`))) return
        clearTimeout(pending)
        pending = setTimeout(() => {
          server.moduleGraph.invalidateAll()
          server.ws.send({ type: 'full-reload' })
        }, 150)
      })
      watcher.unref()
      server.httpServer?.once('close', () => { clearTimeout(pending); watcher.close() })
    },
  }],
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    globals: true,
  },
})
