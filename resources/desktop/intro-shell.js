/** Playback-only document; configuration and file access remain in the main workspace. */
import { openIntro } from './intro.js';
const api = window.astrologyIntro;
try {
  const view = await api.state();
  const zh = navigator.language.startsWith('zh');
  const dialog = openIntro(view, { title: '星术', local: '星术 · ASTROLOGY',
    welcome: zh ? '灵感，将在这里发生。' : 'Make room for your next idea.' }, api.onVisibility, view.visible);
  dialog.addEventListener('close', () => { void api.close(); }, { once: true });
} catch (error) {
  console.error('Astrology intro playback failed', error);
  void api.close();
}
