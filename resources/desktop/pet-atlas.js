// Runtime sampling of authored frames; no CSS pose simulation or raster rewriting.
export const WIDTH = 230, HEIGHT = 275;
const cache = new Map();

export async function loadAtlas(clip) {
  const key = clip.asset;
  if (cache.has(key)) {
    const existing = cache.get(key);
    cache.delete(key); cache.set(key, existing);
    return existing;
  }
  const pending = (async () => {
    const image = new Image();
    image.src = `/astrology/${key}`;
    await image.decode();
    if (image.naturalWidth !== clip.width || image.naturalHeight !== clip.height) throw new Error('Atlas dimensions mismatch');
    const analysis = document.createElement('canvas');
    analysis.width = clip.width; analysis.height = clip.height;
    const context = analysis.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, clip.width, clip.height).data;
    const alpha = new Uint8Array(clip.width * clip.height);
    for (let i = 0; i < alpha.length; i++) alpha[i] = pixels[i * 4 + 3];
    analysis.width = 0; analysis.height = 0;
    return { image, alpha, clip };
  })();
  cache.set(key, pending);
  while (cache.size > 3) cache.delete(cache.keys().next().value);
  try { return await pending; }
  catch (error) { if (cache.get(key) === pending) cache.delete(key); throw error; }
}

export function frameAt(elapsed, fps, count, reduced, duration = 0, loop = [0, count - 1]) {
  if (reduced) return 0;
  elapsed = Math.max(0, elapsed);
  const [start, end] = loop, step = Math.floor(elapsed * fps / 1000);
  const tail = count - 1 - end, outro = duration - tail * 1000 / fps;
  if (duration > 0 && tail > 0 && elapsed >= outro)
    return Math.min(count - 1, end + 1 + Math.floor((elapsed - outro) * fps / 1000));
  return step < start ? step : start + (step - start) % (end - start + 1);
}

export function framePlacement(clip, frame) {
  const scale = Math.min(205 / clip.referenceHeight, 220 / clip.maxWidth, 268 / clip.maxHeight);
  return { x: WIDTH / 2 - frame.footX * scale, y: HEIGHT - 2 - frame.footY * scale,
    width: frame.width * scale, height: frame.height * scale, scale };
}

export function frameHit(atlas, index, x, y, right) {
  if (right) x = WIDTH - x;
  const frame = atlas.clip.frames[index], placement = framePlacement(atlas.clip, frame);
  const px = Math.floor((x - placement.x) / placement.scale);
  const py = Math.floor((y - placement.y) / placement.scale);
  return px >= 0 && px < frame.width && py >= 0 && py < frame.height
    && atlas.alpha[(frame.y + py) * atlas.clip.width + frame.x + px] > 24;
}

export function drawFrame(canvas, atlas, index, right) {
  const ratio = Math.min(3, devicePixelRatio || 1);
  if (canvas.width !== Math.round(WIDTH * ratio) || canvas.height !== Math.round(HEIGHT * ratio)) {
    canvas.width = Math.round(WIDTH * ratio); canvas.height = Math.round(HEIGHT * ratio);
  }
  const context = canvas.getContext('2d');
  context.setTransform(canvas.width / WIDTH, 0, 0, canvas.height / HEIGHT, 0, 0);
  context.clearRect(0, 0, WIDTH, HEIGHT);
  if (right) { context.translate(WIDTH, 0); context.scale(-1, 1); }
  const frame = atlas.clip.frames[index], box = framePlacement(atlas.clip, frame);
  context.drawImage(atlas.image, frame.x, frame.y, frame.width, frame.height, box.x, box.y, box.width, box.height);
}
