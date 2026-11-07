/** Astrology's Web UI and theme contributions, backed by the optional Desktop preload API. */
import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type {} from '@deepseek-ai/dsh-client-ui-theme/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-slots/client'
import type {} from '@deepseek-ai/dsh-client-store/client'
import { mountAstrology } from './astrology/adapter.ts'
import { createRendererAstrology } from './astrology/renderer-api.ts'
import { mountStockSlider } from './astrology/stock-slider.ts'
import { themeOverrides } from './theme/palette.ts'
import { mountPresentation } from './presentation.ts'
import { mountStylesheet } from './stylesheet.ts'
import { isAstrologyCarrier } from './astrology/host-api.ts'

/** Services required by the client-owned theme and settings contributions. */
export const inject = ['locale', 'slots', 'theme']

/** Register the client features on stock hosts and opt into native support when available. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.theme.overrideTokens('dsh-plugin-astrology', themeOverrides), 'Astrology theme tokens')
  ctx.effect(mountStylesheet, 'Astrology stylesheet')
  const bridge = window.dshAstrology
  const native = isAstrologyCarrier(bridge)
  const renderer = native ? undefined : createRendererAstrology()
  const api = renderer?.api ?? bridge!
  if (renderer) ctx.effect(() => renderer.dispose, 'Astrology renderer storage')
  ctx.plugin({ inject: ['locale', 'slots'], apply: child => mountAstrology(child, api, native) })
  ctx.effect(() => mountPresentation(api), 'Astrology presentation')
  if (renderer) ctx.effect(mountStockSlider, 'Astrology reasoning slider')
}
