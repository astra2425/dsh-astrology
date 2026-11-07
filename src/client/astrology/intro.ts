import type { AstrologyPreferences } from './host-api.ts'

/** A stock-host intro lives in the workspace's top layer and always has an escape. */
export function showWorkspaceIntro(view: AstrologyPreferences): () => void {
  const dialog = document.createElement('dialog')
  dialog.className = 'dsh-astrology-intro'
  dialog.setAttribute('aria-label', 'Astrology')
  const logo = document.createElement('div')
  logo.className = 'dsh-astrology-introLogo'
  logo.textContent = '✦ ASTROLOGY'
  const skip = document.createElement('button')
  skip.type = 'button'
  skip.textContent = document.documentElement.lang.startsWith('zh') ? '跳过片头' : 'Skip intro'
  skip.autofocus = true
  dialog.append(logo, skip)
  const video = view.mediaURL ? document.createElement('video') : undefined
  let deadline: ReturnType<typeof setTimeout> | undefined
  const stopVideo = () => {
    if (!video?.isConnected) return
    video.pause()
    video.removeAttribute('src')
    video.load()
    video.remove()
  }
  const close = () => {
    clearTimeout(deadline)
    stopVideo()
    if (dialog.open) dialog.close()
    dialog.remove()
  }
  const showLogo = () => {
    stopVideo()
    logo.hidden = false
    clearTimeout(deadline)
    deadline = setTimeout(close, 2300)
  }
  skip.addEventListener('click', close)
  dialog.addEventListener('cancel', event => { event.preventDefault(); close() })
  document.body.append(dialog)
  try { dialog.showModal() } catch (error) { close(); throw error }
  if (video && view.mediaURL) {
    logo.hidden = true
    video.playsInline = true
    video.muted = !view.videoSound
    video.style.objectFit = view.videoFit
    video.src = view.mediaURL
    video.addEventListener('error', showLogo, { once: true })
    video.addEventListener('ended', showLogo, { once: true })
    dialog.prepend(video)
    deadline = setTimeout(showLogo, 60_000)
    void video.play().catch(() => { if (video.isConnected) showLogo() })
  } else showLogo()
  return close
}
