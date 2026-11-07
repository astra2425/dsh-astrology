import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { win32 } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Start one independent, opted-in companion owned by the DSH Host lifecycle. */
export function launchWindowsPet(): () => void {
  const systemRoot = process.env.SystemRoot
  if (!systemRoot || !win32.isAbsolute(systemRoot)) return () => undefined
  const resources = new URL('../resources/desktop/', import.meta.url)
  const script = readFileSync(new URL('windows-pet.ps1', resources), 'utf8')
  const shell = win32.join(systemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
  // A fixed script and package-owned assets only. No renderer input is sent to the helper.
  const child = spawn(shell, [
    '-NoLogo', '-NoProfile', '-NonInteractive', '-STA', '-EncodedCommand',
    Buffer.from(script, 'utf16le').toString('base64'),
  ], {
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      SystemRoot: systemRoot, WINDIR: systemRoot,
      TEMP: process.env.TEMP, TMP: process.env.TMP,
      DSH_ASTROLOGY_PET_OWNER: String(process.pid),
      DSH_ASTROLOGY_PET_ASSETS: fileURLToPath(resources),
    },
  })
  child.on('error', error => console.warn('Astrology could not start the Windows companion:', error.message))
  child.stdout?.setEncoding('utf8').on('data', chunk => {
    if (String(chunk).includes('ASTROLOGY_PET_READY')) console.info('Astrology Windows companion ready')
  })
  child.stderr?.setEncoding('utf8').on('data', chunk => console.warn('Astrology Windows companion:', String(chunk).trim()))
  return () => { if (child.exitCode === null && child.signalCode === null) child.kill() }
}
