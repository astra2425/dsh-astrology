/** Inline the standalone client stylesheet because DSH loads one JS module-loader artifact per plugin. */
import { readFile, writeFile, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const jsPath = fileURLToPath(new URL('../lib/client.js', import.meta.url))
const cssPath = fileURLToPath(new URL('../lib/style.css', import.meta.url))
const css = await readFile(cssPath, 'utf8')
const js = await readFile(jsPath, 'utf8')
const token = JSON.stringify('__ASTROLOGY_CSS_INLINE__')
if (!js.includes(token)) throw new Error('Client artifact is missing the Astrology CSS placeholder')
await writeFile(jsPath, js.replace(token, JSON.stringify(css)))
await rm(cssPath)
