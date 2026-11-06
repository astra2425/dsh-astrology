import type { AstrologyCarrier, AstrologyPreferences } from './host-api.ts'

/** A settings event supersedes the initial snapshot; disposal invalidates pending reads. */
export function observePreferences(
  api: Pick<AstrologyCarrier, 'state' | 'onSettings'>,
  receive: (view: AstrologyPreferences) => void,
  fail: (error: unknown) => void = () => undefined,
): () => void {
  let live = true
  let updated = false
  const stop = api.onSettings(view => {
    if (!live) return
    updated = true
    receive(view)
  })
  void Promise.resolve().then(() => live ? api.state() : undefined).then(view => {
    if (live && !updated && view) receive(view)
  }, error => { if (live && !updated) fail(error) })
  return () => {
    if (!live) return
    live = false
    stop()
  }
}
