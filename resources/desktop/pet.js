import { loadAtlas, drawFrame, frameHit, frameAt, WIDTH, HEIGHT } from './pet-atlas.js';
const bridge = window.astrologyPet, body = document.body;
const canvas = document.querySelector('#astrology-pet-image');
const status = document.querySelector('#pet-status');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let actions, manifest, current, displayed, atlas, pointer;
let generation = 0, animation, startedAt = 0, pausedAt = 0, index = -1, draws = 0;
let interactive = false, inside = false, enterTimer, leaveTimer, disposed = false;
let press, ending = false, pendingState;
let dragMotion, runningAtlas, dragStartedAt = 0;

function visible() {
  return dragMotion && runningAtlas ? { atlas: runningAtlas, mirror: dragMotion.facing === 'right' }
    : { atlas, mirror: current?.facing === 'right' };
}

function setInteractive(value) {
  if (press || ending) value = true;
  if (value === interactive) return;
  interactive = value; bridge.pointer(value);
}
function bodyHit(event) {
  const shown = visible();
  if (!shown.atlas) return false;
  const box = canvas.getBoundingClientRect();
  return frameHit(shown.atlas, Math.max(0, index), (event.clientX - box.left) * WIDTH / box.width,
    (event.clientY - box.top) * HEIGHT / box.height, shown.mirror);
}
function hit(event) { return bodyHit(event); }
function paint(now, force = false) {
  if (!atlas || !displayed) return;
  const action = actions[displayed.action];
  const shown = visible();
  const next = dragMotion ? dragMotion.running ? frameAt(now - dragStartedAt, 10, 8, reduced.matches) : Math.max(0, index)
    : frameAt(now - startedAt, action.fps, atlas.clip.frames.length, reduced.matches,
      action.duration, atlas.clip.frames.length === 1 ? [0, 0] : action.loop);
  const resized = canvas.width !== Math.round(WIDTH * Math.min(3, devicePixelRatio || 1));
  if (next !== index || force || resized) {
    index = next;
    drawFrame(canvas, shown.atlas, index, shown.mirror);
    body.dataset.frame = String(index); body.dataset.draws = String(++draws);
    if (pointer) setInteractive(hit(pointer));
  }
}
function tick(now) {
  paint(now);
  if (!document.hidden && !reduced.matches && !disposed && (!press || dragMotion?.running)) animation = requestAnimationFrame(tick);
}
function run() {
  cancelAnimationFrame(animation);
  if (!atlas || !displayed || disposed || (press && !dragMotion) || ending) return;
  paint(performance.now(), true);
  if (!document.hidden && !reduced.matches && !disposed && (!press || dragMotion?.running)) animation = requestAnimationFrame(tick);
}
function showDrag(state) {
  if (!state.active) {
    if (!dragMotion) return;
    dragMotion = undefined;
    body.dataset.running = 'false';
    cancelAnimationFrame(animation);
    if (press && !ending) void finishPress(true);
    return;
  }
  if (!press || ending || !runningAtlas) return;
  const restarted = !dragMotion || (state.running && !dragMotion.running);
  if (restarted) { dragStartedAt = performance.now(); index = -1; }
  dragMotion = state;
  body.dataset.action = 'run'; body.dataset.facing = state.facing;
  body.dataset.microphone = 'false'; body.dataset.asset = runningAtlas.clip.asset;
  body.dataset.running = String(state.running); body.dataset.dragging = 'true';
  status.textContent = '';
  run();
}
async function render(state) {
  if (press || ending) { pendingState = state; return; }
  if (current && state.revision < current.revision) return;
  const same = current?.revision === state.revision && displayed?.revision === state.revision;
  current = state;
  body.dataset.facing = state.facing; body.dataset.source = state.source;
  if (!manifest) return;
  if (same) { run(); return; }
  const ticket = ++generation;
  cancelAnimationFrame(animation);
  if (displayed?.action === 'sing' && state.action !== 'sing') {
    const context = canvas.getContext('2d');
    context.setTransform(1, 0, 0, 1, 0, 0); context.clearRect(0, 0, canvas.width, canvas.height);
    body.dataset.microphone = 'false'; atlas = undefined; setInteractive(false);
  }
  let fallback = false, ready;
  try {
    ready = await loadAtlas(manifest.clips[state.action]);
  } catch (error) {
    if (ticket !== generation || disposed) return;
    console.error('Astrology animation unavailable', state.action, error);
    if (state.action !== 'idle') { await bridge.control('idle'); return; }
    fallback = true;
    try {
      ready = await loadAtlas({ asset: 'idle.png', width: 1205, height: 1306, referenceHeight: 1290,
        maxWidth: 1205, maxHeight: 1306, frames: [{ x: 0, y: 0, width: 1205, height: 1306, footX: 602.5, footY: 1306 }] });
    } catch (fallbackError) {
      status.textContent = '伙伴资源不可用，请重启后重试';
      console.error('Astrology fallback unavailable', fallbackError); return;
    }
  }
  if (ticket !== generation || disposed) return;
  atlas = ready; displayed = state; index = -1; startedAt = performance.now();
  if (document.hidden) pausedAt = startedAt;
  body.dataset.action = state.action; body.dataset.microphone = String(state.action === 'sing');
  body.dataset.revision = String(state.revision); body.dataset.asset = atlas.clip.asset;
  body.dataset.mode = fallback ? 'fallback' : 'frames'; body.dataset.frames = String(atlas.clip.frames.length);
  status.textContent = fallback ? '动画暂不可用 · 静态待机' : '';
  run();
}
function pointerMoved(event) {
  pointer = event; setInteractive(hit(event));
  if (press) {
    if (Math.hypot(event.clientX - press.x, event.clientY - press.y) > 6) press.travel = true;
    if (!(event.buttons & 1)) void finishPress(true);
    return;
  }
  if (ending) return;
  if (bodyHit(event)) {
    clearTimeout(leaveTimer); leaveTimer = undefined;
    if (inside) return;
    inside = true;
    enterTimer = setTimeout(() => {
      if (!disposed && pointer && bodyHit(pointer)) void bridge.control('hover');
    }, 120);
  } else {
    clearTimeout(enterTimer);
    if (leaveTimer === undefined) leaveTimer = setTimeout(() => { inside = false; leaveTimer = undefined; }, 200);
  }
}

