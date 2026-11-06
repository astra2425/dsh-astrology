export const preferences = {
  introEnabled: true, playFull: false, videoSound: false, startupDisplay: 'window',
  videoFit: 'contain', reasoningSliderStyle: 'codex', reasoningSliderMotion: true,
  petEnabled: false, media: null, brandChinese: '星术', brandEnglish: 'ASTROLOGY',
  backgroundMedia: 'mp4', backgroundLoop: true, backgroundFit: 'cover',
  mediaURL: null, backgroundURL: 'dsh-astrology://background?v=1',
}

export function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

export const settle = () => new Promise(resolve => setImmediate(resolve))

export function carrier(overrides = {}) {
  const listeners = { settings: new Set(), shown: new Set(), visibility: new Set() }
  const subscribe = name => listener => {
    listeners[name].add(listener)
    return () => listeners[name].delete(listener)
  }
  let view = { ...preferences }
  const api = {
    apiVersion: 1,
    state: async () => ({ ...view }),
    configure: async changes => {
      view = { ...view, ...changes }
      return { ...view }
    },
    chooseVideo: async () => ({ ...view }), chooseBackground: async () => ({ ...view }),
    claimIntro: async () => true, presentation: async () => {}, toggleFullscreen: async () => {},
    onSettings: subscribe('settings'), onShown: subscribe('shown'), onVisibility: subscribe('visibility'),
    ...overrides,
  }
  return { api, listeners, emit: (name, value) => listeners[name].forEach(listener => listener(value)) }
}
