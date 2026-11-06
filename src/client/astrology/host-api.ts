/** Versioned, path-free renderer API required from the official Desktop host. */
export interface AstrologyPreferences {
  introEnabled: boolean
  playFull: boolean
  videoSound: boolean
  startupDisplay: 'window' | 'fullscreen'
  videoFit: 'contain' | 'cover'
  reasoningSliderStyle: 'codex' | 'stage' | 'minimal'
  reasoningSliderMotion: boolean
  petEnabled: boolean
  media: 'mp4' | 'webm' | null
  brandChinese: string
  brandEnglish: string
  backgroundMedia: 'mp4' | 'webm' | 'png' | 'jpg' | 'webp' | null
  backgroundLoop: boolean
  backgroundFit: 'cover' | 'contain'
  mediaURL: string | null
  backgroundURL: string | null
}

/** Writable preferences accepted by the Desktop settings window. */
export type AstrologyPreferenceChanges = Partial<Omit<AstrologyPreferences,
  'playFull' | 'media' | 'backgroundMedia' | 'mediaURL' | 'backgroundURL'>>

/** Safe preload methods; this interface contains no Electron or filesystem objects. */
export interface AstrologyCarrier {
  readonly apiVersion: 1
  state(): Promise<AstrologyPreferences>
  onSettings(listener: (view: AstrologyPreferences) => void): () => void
  claimIntro(): Promise<boolean>
  presentation(enabled: boolean): Promise<void>
  toggleFullscreen(): Promise<void>
  onShown(listener: () => void): () => void
  onVisibility(listener: (visible: boolean) => void): () => void
  configure(changes: AstrologyPreferenceChanges): Promise<AstrologyPreferences>
  chooseVideo(): Promise<AstrologyPreferences>
  chooseBackground(): Promise<AstrologyPreferences>
}

/** Plugin-owned client operations can also be backed by renderer storage. */
export type AstrologyClient = Omit<AstrologyCarrier, 'apiVersion'> & {
  clearBackground?: () => Promise<AstrologyPreferences>
}

/** Check the complete bridge before installing any native-dependent UI. */
export function isAstrologyCarrier(value: unknown): value is AstrologyCarrier {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return candidate.apiVersion === 1 && [
    'state', 'onSettings', 'claimIntro', 'presentation', 'toggleFullscreen',
    'onShown', 'onVisibility', 'configure', 'chooseVideo', 'chooseBackground',
  ].every(key => typeof candidate[key] === 'function')
}

/** Optional preload API, present only in a compatible official Desktop host. */
declare global {
  interface Window {
    dshAstrology?: AstrologyCarrier
  }
}
