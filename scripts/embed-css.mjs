/** Inline the standalone client stylesheet because DSH loads one JS module-loader artifact per plugin. */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const jsPath = fileURLToPath(new URL('../lib/client.js', import.meta.url))
const stylesheets = ['presentation.css', 'settings.css']
const css = (await Promise.all(stylesheets.map(name =>
  readFile(new URL('../src/client/astrology/' + name, import.meta.url), 'utf8'),
))).join('\n').replace(/\r\n/g, '\n')
const js = await readFile(jsPath, 'utf8')
const token = JSON.stringify('__ASTROLOGY_CSS_INLINE__')
if (!js.includes(token)) throw new Error('Client artifact is missing the Astrology CSS placeholder')
await writeFile(jsPath, js.replace(token, () => JSON.stringify(css)))
