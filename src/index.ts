/** Astrology activates the official Desktop implementation only while this bundle is mounted. */
import type { Context } from '@deepseek-ai/cordis'

export const name = 'dsh-plugin-astrology'
export const inject: string[] = []

interface DesktopAstrologyService {
  readonly apiVersion: 1
  activate(): () => void
}

function isDesktopAstrologyService(value: unknown): value is DesktopAstrologyService {
  return typeof value === 'object' && value !== null
    && 'apiVersion' in value && value.apiVersion === 1
    && 'activate' in value && typeof value.activate === 'function'
}

/** Activate native windows and safe routes only while the bundle is loaded. */
export function apply(ctx: Context): void {
  const candidate: unknown = ctx.get('desktopAstrology', false)
  if (!isDesktopAstrologyService(candidate)) return
  ctx.effect(() => candidate.activate(), 'Astrology Desktop capability')
}
