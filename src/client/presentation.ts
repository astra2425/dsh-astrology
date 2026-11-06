/** Owns client-side presentation state while native windows and media selection remain in Desktop. */
import type { AstrologyCarrier, AstrologyPreferences } from './astrology/host-api.ts'
import { observePreferences } from './astrology/observe.ts'

/** Apply settings to the document and return a disposer for plugin unload. */
export function mountPresentation(api: AstrologyCarrier): () => void {
  const root = document.documentElement
  let live = true
  let visible = true
  let claimingIntro = false
  let media: HTMLImageElement | HTMLVideoElement | undefined
  let mediaKey = ''
  const keys = ['astrology', 'astrologySliderStyle', 'astrologySliderMotion', 'astrologyBackgroundFit']
  const previous = keys.map(key => root.dataset[key])
  root.dataset.astrology = ''

  const layer = document.createElement('div')
  layer.id = 'astrology-workspace-background-layer'
  layer.setAttribute('aria-hidden', 'true')
  document.body.prepend(layer)

  const clearMedia = (): void => {
    if (media instanceof HTMLVideoElement) {
      media.pause()
      media.removeAttribute('src')
      media.load()
    }
    media = undefined
    layer.replaceChildren()
  }
  const play = (video: HTMLVideoElement): void => {
    void video.play().catch((error: unknown) => {
      if (live && media === video) console.warn('Astrology background video did not start', error)
    })
  }
  const render = (view: AstrologyPreferences): void => {
    if (!live) return
    root.dataset.astrologySliderStyle = view.reasoningSliderStyle
    root.dataset.astrologySliderMotion = String(view.reasoningSliderMotion)
    root.dataset.astrologyBackgroundFit = view.backgroundFit
    const nextKey = JSON.stringify([view.backgroundMedia, view.backgroundURL])
    if (nextKey === mediaKey) {
      if (media instanceof HTMLVideoElement) media.loop = view.backgroundLoop
      return
    }
    mediaKey = nextKey
    clearMedia()
    if (view.backgroundURL === null || view.backgroundMedia === null) return
    const isImage = view.backgroundMedia === 'png' || view.backgroundMedia === 'jpg' || view.backgroundMedia === 'webp'
    media = isImage ? document.createElement('img') : document.createElement('video')
    media.className = 'astrology-workspace-background'
    media.src = view.backgroundURL
    if (media instanceof HTMLVideoElement) {
      media.autoplay = visible
      media.muted = true
      media.loop = view.backgroundLoop
      media.playsInline = true
    }
    const current = media
    current.addEventListener('error', () => {
      if (live && media === current) clearMedia()
    }, { once: true })
    const scrim = document.createElement('div')
    scrim.className = 'astrology-workspace-scrim'
    layer.replaceChildren(media, scrim)
    if (visible && media instanceof HTMLVideoElement) play(media)
  }

  const stopSettings = observePreferences(api, render,
    (error: unknown) => { console.warn('Astrology preferences are unavailable', error) })
  const showIntro = (): void => {
    if (!live || claimingIntro) return
    claimingIntro = true
    void Promise.resolve().then(() => live ? api.claimIntro() : false)
      .then(shouldShow => live && shouldShow ? api.presentation(true) : undefined)
      .catch((error: unknown) => { console.warn('Astrology intro could not be opened', error) })
      .finally(() => { claimingIntro = false })
  }
  const stopShown = api.onShown(showIntro)
  const stopVisibility = api.onVisibility(value => {
    if (!live) return
    visible = value
    if (media instanceof HTMLVideoElement) {
      if (visible) play(media)
      else media.pause()
    }
  })

  return () => {
    if (!live) return
    live = false
    stopSettings()
    stopShown()
    stopVisibility()
    void api.presentation(false).catch((error: unknown) => { console.warn('Astrology intro could not be closed during unload', error) })
    clearMedia()
    layer.remove()
    keys.forEach((key, index) => {
      const value = previous[index]
      if (value === undefined) delete root.dataset[key]
      else root.dataset[key] = value
    })
  }
}
