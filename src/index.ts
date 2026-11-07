/** Astrology activates the official Desktop implementation only while this bundle is mounted. */
import type { Context } from '@deepseek-ai/cordis'
import { launchWindowsPet } from './windows-pet.ts'

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
export function apply(ctx: Context, config?: { desktopPet?: boolean }): void {
  const candidate: unknown = ctx.get('desktopAstrology', false)
  if (isDesktopAstrologyService(candidate)) {
    ctx.effect(() => candidate.activate(), 'Astrology Desktop capability')
  } else if (process.platform === 'win32' &&
      (config?.desktopPet === true || process.env.DSH_ASTROLOGY_DESKTOP_PET === '1')) {
    ctx.effect(() => {
      try { return launchWindowsPet() }
      catch (error) { console.warn('Astrology companion failed to start:', error) }
    }, 'Astrology Windows companion')
  }
}
