import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import vm from 'node:vm'
import test from 'node:test'
import { apply as applyHost } from '../src/index.ts'

const require = createRequire(import.meta.url)
const bundle = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')

test('built module-loader artifact mounts styled fallback on missing or incomplete hosts', () => {
  assert.equal(bundle.includes('__ASTROLOGY_CSS_INLINE__'), false, 'build must embed CSS')
  for (const api of [undefined, null, { apiVersion: 1 }, { apiVersion: 2 }]) {
    const styles = new Set(), sections = [], disposers = []
    let exports
    const window = { dshAstrology: api, __ModuleLoader__: { load: module => {
      assert.equal(module.id, '@dsh-external/dsh-plugin-astrology')
      exports = module.factory(name => {
        if (name === 'react' || name === 'react/jsx-runtime') return require(name)
        if (name === '@deepseek-ai/dsh-client-store') return {
          defineStore: () => assert.fail('native store on unsupported host'),
        }
        throw Error(`Unexpected runtime dependency: ${name}`)
      })
    } } }
    const document = {
      createElement: () => {
        const element = { dataset: {}, remove: () => styles.delete(element) }
        return element
      },
      head: { append: element => styles.add(element) },
    }
    vm.runInNewContext(bundle, { window, document })
    exports.apply({
      effect: fn => { disposers.push(fn()) },
      theme: { overrideTokens: () => () => {} },
      locale: { register: () => () => {}, bind: () => key => key },
      slots: { inject: (_name, fn) => fn(), register: (definition, component) => { sections.push({ definition, component }) } },
      plugin: () => assert.fail('native child plugin on unsupported host'),
    })
    assert.equal(styles.size, 1)
    assert.match([...styles][0].textContent, /astrology-workspace-background/)
    assert.equal(sections[0].definition.id, 'astrology')
    const card = sections[0].component({ t: key => key })
    assert.ok(card.props.className)
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
