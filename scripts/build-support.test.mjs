import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { assertChildPath, discoverConfigs, parseCompanyArgs, resolvePitchTarget, validateConfig } from './build-support.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const template = JSON.parse(readFileSync(join(root, 'src/content/default.json'), 'utf8'))
function withFixture(run) {
  const parent = join(root, 'tmp')
  mkdirSync(parent, { recursive: true })
  const directory = mkdtempSync(join(parent, 'discovery-test-'))
  const save = (slug, company) => writeFileSync(join(directory, slug + '.json'), JSON.stringify({ ...template, slug, company }))
  try { run(directory, save) } finally { assertChildPath(parent, directory); rmSync(directory, { recursive: true, force: true }) }
}

test('discovery includes new JSON configs without a registry and ignores research Markdown', () => withFixture((dir, save) => {
  save('default', 'Your team'); save('walmart', 'Walmart'); save('rapido', 'Rapido')
  writeFileSync(join(dir, 'resume-reference.md'), 'private facts')
  const result = discoverConfigs(dir)
  assert.deepEqual(result.map(item => item.slug), ['default', 'rapido', 'walmart'])
  assert.equal(result.find(item => item.slug === 'walmart').route, '822123')
  assert.equal(result.find(item => item.slug === 'default').route, '312011')
  save('mastercard', 'Mastercard')
  const expanded = discoverConfigs(dir)
  assert.equal(expanded.length, 4)
  assert.equal(expanded.find(item => item.slug === 'walmart').route, '822123')
}))

test('route collisions abort discovery before deployment', () => withFixture((dir, save) => {
  save('default', 'Your team'); save('first', 'Walmart'); save('second', 'WALMART')
  assert.throws(() => discoverConfigs(dir), /Route collision 822123/)
}))

test('missing default, invalid schema, mismatched slug and unsafe selection fail clearly', () => withFixture((dir, save) => {
  save('walmart', 'Walmart')
  assert.throws(() => discoverConfigs(dir), /default.json is required/)
  assert.throws(() => resolvePitchTarget(dir, '../walmart'), /Invalid company/)
  assert.throws(() => validateConfig({ ...template, slug: 'other' }, 'default.json'), /filename must match/)
  assert.throws(() => validateConfig({ ...template, projects: [{ title: 'x', description: 'y' }] }, 'default.json'), /project tags/)
  assert.throws(() => validateConfig({ ...template, company: '' }, 'default.json'), /missing company/)
  assert.throws(() => validateConfig({ ...template, education: {} }, 'default.json'), /invalid education/)
  assert.throws(() => validateConfig({ ...template, certifications: [{}] }, 'default.json'), /invalid certifications/)
  writeFileSync(join(dir, 'bad.json'), '{broken')
  assert.throws(() => resolvePitchTarget(dir, 'bad'), SyntaxError)
}))

test('CLI accepts both company argument forms and forwards Vite flags', () => {
  assert.deepEqual(parseCompanyArgs(['--company', 'walmart', '--host', '127.0.0.1']), { company: 'walmart', forwarded: ['--host', '127.0.0.1'] })
  assert.deepEqual(parseCompanyArgs(['--company=mastercard']), { company: 'mastercard', forwarded: [] })
  assert.deepEqual(parseCompanyArgs([]), { company: 'default', forwarded: [] })
  assert.throws(() => parseCompanyArgs(['--company']), /Use --company/)
  assert.throws(() => parseCompanyArgs(['--company=..']), /Use --company/)
  assert.throws(() => parseCompanyArgs(['--company=walmart', '--company=default']), /exactly one/)
})

test('filesystem cleanup paths must be strict descendants of workspace output root', () => {
  assert.doesNotThrow(() => assertChildPath(root, join(root, 'tmp', 'build')))
  assert.throws(() => assertChildPath(root, root), /Refusing/)
  assert.throws(() => assertChildPath(root, join(root, '..', 'other')), /Refusing/)
  if (process.platform === 'win32') assert.throws(() => assertChildPath(root, 'Z:\\outside-output'), /Refusing/)
})
