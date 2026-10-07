import { useEffect, type ReactNode } from 'react'
import { ArrowUpRight, ExternalLink, Globe, Mail } from 'lucide-react'
import defaultConfig from './content/default.json'
import { getRoute, pitchHref, routeHash } from './routing'
import type { PitchConfig } from './types'

const configs: Record<string, PitchConfig> = { default: defaultConfig }

function SectionHeading({ children }: { children: ReactNode }) {
  return <div className="section-heading"><h2>{children}</h2></div>
}

function ContactIcon({ label }: { label: string }) {
  if (label === 'GitHub') return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.24c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.6-2.8 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.31c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" /></svg>
  if (label === 'LinkedIn') return <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM3.56 20.45h3.56V9H3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z" /></svg>
  const Icon = label === 'Portfolio' ? Globe : Mail
  return <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
}

export default function App() {
  const baseUrl = import.meta.env.BASE_URL
  const route = getRoute(window.location.pathname, baseUrl)
  const isHome = route === ''
  const config = isHome ? configs.default : Object.values(configs).find(item => routeHash(item.company) === route)

  useEffect(() => {
    document.title = !config ? 'Page not found | Abinav S' : isHome ? 'Abinav S | Data Engineer' : `Abinav S × ${config.company} | Data Engineer`
    document.querySelector('meta[name="description"]')?.setAttribute('content', config?.intro ?? 'This pitch page could not be found. Visit Abinav’s data engineering portfolio.')
  }, [config, isHome])

  if (!config) return <div className="site-shell"><main id="main" className="hero"><p className="kicker">Page not found</p><h1>Let’s find<br /><em>the right page.</em></h1><p className="hero-copy">This pitch link may be incomplete or no longer available.</p><a className="text-link" href={baseUrl}>Visit Abinav’s portfolio <ArrowUpRight size={18} /></a></main></div>

  const navItems = [[isHome ? 'My approach' : `Why ${config.company}`, 'why'], ['Where I can help', 'help'], ['Achievements', 'evidence'], ['Projects', 'build']]
  return <div className="site-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="topbar">
      <a className="brand" href={isHome ? baseUrl : pitchHref(config.company, baseUrl)}>Abinav<span>.</span></a>
      <nav aria-label="Page sections">{navItems.map(([label, id]) => <a href={`#${id}`} key={id}>{label}</a>)}</nav>
    </header>
    <main id="main">
      <section className="hero"><div className="kicker"><span className="live-dot" />{config.eyebrow}</div><p className="hero-pretitle">{isHome ? 'Hello, I’m Abinav.' : `Hello, ${config.companyShort ?? config.company}.`}</p><h1>{isHome ? <>Build data systems.<br /><em>Make them dependable.</em></> : <>Let’s build<br /><em>reliable data together.</em></>}</h1><p className="hero-copy">{config.intro}</p><div className="hero-meta"><span>{config.role}</span></div></section>
      <section id="about" className="section about-section"><SectionHeading>Experience</SectionHeading><div className="about-grid"><div><p className="about-copy">{config.about}</p><div className="stack" aria-label="Production technologies">{config.stack.map(item => <span key={item}>{item}</span>)}</div></div><div className="career">{config.career.map(item => <div className="career-row" key={`${item.company}-${item.dates}`}><div>{item.href ? <a href={item.href} target="_blank" rel="noreferrer"><strong>{item.company} <ExternalLink size={12} /></strong></a> : <strong>{item.company}</strong>}<span>{item.role}</span></div><span className="career-dates">{item.dates}</span></div>)}</div></div></section>
      <section id="why" className="section"><SectionHeading>{isHome ? 'How I approach data engineering' : `Why ${config.company}`}</SectionHeading><div className="prose">{config.whyCompany.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div></section>
      <section id="help" className="section"><SectionHeading>Where I could contribute</SectionHeading><div className="help-grid">{config.canHelp.map(item => <article className="help-card" key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></section>
      <section id="evidence" className="section"><SectionHeading>Key achievements</SectionHeading><div className="evidence-grid">{config.evidence.map(item => <article className="evidence-card" key={item.label}><strong>{item.metric}</strong><span>{item.label}</span><p>{item.detail}</p></article>)}</div></section>
      <section id="build" className="section"><SectionHeading>What I’ve built</SectionHeading><p className="section-lead">A personal project applying the same focus on dependable workflows, data quality and useful downstream models.</p><div className="project-list">{config.projects.map(project => {
        const content = <><div><h3>{project.title} {project.href && <ExternalLink size={14} aria-hidden="true" />}</h3><p>{project.description}</p><div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div>{project.href && <ArrowUpRight className="arrow" size={20} aria-hidden="true" />}</>
        return project.href ? <a className="project" href={project.href} target="_blank" rel="noreferrer" key={project.title}>{content}</a> : <article className="project" key={project.title}>{content}</article>
      })}</div></section>
      {(config.certifications?.length || config.education) && <section className="section"><SectionHeading>Certifications & education</SectionHeading><div className="credentials-grid"><div>{config.certifications?.map(item => <div className="credential" key={item.title}><h3>{item.title}</h3><span>{item.year}</span></div>)}</div>{config.education && <div className="education"><h3>{config.education.institution}</h3><p>{config.education.degree}</p><span>{config.education.date}</span></div>}</div></section>}
      <section className="contact section"><div><span className="contact-label">Say hello</span><h2>Let’s build<br /><em>something useful.</em></h2></div><div className="contact-links">{config.links.map(link => <a href={link.href} target={link.href.startsWith('mailto:') ? undefined : '_blank'} rel="noreferrer" aria-label={link.label} title={link.label} key={link.label}><ContactIcon label={link.label} /></a>)}</div></section>
    </main>
    <footer><span>{isHome ? 'Reliable pipelines. Data you can trust.' : `A focused case for ${config.company}.`}</span><span>© {new Date().getFullYear()} Abinav S</span></footer>
  </div>
}
