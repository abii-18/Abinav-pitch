import type { Plugin } from 'vite'
export type PitchTarget = { path: string; slug: string; company: string; route: string; config: Record<string, unknown> }
export function resolvePitchTarget(directory: string, slug: string): PitchTarget
export function isolationGuard(directory: string, selectedPath: string): Plugin
