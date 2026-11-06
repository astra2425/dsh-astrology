/** Status card shown when the official Desktop host does not expose Astrology API v1. */
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from './adapter.ts'
import css from './Astrology.module.css'

type Props = PropsRuntime<'settings.section'> & PropsLocale<'brand.astrology'>

/** @param props Slot locale and settings presentation props. @returns Desktop compatibility instructions. */
export function AstrologyUnsupported({ t }: Props) {
  return <section className={css.settings}><header className={css.pageHeader}>
    <h2>{t('unsupportedTitle')}</h2>
    <p>{t('unsupportedBody')}</p>
  </header></section>
}
