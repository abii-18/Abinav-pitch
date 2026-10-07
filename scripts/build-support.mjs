import { readdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { routeHash } from '../src/routing.ts'

export function validateConfig(config, filename) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) throw new Error(`Invalid config: ${filename}`)
  for (const key of ['slug', 'company', 'role', 'eyebrow', 'intro', 'about']) {
    if (typeof config[key] !== 'string' || !config[key].trim()) throw new Error(`${filename}: missing ${key}`)
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(config.slug)) throw new Error(`${filename}: invalid slug`)
  if (basename(filename, '.json') !== config.slug) throw new Error(`${filename}: filename must match slug ${config.slug}`)
  for (const key of ['whyCompany', 'stack']) {
    if (!Array.isArray(config[key]) || config[key].some(value => typeof value !== 'string')) throw new Error(`${filename}: invalid ${key}`)
  }
  const records = {
    canHelp: ['title', 'body'], evidence: ['metric', 'label', 'detail'],
    projects: ['title', 'description'], career: ['company', 'role', 'dates'], links: ['label', 'href'],
  }
  for (const [key, fields] of Object.entries(records)) {
    if (!Array.isArray(config[key]) || config[key].some(item => !item || fields.some(field => typeof item[field] !== 'string'))) {
      throw new Error(`${filename}: invalid ${key}`)
    }
  }
  if (config.projects.some(project => !Array.isArray(project.tags) || project.tags.some(tag => typeof tag !== 'string'))) throw new Error(`${filename}: invalid project tags`)
  for (const key of ['companyShort', 'introFollowup', 'projectIntro']) {
    if (config[key] !== undefined && typeof config[key] !== 'string') throw new Error(`${filename}: invalid ${key}`)
  }
  if (config.certifications !== undefined && (!Array.isArray(config.certifications) || config.certifications.some(item => !item || typeof item.title !== 'string' || typeof item.year !== 'string'))) throw new Error(`${filename}: invalid certifications`)
  if (config.education !== undefined && (!config.education || ['institution', 'degree', 'date'].some(key => typeof config.education[key] !== 'string'))) throw new Error(`${filename}: invalid education`)
  for (const item of [...config.career, ...config.projects]) {
    if (item.href !== undefined && typeof item.href !== 'string') throw new Error(`${filename}: invalid optional href`)
  }
  return config
}

export function resolvePitchTarget(directory, slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid company selection: ${slug}`)
  const contentRoot = realpathSync(directory)
  const path = realpathSync(join(contentRoot, `${slug}.json`))
  if (dirname(path) !== contentRoot) throw new Error(`Config must stay inside ${contentRoot}`)
  const config = validateConfig(JSON.parse(readFileSync(path, 'utf8')), path)
  return { path, slug: config.slug, company: config.company, route: routeHash(config.company), config }
}

export function discoverConfigs(directory) {
  const targets = readdirSync(directory).filter(name => name.endsWith('.json')).sort()
    .map(name => resolvePitchTarget(directory, basename(name, '.json')))
  if (!targets.some(target => target.slug === 'default')) throw new Error('default.json is required for the root page')
  const routes = new Map()
  for (const target of targets) {
    const existing = routes.get(target.route)
    if (existing) throw new Error(`Route collision ${target.route}: ${existing} and ${target.slug}; deployment aborted`)
    routes.set(target.route, target.slug)
  }
  return targets
}

export function writeCompanyLinks(root, targets) {
  const rows = targets.filter(target => target.slug !== 'default').map(target => {
    const company = target.company.replaceAll('\\', '\\\\').replaceAll('|', '\\|').replace(/[\r\n]+/g, ' ')
    return `| ${company} | https://abii-18.github.io/Abinav-pitch/${target.route}/ |`
  })
  writeFileSync(join(root, 'company-links.md'), ['| Company | Pitch |', '|---|---|', ...rows, ''].join('\n'))
}

export function parseCompanyArgs(args, fallback = 'default') {
  let company = fallback
  let seen = false
  const forwarded = []
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]
    if (arg === '--company' || arg.startsWith('--company=')) {
      if (seen) throw new Error('Select exactly one company')
      seen = true
      company = arg === '--company' ? args[++index] : arg.slice('--company='.length)
      if (!company || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(company)) throw new Error('Use --company <lowercase-slug>')
    } else forwarded.push(arg)
  }
  return { company, forwarded }
}

export function isolationGuard(directory, selectedPath) {
  const contentRoot = resolve(directory).replaceAll('\\', '/') + '/'
  const selected = resolve(selectedPath).replaceAll('\\', '/')
  return {
    name: 'selected-pitch-isolation',
    generateBundle() {
      for (const moduleId of this.getModuleIds()) {
        const id = moduleId.split('?')[0].replaceAll('\\', '/')
        if (id.startsWith(contentRoot) && id.endsWith('.json') && id !== selected) {
          this.error(`Unselected pitch entered the bundle graph: ${id}`)
        }
      }
    },
  }
}

export function assertChildPath(root, path) {
  const child = relative(resolve(root), resolve(path))
  if (!child || isAbsolute(child) || child === '..' || child.startsWith(`..${sep}`) || resolve(root, child) !== resolve(path)) {
    throw new Error(`Refusing filesystem operation outside output workspace: ${path}`)
  }
}

function strings(value) {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(strings)
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings)
  return []
}

export function readArtifact(directory, skipDirectories = new Set()) {
  let text = ''
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) throw new Error(`Symlink in build output: ${entry.name}`)
    if (entry.isDirectory()) {
      if (!skipDirectories.has(entry.name)) text += readArtifact(join(directory, entry.name), skipDirectories)
    } else {
      if (/\.(json|map)$/i.test(entry.name)) throw new Error(`Raw config or source map in public output: ${entry.name}`)
      if (/\.(html|js|css|txt)$/i.test(entry.name)) text += readFileSync(join(directory, entry.name), 'utf8')
    }
  }
  return text
}

export function verifyIsolation(directory, selected, targets, skipDirectories = new Set()) {
  const artifact = readArtifact(directory, skipDirectories)
  const ownStrings = strings(selected.config)
  const present = value => artifact.includes(value) || artifact.includes(JSON.stringify(value).slice(1, -1))
  if (!present(selected.config.intro)) throw new Error(`${selected.slug}: selected intro missing from generated output`)
  let checked = 0
  for (const other of targets) {
    if (other.slug === selected.slug) continue
    // Shared resume facts are expected; check unique long copy.
    for (const value of new Set(strings(other.config))) {
      if (value.length < 40 || ownStrings.some(own => own.includes(value))) continue
      checked++
      if (present(value)) throw new Error(`${selected.slug}: leaked copy from ${other.slug}`)
    }
  }
  return checked
}
