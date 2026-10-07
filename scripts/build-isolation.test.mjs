import assert from 'node:assert/strict'
import { test } from 'node:test'
import { build } from 'vite'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createPitchViteConfig } from '../vite.config.ts'
import { assertChildPath, discoverConfigs, readArtifact, verifyIsolation } from './build-support.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))

test('real production bundles isolate Walmart, Amazon and Mastercard test fixtures', { timeout: 60000 }, async () => {
  const parent = join(root, 'tmp')
  mkdirSync(parent, { recursive: true })
  const directory = mkdtempSync(join(parent, 'isolation-test-'))
  const content = join(directory, 'content')
  mkdirSync(content)
  const generic = JSON.parse(readFileSync(join(root, 'src/content/default.json'), 'utf8'))
  for (const slug of ['default', 'walmart']) {
    writeFileSync(join(content, slug + '.json'), readFileSync(join(root, 'src/content', slug + '.json')))
  }
  for (const [slug, company] of [['amazon', 'Amazon'], ['mastercard', 'Mastercard']]) {
    const marker = company.toUpperCase() + '_TEST_ONLY_PRIVATE_PITCH_CONTENT_9f7a21'
    writeFileSync(join(content, slug + '.json'), JSON.stringify({ ...generic, slug, company, companyShort: company, intro: marker, whyCompany: [marker], canHelp: [{ title: 'Fixture', body: marker }] }))
  }
  try {
    const targets = discoverConfigs(content)
    for (const slug of ['walmart', 'amazon', 'mastercard']) {
      const selected = targets.find(target => target.slug === slug)
      const output = join(directory, selected.route)
      await build({
        ...createPitchViteConfig(slug, content), root, configFile: false, logLevel: 'silent',
        base: '/Abinav-pitch/' + selected.route + '/',
        build: { outDir: output, emptyOutDir: true, sourcemap: false },
      })
      assert.ok(verifyIsolation(output, selected, targets) > 0)
      const text = readArtifact(output)
      assert.ok(text.includes(selected.config.intro))
      for (const other of targets.filter(target => ['walmart', 'amazon', 'mastercard'].includes(target.slug) && target.slug !== slug)) {
        assert.ok(!text.includes(other.config.intro), slug + ' contains unrelated intro')
        // Walmart legitimately names Amazon Redshift. Check the standalone
        // config company value and unique pitch copy, not a vendor substring.
        assert.ok(!text.includes(JSON.stringify(other.company)), slug + ' contains unrelated company config value')
      }
      const html = readFileSync(join(output, 'index.html'), 'utf8')
      assert.ok(html.includes('/Abinav-pitch/' + selected.route + '/assets/'))
      assert.ok(!html.includes('src/content'))
    }
    // Deliberately import a second config: the actual production guard must fail.
    const entry = join(directory, 'leak.mjs')
    writeFileSync(entry, 'import first from ' + JSON.stringify(join(content, 'walmart.json')) + ';import second from ' + JSON.stringify(join(content, 'amazon.json')) + ';console.log(first,second)')
    await assert.rejects(build({
      ...createPitchViteConfig('walmart', content), root, configFile: false, logLevel: 'silent',
      build: { outDir: join(directory, 'leak-output'), emptyOutDir: true, rolldownOptions: { input: entry } },
    }), /Unselected pitch entered the bundle graph/)
  } finally {
    assertChildPath(parent, directory)
    rmSync(directory, { recursive: true, force: true })
  }
})
