import type { AstrologyClient, AstrologyPreferences } from './host-api.ts'

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

  const state = async (): Promise<AstrologyPreferences> => {
    initial ??= (async () => {
      let saved: Partial<AstrologyPreferences> | null = null
      try { saved = JSON.parse(localStorage.getItem(key) ?? 'null') } catch { /* defaults */ }
      if (saved) {
        if (typeof saved.brandChinese === 'string' && saved.brandChinese.trim()) view.brandChinese = saved.brandChinese.slice(0, 24)
        if (typeof saved.brandEnglish === 'string') view.brandEnglish = saved.brandEnglish.slice(0, 32)
        if (saved.backgroundFit === 'contain') view.backgroundFit = 'contain'
        if (saved.backgroundLoop === false) view.backgroundLoop = false
      }
      const media = await mediaStorage('readonly', store => store.get('background')).catch(() => undefined)
      if (!disposed && media instanceof Blob) setMedia(media)
    })()
    await initial
    return view
  }

  function pick(): Promise<File | undefined> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = [...formats.keys()].join(',')
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
      const { brandChinese, brandEnglish, backgroundFit, backgroundLoop } = { ...view, ...changes }
      const preferences = { brandChinese: brandChinese.trim().slice(0, 24) || defaults.brandChinese,
        brandEnglish: brandEnglish.trim().slice(0, 32), backgroundFit, backgroundLoop }
      localStorage.setItem(key, JSON.stringify(preferences))
      view = { ...view, ...preferences }
      return publish()
    },
    async chooseBackground() {
      const file = await pick()
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
    onShown: () => () => {},
    claimIntro: async () => false,
    presentation: async () => {},
    toggleFullscreen: async () => {},
    chooseVideo: state,
  }
  return { api, dispose: () => {
    disposed = true
    cancelPicker?.()
    listeners.clear()
    if (view.backgroundURL) URL.revokeObjectURL(view.backgroundURL)
    void database?.then(db => db.close(), () => undefined)
  } }
}
