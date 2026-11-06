import assert from 'node:assert/strict'
import test from 'node:test'
import { mountPresentation } from '../src/client/presentation.ts'
import { mountStylesheet } from '../src/client/stylesheet.ts'
import { carrier, deferred, preferences, settle } from './fixtures.mjs'

// Minimal DOM surface for lifecycle and media resource assertions, not layout validation.
class Element extends EventTarget {
  dataset = {}
  children = []
  parent = undefined
  src = ''
  constructor(tag) { super(); this.tagName = tag }
  setAttribute() {}
  removeAttribute(name) { delete this[name] }
  append(...elements) {
    this.children.push(...elements)
    elements.forEach(element => { element.parent = this })
  }
  prepend(element) { this.children.unshift(element); element.parent = this }
  replaceChildren(...elements) {
    this.children.forEach(element => { element.parent = undefined })
    this.children = []
    this.append(...elements)
  }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this) }
}
class Video extends Element {
  played = 0
  paused = 0
  loaded = 0
  constructor() { super('video') }
  async play() { this.played++ }
  pause() { this.paused++ }
  load() { this.loaded++ }
}
function dom(t) {
  const document = {
    documentElement: new Element('html'), head: new Element('head'), body: new Element('body'),
    createElement: tag => tag === 'video' ? new Video() : new Element(tag),
  }
  const original = { document: globalThis.document, HTMLVideoElement: globalThis.HTMLVideoElement }
  Object.assign(globalThis, { document, HTMLVideoElement: Video })
  t.after(() => {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete globalThis[key]
      else globalThis[key] = value
    }
  })
  return document
}

test('preferences preserve video identity and update looping without restarting playback', async t => {
  const document = dom(t)
  const host = carrier()
  const stop = mountPresentation(host.api)
  await settle()
  const layer = document.body.children[0]
  const video = layer.children[0]
  assert.equal(video.played, 1)
  host.emit('settings', { ...preferences, petEnabled: true, backgroundLoop: false, backgroundFit: 'contain' })
  assert.equal(layer.children[0], video)
  assert.equal(video.played, 1)
  assert.equal(video.loop, false)
  assert.equal(document.documentElement.dataset.astrologyBackgroundFit, 'contain')
  host.emit('visibility', false)
  assert.equal(video.paused, 1)
  host.emit('settings', { ...preferences, backgroundURL: 'dsh-astrology://background?v=2' })
  const replacement = layer.children[0]
  assert.notEqual(replacement, video)
  assert.equal(video.src, undefined)
  assert.equal(video.loaded, 1)
  assert.equal(replacement.played, 0)
  host.emit('visibility', true)
  assert.equal(replacement.played, 1)
  stop()
  assert.equal(replacement.src, undefined)
  assert.equal(document.body.children.length, 0)
})

test('media errors only remove the current asset, including broken images', async t => {
  const document = dom(t)
  const host = carrier()
  const stop = mountPresentation(host.api)
  await settle()
  const layer = document.body.children[0]
  const old = layer.children[0]
  host.emit('settings', { ...preferences, backgroundMedia: 'png', backgroundURL: 'dsh-astrology://background?v=2' })
  const image = layer.children[0]
  old.dispatchEvent(new Event('error'))
  assert.equal(layer.children[0], image)
  image.dispatchEvent(new Event('error'))
  assert.equal(layer.children.length, 0)
  stop()
})

test('unload cancels pending intro claims and reads, restores attributes and removes subscriptions', async t => {
  const document = dom(t)
  document.documentElement.dataset.astrology = 'host-owned'
  const read = deferred(), claim = deferred()
  const shown = []
  let claims = 0
  const host = carrier({
    state: () => read.promise, claimIntro: () => { claims++; return claim.promise },
    presentation: async value => { shown.push(value) },
  })
  const stop = mountPresentation(host.api)
  host.emit('shown'); host.emit('shown')
  await settle()
  assert.equal(claims, 1)
  stop(); stop()
  read.resolve(preferences)
  claim.resolve(true)
  await settle()
  assert.deepEqual(shown, [false])
  assert.deepEqual(document.documentElement.dataset, { astrology: 'host-owned' })
  assert.equal(document.body.children.length, 0)
  for (const listeners of Object.values(host.listeners)) assert.equal(listeners.size, 0)
})

test('stylesheet mounts independently of native presentation and can be disposed', t => {
  const document = dom(t)
  const stop = mountStylesheet()
  assert.equal(document.head.children[0].dataset.pluginCss, '@dsh-external/dsh-plugin-astrology')
  assert.equal(document.body.children.length, 0)
  stop()
  assert.equal(document.head.children.length, 0)
})
