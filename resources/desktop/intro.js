/** Ordered startup presentation: natural video completion, then the vector identity reveal. */
import { createLogo } from './logo.js';

export function openIntro(view, t, onVisibility, initialVisible = true) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = document.createElement('dialog');
  dialog.className = 'astrology-intro'; dialog.setAttribute('aria-label', t.local);
  const stage = document.createElement('div'); stage.className = 'astrology-stage';
  const video = document.createElement('video'); video.muted = !view.videoSound; video.playsInline = true;
  video.style.objectFit = view.videoFit;
  video.preload = 'auto'; video.hidden = true;
  const glow = document.createElement('div'); glow.className = 'glow';
  const cursor = document.createElement('div'); cursor.className = 'cursor';
  const brand = document.createElement('div'); brand.className = 'brand'; brand.hidden = true;
  const heading = document.createElement('h1'); heading.textContent = t.title;
  const english = document.createElement('span'); english.className = 'english'; english.textContent = 'ASTROLOGY';
  const caption = document.createElement('span'); caption.className = 'caption'; caption.textContent = t.welcome;
  brand.append(createLogo(), heading, english, caption);
  const finish = () => { if (dialog.open) dialog.close(); };
  stage.append(video, glow, cursor, brand); dialog.append(stage); document.body.append(dialog);
  let phase, logoAnimation, pointerFrame, resumeOnShow = !initialVisible, disposed = false, nativeVisible = initialVisible;
  const hidden = () => document.hidden || !nativeVisible;
  async function play() {
    if (disposed || phase !== 'video' || hidden()) return;
    try { await video.play(); }
    catch (error) {
      if (disposed || phase !== 'video' || hidden()) return;
      if (video.error) { beginLogo(true); return; }
      // If sound autoplay is denied, retain full playback muted; a click can retry.
      if (error.name === 'NotAllowedError' && !video.muted) {
        video.muted = true; void play(); return;
      }
      console.info('Astrology video awaits playback gesture', error.name);
    }
  }
  function beginLogo(failed = false) {
    if (disposed || phase === 'logo') return;
    phase = 'logo'; dialog.dataset.phase = phase;
    video.pause(); video.hidden = true; brand.hidden = false;
    if (failed) console.info('Astrology video unavailable; showing the logo');
    logoAnimation = brand.animate(reduced.matches ? [{ opacity: 1 }, { opacity: 1 }]
      : [{ opacity: 0 }, { opacity: 1, offset: .16 }, { opacity: 1, offset: .86 }, { opacity: 0 }],
    { duration: reduced.matches ? 650 : 2800, fill: 'both' });
    if (hidden()) logoAnimation.pause();
    void logoAnimation.finished.then(finish).catch(error => {
      if (error.name !== 'AbortError') console.error('Astrology logo animation failed', error);
    });
  }
  function visibility() {
    stage.dataset.paused = String(hidden());
    if (hidden()) {
      resumeOnShow ||= phase === 'video' && !video.paused;
      video.pause(); logoAnimation?.pause();
    } else if (phase === 'logo') logoAnimation?.play();
    else if (resumeOnShow || video.readyState < 2) { resumeOnShow = false; void play(); }
  }
  stage.addEventListener('pointermove', event => {
    if (phase === 'video' || reduced.matches || pointerFrame) return;
    const { clientX: x, clientY: y } = event;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = undefined; const box = stage.getBoundingClientRect();
      cursor.style.left = `${x - box.left}px`; cursor.style.top = `${y - box.top}px`;
      stage.style.setProperty('--px', `${((x - box.left) / box.width - .5) * 16}px`);
      stage.style.setProperty('--py', `${((y - box.top) / box.height - .5) * 16}px`);
    });
  });
  stage.addEventListener('click', event => {
    if (phase === 'video') { if (video.paused) void play(); return; }
    if (reduced.matches || event.target.closest('button')) return;
    const box = stage.getBoundingClientRect(), ripple = document.createElement('span'); ripple.className = 'ripple';
    ripple.style.left = `${event.clientX - box.left}px`; ripple.style.top = `${event.clientY - box.top}px`;
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true }); stage.append(ripple);
  });
  const pagehide = () => { finish(); };
  const disposeVisibility = onVisibility(visible => { nativeVisible = visible; visibility(); });
  dialog.addEventListener('close', () => {
    disposed = true; cancelAnimationFrame(pointerFrame); logoAnimation?.cancel();
    disposeVisibility();
    document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', pagehide);
    video.pause(); video.removeAttribute('src'); video.load(); dialog.remove();
  }, { once: true });
  document.addEventListener('visibilitychange', visibility); window.addEventListener('pagehide', pagehide);
  dialog.showModal();
  dialog.addEventListener('cancel', event => { event.preventDefault(); finish(); });
  if (view.mediaURL) {
    phase = 'video'; dialog.dataset.phase = phase; video.hidden = false;
    const source = new URL(view.mediaURL); source.searchParams.set('launch', view.launchId);
    video.addEventListener('ended', () => { beginLogo(); }, { once: true });
    video.addEventListener('error', () => { if (!disposed && video.hasAttribute('src')) beginLogo(true); });
    video.src = source.href; void play();
  } else beginLogo();
  return dialog;
}
