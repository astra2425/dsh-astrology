import type { AstrologyClient, AstrologyPreferenceChanges, AstrologyPreferences } from './host-api.ts'

export interface SettingsSnapshot {
  view?: AstrologyPreferences
  draft: { chinese: string; english: string }
  loading: boolean
  busy: boolean
  notice: '' | 'saved' | 'unchanged' | 'failure' | 'loadFailure' | 'previewFailure'
}

/** Own committed host state separately from editable names and in-flight operations. */
export function createSettingsController(api: AstrologyClient) {
  let snapshot: SettingsSnapshot = {
    draft: { chinese: '星术', english: 'ASTROLOGY' }, loading: true, busy: false, notice: '',
  }
  const listeners = new Set<() => void>()
  let active = false
  let generation = 0
  let revision = 0
  let readId = 0
  const publish = (changes: Partial<SettingsSnapshot>): void => {
    snapshot = { ...snapshot, ...changes }
    listeners.forEach(listener => listener())
  }
  const accept = (view: AstrologyPreferences): void => {
    const old = snapshot.view
    const draft = {
      chinese: !old || snapshot.draft.chinese === old.brandChinese ? view.brandChinese : snapshot.draft.chinese,
      english: !old || snapshot.draft.english === old.brandEnglish ? view.brandEnglish : snapshot.draft.english,
    }
    publish({ view, draft, loading: false, notice: '' })
  }
  const refresh = async (): Promise<void> => {
    if (!active || snapshot.busy) return
    const session = generation
    const request = ++readId
    const before = revision
    publish({ loading: true, notice: '' })
    try {
      const view = await api.state()
      if (active && session === generation && request === readId && before === revision) accept(view)
    } catch {
      if (active && session === generation && request === readId && before === revision) {
        publish({ loading: false, notice: 'loadFailure' })
      }
    }
  }
  const run = async (
    operation: () => Promise<AstrologyPreferences | void>,
    kind: 'settings' | 'brand' | 'preview' = 'settings',
  ): Promise<boolean> => {
    if (!active || snapshot.busy || snapshot.loading || !snapshot.view) return false
    const session = generation
    const beforeRevision = revision
    const before = snapshot.view
    publish({ busy: true, notice: '' })
    try {
      const view = await operation()
      if (!active || session !== generation) return false
      if (view && revision === beforeRevision) accept(view)
      if (view && kind === 'brand') {
        const committed = snapshot.view!
        publish({ draft: { chinese: committed.brandChinese, english: committed.brandEnglish } })
      }
      const changed = view && Object.keys(before).some(key =>
        before[key as keyof AstrologyPreferences] !== view[key as keyof AstrologyPreferences])
      publish({ notice: kind === 'preview' ? '' : changed ? 'saved' : 'unchanged' })
      return true
    } catch {
      if (active && session === generation) publish({ notice: kind === 'preview' ? 'previewFailure' : 'failure' })
      return false
    } finally {
      if (active && session === generation) publish({ busy: false })
    }
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    start: () => {
      active = true
      const session = ++generation
      publish({ busy: false })
      const stop = api.onSettings(view => {
        if (!active || session !== generation) return
        revision++
        accept(view)
      })
      void refresh()
      return () => {
        if (session !== generation || !active) return
        active = false
        generation++
        stop()
      }
    },
    refresh,
    editBrand: (key: 'chinese' | 'english', value: string) => {
      if (!active || snapshot.busy || !snapshot.view) return
      publish({ draft: { ...snapshot.draft, [key]: value }, notice: '' })
    },
    configure: (changes: AstrologyPreferenceChanges) => run(() => api.configure(changes)),
    saveBrand: () => {
      const { chinese, english } = snapshot.draft
      return run(() => api.configure({ brandChinese: chinese, brandEnglish: english }), 'brand')
    },
    chooseVideo: () => run(() => api.chooseVideo()),
    chooseBackground: () => run(() => api.chooseBackground()),
    clearBackground: api.clearBackground ? () => run(() => api.clearBackground!()) : undefined,
    preview: () => run(() => api.presentation(true), 'preview'),
  }
}
