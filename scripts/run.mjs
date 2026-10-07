import { spawn, spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { discoverConfigs, parseCompanyArgs, resolvePitchTarget, writeCompanyLinks } from './build-support.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
const mode = process.argv[2]
if (!['dev', 'build'].includes(mode)) throw new Error('Expected dev or build')
const { company, forwarded } = parseCompanyArgs(process.argv.slice(3), process.env.BUILD_TARGET || 'default')
resolvePitchTarget(join(root, 'src/content'), company)
const env = { ...process.env, BUILD_TARGET: company }
const targets = mode === 'build' ? discoverConfigs(join(root, 'src/content')) : undefined
if (mode === 'build') {
  const compiler = join(dirname(require.resolve('typescript/package.json')), 'bin/tsc')
  const result = spawnSync(process.execPath, [compiler, '-b'], { cwd: root, env, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status || 1)
}
const vite = join(dirname(require.resolve('vite/package.json')), 'bin/vite.js')
const child = spawn(process.execPath, [vite, ...(mode === 'build' ? ['build'] : []), ...forwarded], { cwd: root, env, stdio: 'inherit' })
child.on('error', error => { console.error(error.message); process.exitCode = 1 })
child.on('exit', code => {
  process.exitCode = code ?? 1
  if (code === 0 && mode === 'build') {
    try { writeCompanyLinks(root, targets) } catch (error) { console.error(error.message); process.exitCode = 1 }
  }
})
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))
