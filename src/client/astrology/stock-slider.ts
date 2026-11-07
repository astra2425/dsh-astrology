/** Enhance the stock model-effort pane while keeping selection in the Host's own buttons. */
export function mountStockSlider(): () => void {
  let control: HTMLLabelElement | undefined
  let options: HTMLButtonElement[] = []
  let frame = 0
  const sync = () => {
    frame = 0
    const trigger = document.querySelector<HTMLElement>(
      'button[aria-expanded="true"][aria-controls]:has([class*="_triggerEffort"])',
    )
    const id = trigger?.getAttribute('aria-controls')
    const menu = id && document.getElementById(id)
    const pane = menu && menu.matches('[data-menu-material][role="menu"]') ? menu : undefined
    const choices = pane ? [...pane.querySelectorAll<HTMLButtonElement>(
      ':scope > button[role="menuitemradio"][aria-checked]:not([id])',
    )] : []
    if (choices.length < 2 || !pane) {
      control?.remove()
      control = undefined
      options = []
      return
    }
    if (!control?.isConnected || control.parentElement !== pane ||
        choices.length !== options.length || choices.some((item, i) => item !== options[i])) {
      control?.remove()
      options = choices
      control = document.createElement('label')
      control.className = 'dsh-astrology-effort'
      const caption = document.createElement('span')
      const range = document.createElement('input')
      range.type = 'range'
      range.min = '0'
      range.max = String(choices.length - 1)
      range.step = '1'
      range.setAttribute('aria-label', document.documentElement.lang.startsWith('zh') ? '思考强度' : 'Reasoning effort')
      const describe = () => {
        const name = choices[Number(range.value)]?.textContent?.trim() ?? ''
        caption.textContent = name
        range.setAttribute('aria-valuetext', name)
      }
      range.addEventListener('input', describe)
      range.addEventListener('change', () => {
        const option = choices[Number(range.value)]
        if (option?.isConnected && !option.disabled) option.click()
      })
      range.addEventListener('keydown', event => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) event.stopPropagation()
      })
      range.value = String(Math.max(0, choices.findIndex(item => item.getAttribute('aria-checked') === 'true')))
      describe()
      control.append(caption, range)
      pane.insertBefore(control, choices[0])
    }
    const range = control.querySelector('input')!
    range.disabled = choices.some(item => item.disabled)
  }
  const observer = new MutationObserver(() => { if (!frame) frame = requestAnimationFrame(sync) })
  observer.observe(document.body, { childList: true, subtree: true, attributes: true,
    attributeFilter: ['aria-controls', 'aria-expanded', 'aria-checked', 'disabled'] })
  sync()
  return () => { observer.disconnect(); cancelAnimationFrame(frame); control?.remove() }
}
