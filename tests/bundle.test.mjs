import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import test from 'node:test'
import { apply as applyHost } from '../src/index.ts'

const require = createRequire(import.meta.url)
const bundle = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')

test('built module-loader artifact registers configurable settings on stock hosts', async () => {
  assert.equal(bundle.includes('__ASTROLOGY_CSS_INLINE__'), false, 'build must embed CSS')
  for (const api of [undefined, null, { apiVersion: 1 }, { apiVersion: 2 }]) {
    const styles = new Set(), sections = [], disposers = [], preferences = new Map()
    let exports
    const window = { dshAstrology: api, __ModuleLoader__: { load: module => {
      assert.equal(module.id, '@dsh-external/dsh-plugin-astrology')
      exports = module.factory(name => {
        if (name === 'react' || name === 'react/jsx-runtime') return require(name)
        if (name === '@deepseek-ai/dsh-client-store') return {
          defineStore: definition => definition,
        }
        throw Error(`Unexpected runtime dependency: ${name}`)
      })
    } } }
    const document = {
      createElement: () => {
        const element = { dataset: {}, remove: () => styles.delete(element), setAttribute() {}, replaceChildren() {} }
        return element
      },
      head: { append: element => styles.add(element) },
      body: { prepend() {} },
      documentElement: { dataset: {} },
      addEventListener() {},
      removeEventListener() {},
      querySelector: () => null,
    }
    vm.runInNewContext(bundle, { window, document, Blob, queueMicrotask, cancelAnimationFrame() {},
      MutationObserver: class { observe() {} disconnect() {} }, HTMLVideoElement: class {},
      localStorage: { getItem: key => preferences.get(key), setItem: (key, value) => preferences.set(key, value) },
    })
    const ctx = {
      effect: fn => { disposers.push(fn()) },
      theme: { overrideTokens: () => () => {} },
      locale: { register: () => () => {}, bind: () => key => key },
      slots: { inject: (_name, fn) => fn(), register: (definition, component) => { sections.push({ definition, component }) } },
      plugin: plugin => plugin.apply(ctx),
    }
    exports.apply(ctx)
    assert.equal(styles.size, 1)
    assert.match([...styles][0].textContent, /astrology-workspace-background/)
    assert.match([...styles][0].textContent, /\.dsh-astrology-settings/)
    const settings = sections.find(section => section.definition.id === 'astrology')
    const local = settings.definition.inject()
    assert.equal(local.native, false)
    await local.api.configure({ brandChinese: '我的星术', backgroundFit: 'contain' })
    assert.equal((await local.api.state()).brandChinese, '我的星术')
    assert.equal(JSON.parse([...preferences.values()][0]).backgroundFit, 'contain')
    assert.equal(sections.find(section => section.definition.name === 'sidebar.brand.name').definition.priority, -10)
    disposers.reverse().forEach(dispose => dispose?.())
    assert.equal(styles.size, 0)
  }
})

test('host entry ignores unavailable services and registers native cleanup when supported', () => {
  for (const value of [undefined, null, { apiVersion: 2 }, { apiVersion: 1 }]) {
    applyHost({ get: () => value, effect: () => assert.fail('unsupported host activated') })
  }
  let activations = 0, cleanups = 0, dispose
  applyHost({
    get: () => ({ apiVersion: 1, activate: () => { activations++; return () => { cleanups++ } } }),
    effect: fn => { dispose = fn() },
  })
  assert.equal(activations, 1)
  dispose()
  assert.equal(cleanups, 1)
})
