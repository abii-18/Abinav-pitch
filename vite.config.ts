import { defineConfig, type UserConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { resolvePitchTarget, isolationGuard } from './scripts/build-support.mjs'

const contentDirectory = fileURLToPath(new URL('./src/content/', import.meta.url))

export function createPitchViteConfig(company = 'default', directory = contentDirectory): UserConfig {
  const target = resolvePitchTarget(directory, company)
  return {
    plugins: [react(), isolationGuard(directory, target.path), {
      name: 'opaque-directory-preview',
      configurePreviewServer(server) {
        server.middlewares.use((request, response, next) => {
          const url = new URL(request.url || '/', 'http://localhost')
          const base = server.config.base
          const route = url.pathname.startsWith(base) ? url.pathname.slice(base.length) : ''
          if (/^\d{6}$/.test(route) && existsSync(resolve(server.config.root, server.config.build.outDir, route, 'index.html'))) {
            response.writeHead(301, { Location: `${url.pathname}/${url.search}` })
            response.end()
          } else next()
        })
      },
    }],
    resolve: { alias: [{ find: /^@selected-pitch$/, replacement: target.path }] },
    base: process.env.GITHUB_ACTIONS ? '/Abinav-pitch/' : '/',
    // Public files bypass the module graph; keep private configs/docs out.
    publicDir: false,
    build: { sourcemap: false },
  }
}

export default defineConfig(() => createPitchViteConfig(process.env.BUILD_TARGET || 'default'))
