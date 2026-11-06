/** Astrology's Web UI and theme contributions, backed by the optional Desktop preload API. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots/client'
import type {} from '@deepseek-ai/dsh-client-store/client'
import './astrology/presentation.css'
import { en, mountAstrology, zh } from './astrology/adapter.ts'
import { AstrologyUnsupported } from './astrology/Unsupported.tsx'
import { themeOverrides } from './theme/palette.ts'
import { mountPresentation } from './presentation.ts'
import { mountStylesheet } from './stylesheet.ts'
import { isAstrologyCarrier } from './astrology/host-api.ts'

/** Services required by the client-owned theme and settings contributions. */
export const inject = ['locale', 'slots', 'theme']
const NS = 'brand.astrology'

/** Register theme, brand and settings only when the versioned Desktop bridge is available. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.theme.overrideTokens('dsh-plugin-astrology', themeOverrides), 'Astrology theme tokens')
  ctx.effect(mountStylesheet, 'Astrology stylesheet')
  const api = window.dshAstrology
  if (!isAstrologyCarrier(api)) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'Astrology compatibility copy')
    const t = ctx.locale.bind(NS)
    ctx.slots.inject('settings.section', () => ctx.slots.register({
      name: 'settings.section', id: 'astrology', order: 12, label: () => t('nav'), locale: NS,
    }, AstrologyUnsupported))
    return
  }

  ctx.plugin({ inject: ['locale', 'slots'], apply: child => mountAstrology(child, api) })
  ctx.effect(() => mountPresentation(api), 'Astrology Desktop presentation')
}
