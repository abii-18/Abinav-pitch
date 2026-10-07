export function routeHash(company: string) {
  const source = `abinav|pitch-desk|data engineer|${company}`.toLowerCase()
  let hash = 2166136261
  for (const character of source) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return String(Math.abs(hash) % 1_000_000).padStart(6, '0')
}

export function getRoute(pathname: string, baseUrl: string): string | null {
  const basePath = baseUrl.replace(/\/$/, '')
  if (pathname === basePath || pathname === `${basePath}/`) return ''
  if (basePath && !pathname.startsWith(`${basePath}/`)) return null
  const route = pathname.slice(basePath.length).replace(/^\//, '').replace(/\/$/, '')
  return route.includes('/') ? null : route
}

export function pitchHref(company: string, baseUrl: string) {
  return `${baseUrl.replace(/\/$/, '')}/${routeHash(company)}`
}

// Directory builds accept their root; single-company previews also accept
// the selected company's existing opaque route, never a different pitch.
export function acceptsPitchPath(pathname: string, baseUrl: string, company: string) {
  const route = getRoute(pathname, baseUrl)
  if (route === '') return true
  const hash = routeHash(company)
  const directoryBuild = baseUrl.replace(/\/$/, '').endsWith(`/${hash}`)
  return !directoryBuild && route === hash
}
