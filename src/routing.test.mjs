import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getRoute, pitchHref, routeHash } from './routing.ts'

test('home and pitch routes respect the deployed repository path', () => {
  const base = '/Abinav-pitch/'
  assert.equal(getRoute('/Abinav-pitch/', base), '')
  assert.equal(getRoute('/Abinav-pitch', base), '')
  const href = pitchHref('Your team', base)
  assert.equal(getRoute(href, base), routeHash('Your team'))
  assert.equal(getRoute(`${href}/`, base), routeHash('Your team'))
  assert.equal(getRoute('/another-repo/123456', base), null)
  assert.equal(getRoute('/Abinav-pitching/123456', base), null)
  assert.equal(getRoute(`${href}/extra`, base), null)
})

test('local routes and hashes remain stable and company-specific', () => {
  assert.equal(getRoute('/', '/'), '')
  assert.equal(getRoute('/123456', '/'), '123456')
  assert.equal(pitchHref('Your team', '/'), `/${routeHash('Your team')}`)
  assert.match(routeHash('Your team'), /^\d{6}$/)
  assert.equal(routeHash('Your team'), routeHash('YOUR TEAM'))
  assert.notEqual(routeHash('Your team'), routeHash('Another company'))
})
