import { build } from 'vite'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertChildPath, discoverConfigs, verifyIsolation } from './build-support.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const require = createRequire(import.meta.url)
const args = process.argv.slice(2)
let base = process.env.GITHUB_ACTIONS ? '/Abinav-pitch/' : '/'
if (args.length) {
  if (args.length === 2 && args[0] === '--base') base = args[1]
  else if (args.length === 1 && args[0].startsWith('--base=')) base = args[0].slice(7)
  else throw new Error('Usage: npm run build:all -- [--base /Abinav-pitch/]')
}
if (!/^\/(?:[a-zA-Z0-9_-]+\/)*$/.test(base)) throw new Error('Base must be an absolute URL path ending with /')
const targets = discoverConfigs(join(root, 'src/content'))
const compiler = join(dirname(require.resolve('typescript/package.json')), 'bin/tsc')
const check = spawnSync(process.execPath, [compiler, '-b'], { cwd: root, stdio: 'inherit' })
if (check.error) throw check.error
if (check.status !== 0) process.exit(check.status || 1)

const tempRoot = join(root, 'tmp')
mkdirSync(tempRoot, { recursive: true })
const stage = mkdtempSync(join(tempRoot, 'pitch-build-'))
const artifact = join(stage, 'artifact')
const destination = join(root, 'dist')
const backup = join(stage, 'previous-dist')
const previousTarget = process.env.BUILD_TARGET
let published = false
function clearOutputContents(directory) {
  for (const name of readdirSync(directory)) {
    const child = join(directory, name)
    assertChildPath(directory, child)
    rmSync(child, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
  }
}
try {
  const defaultTarget = targets.find(target => target.slug === 'default')
  const jobs = [{ target: defaultTarget, output: artifact, base }, ...targets.map(target => ({ target, output: join(artifact, target.route), base: `${base}${target.route}/` }))]
  for (const job of jobs) {
    process.env.BUILD_TARGET = job.target.slug
    await build({ root, configFile: join(root, 'vite.config.ts'), base: job.base, build: { outDir: job.output, emptyOutDir: true, sourcemap: false } })
    const checked = verifyIsolation(job.output, job.target, targets)
    console.log(`Verified ${job.target.slug}: ${job.base} (${checked} unrelated-copy checks)`)
  }
  // A neutral 404 downloads no company bundle and publishes no route mappings.
  writeFileSync(join(artifact, '404.html'), '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found | Abinav S</title><body><main><h1>Page not found</h1><p>This pitch link may be incomplete or no longer available.</p><a href="' + base + '">Visit Abinav’s portfolio</a></main></body></html>\n')
  writeFileSync(join(artifact, '.nojekyll'), '')
  verifyIsolation(artifact, defaultTarget, targets, new Set(targets.map(target => target.route)))
  assertChildPath(root, destination)
  if (existsSync(destination)) {
    if (lstatSync(destination).isSymbolicLink()) throw new Error('Refusing to replace symlinked dist directory')
    cpSync(destination, backup, { recursive: true })
  }
  // Assemble and validate everything before touching dist. Retain its root
  // directory for Windows watchers; a complete backup supports rollback.
  mkdirSync(destination, { recursive: true })
  try {
    clearOutputContents(destination)
    cpSync(artifact, destination, { recursive: true })
  } catch (error) {
    clearOutputContents(destination)
    if (existsSync(backup)) cpSync(backup, destination, { recursive: true })
    throw error
  }
  published = true
  console.log(`Published local dist: generic root + ${targets.length} isolated opaque routes. No route manifest emitted.`)
} finally {
  if (previousTarget === undefined) delete process.env.BUILD_TARGET
  else process.env.BUILD_TARGET = previousTarget
  assertChildPath(tempRoot, stage)
  if (published) rmSync(stage, { recursive: true, force: true })
  else console.error(`Build failed; staging and any backup retained for diagnostics: ${stage}`)
}
