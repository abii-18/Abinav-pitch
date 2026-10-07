export type Link = { label: string; href: string }

export type PitchConfig = {
  slug: string
  company: string
  companyShort?: string
  role: string
  eyebrow: string
  intro: string
  introFollowup?: string
  whyCompany: string[]
  canHelp: { title: string; body: string }[]
  evidence: { metric: string; label: string; detail: string }[]
  projectIntro?: string
  projects: { title: string; description: string; tags: string[]; href?: string }[]
  about: string
  career: { company: string; role: string; dates: string; href?: string }[]
  stack: string[]
  links: Link[]
  certifications?: { title: string; year: string }[]
  education?: { institution: string; degree: string; date: string }
}
