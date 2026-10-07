import assert from 'node:assert/strict'
import { test } from 'node:test'
import { acceptsPitchPath, getRoute, pitchHref, routeHash } from './routing.ts'

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


test('Walmart and default links remain deterministic on local and Pages routes', () => {
  assert.equal(routeHash('Walmart'), '822123')
  assert.equal(routeHash('Your team'), '312011')
  assert.equal(routeHash('Walmart'), routeHash('WALMART'))
  assert.match(routeHash('Walmart'), /^\d{6}$/)
  assert.notEqual(routeHash('Walmart'), routeHash('Your team'))
  for (const base of ['/', '/Abinav-pitch/']) {
    const walmart = pitchHref('Walmart', base)
    assert.equal(getRoute(base, base), '')
    assert.equal(getRoute(walmart, base), routeHash('Walmart'))
    assert.equal(getRoute(`${walmart}/`, base), routeHash('Walmart'))
    assert.equal(getRoute(`${walmart}/extra`, base), null)
    assert.equal(getRoute(pitchHref('Your team', base), base), routeHash('Your team'))
  }
})

test('isolated company directory accepts its root and rejects other or nested routes', () => {
  for (const base of ['/822123/', '/Abinav-pitch/822123/']) {
    assert.equal(acceptsPitchPath(base, base, 'Walmart'), true)
    assert.equal(acceptsPitchPath(base.slice(0, -1), base, 'Walmart'), true)
    assert.equal(acceptsPitchPath(base + '822123/', base, 'Walmart'), false)
    assert.equal(acceptsPitchPath('/Abinav-pitch/312011/', base, 'Walmart'), false)
    assert.equal(acceptsPitchPath(base + 'extra', base, 'Walmart'), false)
  }
})

test('single-company preview renders only selected root and opaque route', () => {
  assert.equal(acceptsPitchPath('/', '/', 'Walmart'), true)
  assert.equal(acceptsPitchPath('/822123', '/', 'Walmart'), true)
  assert.equal(acceptsPitchPath('/822123/', '/', 'Walmart'), true)
  assert.equal(acceptsPitchPath('/312011', '/', 'Walmart'), false)
  assert.equal(acceptsPitchPath('/walmart', '/', 'Walmart'), false)
  assert.equal(acceptsPitchPath('/Abinav-pitch/822123', '/Abinav-pitch/', 'Walmart'), true)
  assert.equal(acceptsPitchPath('/Abinav-pitch/312011', '/Abinav-pitch/', 'Walmart'), false)
  assert.equal(acceptsPitchPath('/Abinav-pitch/', '/Abinav-pitch/', 'Your team'), true)
  assert.equal(acceptsPitchPath('/Abinav-pitch/312011/', '/Abinav-pitch/', 'Your team'), true)
})