async function finishPress(cancelled = false) {
  if (!press || ending) return;
  const gesture = press;
  press = undefined; ending = true;
  dragMotion = undefined; displayed = undefined; generation += 1;
  cancelAnimationFrame(animation); body.dataset.running = 'false';
  clearTimeout(gesture.hold);
  if (canvas.hasPointerCapture(gesture.id)) canvas.releasePointerCapture(gesture.id);
  body.dataset.dragging = 'false'; body.dataset.pressed = 'false';
  try {
    const result = await bridge.control(cancelled ? 'cancel-drag' : 'release');
    const latest = pendingState && pendingState.revision >= result.state.revision ? pendingState : result.state;
    pendingState = undefined; ending = false;
    await render(latest);
    interactive = false;
    bridge.pointer(false);
    if (pointer) setInteractive(hit(pointer));
    if (!cancelled && !result.moved && !gesture.travel && performance.now() - gesture.time < 350)
      await bridge.control('greet');
  } catch (error) {
    ending = false; interactive = false; bridge.pointer(false);
    console.error('Astrology movement failed', error);
  }
}

canvas.addEventListener('pointerdown', event => {
  if (event.button !== 0 || press || ending || !bodyHit(event)) return;
  event.preventDefault();
  clearTimeout(enterTimer); clearTimeout(leaveTimer); leaveTimer = undefined;
  cancelAnimationFrame(animation);
  generation += 1;
  press = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now(), travel: false };
  canvas.setPointerCapture(event.pointerId);
  body.dataset.pressed = 'true'; setInteractive(true);
  press.hold = setTimeout(() => { if (press) body.dataset.dragging = 'true'; }, 350);
  void bridge.control('press').catch(error => { console.error('Astrology press failed', error); void finishPress(true); });
});
canvas.addEventListener('pointerup', event => { if (event.button === 0) void finishPress(); });
canvas.addEventListener('pointercancel', () => { void finishPress(true); });
canvas.addEventListener('lostpointercapture', () => { void finishPress(true); });
window.addEventListener('blur', () => { void finishPress(true); });
const dispose = bridge.onPlayback(state => { void render(state); });
const disposeDrag = bridge.onDrag(showDrag);
try {
  const initial = await bridge.control('state'); actions = initial.actions;
  const response = await fetch('/astrology/pet-atlas.json');
  if (!response.ok) throw new Error(`Atlas manifest HTTP ${response.status}`);
  manifest = await response.json();
  if (manifest.version !== 1 || Object.keys(actions).some(action => manifest.clips[action]?.frames.length !== 8))
    throw new Error('Atlas manifest is incomplete');
  runningAtlas = await loadAtlas(manifest.clips.run);
  await render(current ?? initial.state);
} catch (error) { status.textContent = '动画配置不可用，请重启后重试'; console.error('Astrology pack unavailable', error); }
const motionPreference = () => { run(); void bridge.control('motion', reduced.matches); };
motionPreference(); reduced.addEventListener('change', motionPreference);
document.addEventListener('mousemove', pointerMoved);
document.addEventListener('mouseleave', () => {
  if (press || ending) return;
  pointer = undefined; inside = false; clearTimeout(enterTimer); clearTimeout(leaveTimer); leaveTimer = undefined; setInteractive(false);
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { void finishPress(true); pausedAt = performance.now(); cancelAnimationFrame(animation); }
  else { if (pausedAt) startedAt += performance.now() - pausedAt; pausedAt = 0; run(); }
});
document.addEventListener('contextmenu', event => {
  event.preventDefault(); clearTimeout(enterTimer);
  if (press || bodyHit(event)) void finishPress(true).then(() => bridge.menu());
});
window.addEventListener('pagehide', () => {
  disposed = true; generation += 1; cancelAnimationFrame(animation); clearTimeout(enterTimer); clearTimeout(leaveTimer);
  if (press) clearTimeout(press.hold);
  // Native teardown can already have removed IPC handlers when this document leaves.
  void bridge.control('cancel-drag').catch(() => {});
  dispose(); disposeDrag(); reduced.removeEventListener('change', motionPreference);
});
