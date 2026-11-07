import type { AstrologyClient, AstrologyPreferences } from './host-api.ts'
import { showWorkspaceIntro } from './intro.ts'

const key = 'dsh-plugin-astrology.preferences.v1'
const formats = new Map<string, NonNullable<AstrologyPreferences['backgroundMedia']>>([
  ['image/png', 'png'], ['image/jpeg', 'jpg'], ['image/webp', 'webp'],
  ['video/mp4', 'mp4'], ['video/webm', 'webm'],
])
const defaults: AstrologyPreferences = {
  brandChinese: '星术', brandEnglish: 'ASTROLOGY', backgroundFit: 'cover', backgroundLoop: true,
  backgroundMedia: null, backgroundURL: null, introEnabled: false, playFull: false,
  videoSound: false, startupDisplay: 'window', videoFit: 'contain', reasoningSliderStyle: 'codex',
  reasoningSliderMotion: true, petEnabled: false, media: null, mediaURL: null,
}

/** Stock Desktop mode uses only the renderer's own storage and standard file picker. */
export function createRendererAstrology(): { api: AstrologyClient; dispose: () => void } {
  let view = { ...defaults }
  let initial: Promise<void> | undefined
  let database: Promise<IDBDatabase> | undefined
  let disposed = false
  let cancelPicker: (() => void) | undefined
  let closeIntro: (() => void) | undefined
  let introClaimed = false
  let presentationGeneration = 0
  const listeners = new Set<(view: AstrologyPreferences) => void>()
  const publish = (): AstrologyPreferences => {
    for (const listener of listeners) listener(view)
    return view
  }
  const open = () => database ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('dsh-plugin-astrology', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('media')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  }).catch(error => { database = undefined; throw error })

  async function mediaStorage(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest): Promise<unknown> {
    const db = await open()
    if (disposed) throw Error('Astrology was unloaded')
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('media', mode)
      const request = operation(transaction.objectStore('media'))
      transaction.oncomplete = () => resolve(request.result)
      transaction.onabort = () => reject(transaction.error)
    })
  }

  function setMedia(blob?: Blob): AstrologyPreferences {
    const format = blob && formats.get(blob.type)
    const previous = view.backgroundURL
    view = { ...view, backgroundMedia: format || null, backgroundURL: format ? URL.createObjectURL(blob!) : null }
    if (previous) URL.revokeObjectURL(previous)
    return view
  }

  function setIntro(blob?: Blob): void {
    const previous = view.mediaURL
    const media = blob?.type === 'video/mp4' ? 'mp4' : blob?.type === 'video/webm' ? 'webm' : null
    view = { ...view, media, mediaURL: media && blob ? URL.createObjectURL(blob) : null }
    if (previous) URL.revokeObjectURL(previous)
  }

  const state = async (): Promise<AstrologyPreferences> => {
    initial ??= (async () => {
      let saved: Partial<AstrologyPreferences> | null = null
      try { saved = JSON.parse(localStorage.getItem(key) ?? 'null') } catch { /* defaults */ }
      if (saved) {
        if (typeof saved.brandChinese === 'string' && saved.brandChinese.trim()) view.brandChinese = saved.brandChinese.slice(0, 24)
        if (typeof saved.brandEnglish === 'string') view.brandEnglish = saved.brandEnglish.slice(0, 32)
        if (saved.backgroundFit === 'contain') view.backgroundFit = 'contain'
        if (saved.backgroundLoop === false) view.backgroundLoop = false
        view.introEnabled = saved.introEnabled === true
        view.videoSound = saved.videoSound === true
        if (saved.videoFit === 'cover') view.videoFit = 'cover'
        if (saved.reasoningSliderStyle === 'stage' || saved.reasoningSliderStyle === 'minimal') {
          view.reasoningSliderStyle = saved.reasoningSliderStyle
        }
        view.reasoningSliderMotion = saved.reasoningSliderMotion !== false
      }
      const [media, intro] = await Promise.all(['background', 'intro'].map(name =>
        mediaStorage('readonly', store => store.get(name)).catch(() => undefined)))
      if (!disposed && media instanceof Blob) setMedia(media)
      if (!disposed && intro instanceof Blob) setIntro(intro)
    })()
    await initial
    return view
  }

  function pick(accept: string): Promise<File | undefined> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = accept
      input.hidden = true
      document.body.append(input)
      const finish = (file?: File) => { input.remove(); cancelPicker = undefined; resolve(file) }
      cancelPicker = () => finish()
      input.addEventListener('change', () => finish(input.files?.[0]), { once: true })
      input.addEventListener('cancel', cancelPicker, { once: true })
      try { input.click() } catch (error) { input.remove(); cancelPicker = undefined; reject(error) }
    })
  }

  const api: AstrologyClient = {
    state,
    onSettings(listener) { listeners.add(listener); return () => { listeners.delete(listener) } },
    async configure(changes) {
      await state()
      if (disposed) throw Error('Astrology was unloaded')
      const { brandChinese, brandEnglish, backgroundFit, backgroundLoop, introEnabled, videoSound, videoFit,
        reasoningSliderStyle, reasoningSliderMotion } = { ...view, ...changes }
      const preferences = { brandChinese: brandChinese.trim().slice(0, 24) || defaults.brandChinese,
        brandEnglish: brandEnglish.trim().slice(0, 32), backgroundFit, backgroundLoop,
        introEnabled, videoSound, videoFit, reasoningSliderStyle, reasoningSliderMotion }
      localStorage.setItem(key, JSON.stringify(preferences))
      view = { ...view, ...preferences }
      return publish()
    },
    async chooseBackground() {
      const file = await pick([...formats.keys()].join(','))
      if (!file || disposed) return view
      if (!formats.has(file.type) || file.size === 0 || file.size > 128 * 1024 * 1024) throw Error('Unsupported background file')
      await state()
      await mediaStorage('readwrite', store => store.put(file, 'background'))
      if (!disposed) { setMedia(file); publish() }
      return view
    },
    async clearBackground() {
      await state()
      await mediaStorage('readwrite', store => store.delete('background'))
      if (!disposed) { setMedia(); publish() }
      return view
    },
    onVisibility(listener) {
      const sync = () => listener(!document.hidden)
      document.addEventListener('visibilitychange', sync)
      sync()
      return () => document.removeEventListener('visibilitychange', sync)
    },
    onShown(listener) {
      let subscribed = true
      queueMicrotask(() => { if (subscribed && !disposed) listener() })
      return () => { subscribed = false }
    },
    async claimIntro() {
      await state()
      if (disposed || introClaimed) return false
      introClaimed = true
      return view.introEnabled
    },
    async presentation(enabled) {
      const generation = ++presentationGeneration
      closeIntro?.()
      closeIntro = undefined
      if (!enabled || disposed) return
      await state()
      if (!disposed && generation === presentationGeneration) {
        closeIntro = showWorkspaceIntro(view)
      }
    },
    toggleFullscreen: async () => {},
    async chooseVideo() {
      const file = await pick('video/mp4,video/webm')
      if (!file || disposed) return view
      if (!['video/mp4', 'video/webm'].includes(file.type) || file.size === 0 || file.size > 128 * 1024 * 1024) {
        throw Error('Unsupported intro video')
      }
      await state()
      await mediaStorage('readwrite', store => store.put(file, 'intro'))
      if (!disposed) { setIntro(file); publish() }
      return view
    },
    async clearVideo() {
      await state()
      await mediaStorage('readwrite', store => store.delete('intro'))
      if (!disposed) { setIntro(); publish() }
      return view
    },
  }
  return { api, dispose: () => {
    disposed = true
    cancelPicker?.()
    closeIntro?.()
    listeners.clear()
    if (view.backgroundURL) URL.revokeObjectURL(view.backgroundURL)
    if (view.mediaURL) URL.revokeObjectURL(view.mediaURL)
    void database?.then(db => db.close(), () => undefined)
  } }
}
