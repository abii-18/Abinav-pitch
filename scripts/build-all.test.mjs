import assert from 'node:assert/strict'
import { test } from 'node:test'
import { preview } from 'vite'
import { createPitchViteConfig } from '../vite.config.ts'
import { spawnSync } from 'node:child_process'
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertChildPath, discoverConfigs, readArtifact, verifyIsolation } from './build-support.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))

test('build:all assembles simultaneous routes, discovers additions and preserves dist after invalid input', { timeout: 60000 }, async () => {
  const parent = join(root, 'tmp')
  mkdirSync(parent, { recursive: true })
  const project = mkdtempSync(join(parent, 'all-build-test-'))
  try {
    for (const file of ['package.json', 'tsconfig.json', 'tsconfig.node.json', 'vite.config.ts', 'index.html']) {
      cpSync(join(root, file), join(project, file))
    }
    cpSync(join(root, 'src'), join(project, 'src'), { recursive: true })
    mkdirSync(join(project, 'scripts'))
    for (const file of ['build-all.mjs', 'build-support.mjs', 'build-support.d.mts']) {
      cpSync(join(root, 'scripts', file), join(project, 'scripts', file))
    }
    // Internal material must stay private even when present beside build inputs.
    for (const directory of ['docs', 'companies/internal', 'public/docs']) {
      mkdirSync(join(project, directory), { recursive: true })
      writeFileSync(join(project, directory, 'target-company-research-2027.md'), 'PRIVATE_RESEARCH_SENTINEL')
    }
    const run = () => spawnSync(process.execPath, ['--experimental-strip-types', join(project, 'scripts/build-all.mjs')], {
      cwd: project, env: { ...process.env, GITHUB_ACTIONS: 'true' }, encoding: 'utf8', timeout: 30000,
    })
    let result = run()
    assert.equal(result.status, 0, result.stdout + result.stderr)
    assert.ok(readFileSync(join(project, 'dist/822123/index.html'), 'utf8').includes('/Abinav-pitch/822123/assets/'))
    const generic = JSON.parse(readFileSync(join(project, 'src/content/default.json'), 'utf8'))
    for (const [slug, company] of [['amazon', 'Amazon'], ['mastercard', 'Mastercard']]) {
      const intro = company.toUpperCase() + '_ASSEMBLED_TEST_PITCH_ONLY_65b7829e'
      writeFileSync(join(project, 'src/content', slug + '.json'), JSON.stringify({ ...generic, slug, company, companyShort: company, intro, whyCompany: [intro] }))
    }
    result = run()
    assert.equal(result.status, 0, result.stdout + result.stderr)
    const targets = discoverConfigs(join(project, 'src/content'))
    assert.equal(targets.length, 4)
    const publicFiles = readdirSync(join(project, 'dist'), { recursive: true, withFileTypes: true })
      .filter(entry => !entry.isDirectory())
      .map(entry => join(entry.parentPath, entry.name).slice(join(project, 'dist').length + 1).replaceAll('\\', '/'))
    for (const path of publicFiles) {
      assert.match(path, /^(?:(?:\d{6}\/)?(?:index\.html|assets\/[^/]+\.(?:js|css))|404\.html|\.nojekyll)$/, `Non-website file in dist: ${path}`)
    }
    assert.ok(!readArtifact(join(project, 'dist')).includes('PRIVATE_RESEARCH_SENTINEL'))
    verifyIsolation(join(project, 'dist'), targets.find(target => target.slug === 'default'), targets, new Set(targets.map(target => target.route)))
    for (const selected of targets) {
      const output = join(project, 'dist', selected.route)
      assert.ok(verifyIsolation(output, selected, targets) > 0)
      assert.ok(readFileSync(join(output, 'index.html'), 'utf8').includes('/Abinav-pitch/' + selected.route + '/assets/'))
    }
    const walmart = targets.find(target => target.slug === 'walmart')
    assert.equal(walmart.route, '822123')
    const rootHtml = readFileSync(join(project, 'dist/index.html'), 'utf8')
    assert.ok(!rootHtml.includes('822123') && !rootHtml.includes('mastercard'))
    const fallback = readFileSync(join(project, 'dist/404.html'), 'utf8')
    assert.ok(!fallback.includes('<script') && !fallback.includes('822123'))
    const server = await preview({ ...createPitchViteConfig('default', join(project, 'src/content')), root: project, configFile: false, base: '/Abinav-pitch/', build: { outDir: join(project, 'dist') }, preview: { host: '127.0.0.1', port: 0 } })
    try {
      const origin = 'http://127.0.0.1:' + server.httpServer.address().port
      const rootResponse = await fetch(origin + '/Abinav-pitch/')
      assert.equal(rootResponse.status, 200)
      const rootAsset = (await rootResponse.text()).match(/src="([^"]+\.js)"/)[1]
      assert.ok(rootAsset.startsWith('/Abinav-pitch/assets/'))
      const rootJavascript = await fetch(origin + rootAsset)
      assert.equal(rootJavascript.status, 200)
      assert.ok((await rootJavascript.text()).includes(generic.intro))
      for (const selected of targets) {
        const response = await fetch(origin + '/Abinav-pitch/' + selected.route + '/')
        assert.equal(response.status, 200)
        const html = await response.text()
        const asset = html.match(/src="([^"]+\.js)"/)[1]
        assert.ok(asset.startsWith('/Abinav-pitch/' + selected.route + '/assets/'))
        const javascript = await fetch(origin + asset)
        assert.equal(javascript.status, 200)
        assert.ok((await javascript.text()).includes(selected.config.intro))
      }
      const existingLink = await fetch(origin + '/Abinav-pitch/822123')
      assert.equal(existingLink.status, 200)
      assert.ok((await existingLink.text()).includes('/Abinav-pitch/822123/assets/'))
    } finally {
      await new Promise((resolve, reject) => server.httpServer.close(error => error ? reject(error) : resolve()))
    }
    const previous = readArtifact(join(project, 'dist/822123'))
    writeFileSync(join(project, 'src/content/broken.json'), '{invalid')
    result = run()
    assert.notEqual(result.status, 0)
    assert.equal(readArtifact(join(project, 'dist/822123')), previous)
  } finally {
    assertChildPath(parent, project)
    rmSync(project, { recursive: true, force: true })
  }
})
