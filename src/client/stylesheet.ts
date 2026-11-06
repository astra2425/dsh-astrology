/** Build placeholder replaced with the CSS bundle by scripts/embed-css.mjs. */
export const ASTROLOGY_CSS = '__ASTROLOGY_CSS_INLINE__'

/** Settings and compatibility styles also belong to clients without Desktop support. */
export function mountStylesheet(): () => void {
  const style = document.createElement('style')
  style.dataset.plugin = 'dsh-plugin-astrology'
  style.dataset.pluginCss = '@dsh-external/dsh-plugin-astrology'
  style.textContent = ASTROLOGY_CSS
  document.head.append(style)
  return () => style.remove()
}
