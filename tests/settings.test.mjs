import assert from 'node:assert/strict'
import test from 'node:test'
import { isAstrologyCarrier } from '../src/client/astrology/host-api.ts'
import { observePreferences } from '../src/client/astrology/observe.ts'
import { createSettingsController } from '../src/client/astrology/settings-controller.ts'
import { carrier, deferred, preferences, settle } from './fixtures.mjs'

test('rejects absent, incompatible and partial bridges before mounting', () => {
  for (const value of [undefined, null, {}, { apiVersion: 1 }, carrier({ apiVersion: 2 }).api]) {
    assert.equal(isAstrologyCarrier(value), false)
  }
  assert.equal(isAstrologyCarrier(carrier().api), true)
  for (const method of Object.keys(carrier().api).filter(key => key !== 'apiVersion')) {
    assert.equal(isAstrologyCarrier(carrier({ [method]: undefined }).api), false, method)
  }
})

test('events supersede initial reads and disposal ignores all late snapshots', async () => {
  const read = deferred()
  const host = carrier({ state: () => read.promise })
  const received = []
  const stop = observePreferences(host.api, view => received.push(view.brandEnglish))
  await settle()
  host.emit('settings', { ...preferences, brandEnglish: 'NEW' })
  read.resolve(preferences)
  await settle()
  assert.deepEqual(received, ['NEW'])
  stop(); stop()
  host.emit('settings', preferences)
  assert.equal(host.listeners.settings.size, 0)
  assert.deepEqual(received, ['NEW'])
  const late = deferred()
  const cancel = observePreferences(carrier({ state: () => late.promise }).api, () => assert.fail('late render'))
  await settle()
  cancel()
  late.resolve(preferences)
  await settle()
})

test('initial read failure can be retried without remounting', async () => {
  let attempts = 0
  const host = carrier({ state: async () => { if (++attempts === 1) throw Error('offline'); return preferences } })
  const controller = createSettingsController(host.api)
  const stop = controller.start()
  await settle()
  assert.equal(controller.getSnapshot().notice, 'loadFailure')
  assert.equal(controller.getSnapshot().loading, false)
  await controller.refresh()
  assert.equal(controller.getSnapshot().view, preferences)
  assert.equal(controller.getSnapshot().notice, '')
  stop()
})

test('unrelated saves and external updates preserve draft names; saving commits the draft', async () => {
  const host = carrier()
  const controller = createSettingsController(host.api)
  const stop = controller.start()
  await settle()
  controller.editBrand('chinese', '我的星术')
  await controller.configure({ petEnabled: true })
  assert.equal(controller.getSnapshot().view.petEnabled, true)
  assert.equal(controller.getSnapshot().view.brandChinese, preferences.brandChinese)
  assert.equal(controller.getSnapshot().draft.chinese, '我的星术')
  host.emit('settings', { ...controller.getSnapshot().view, brandEnglish: 'EXTERNAL' })
  assert.deepEqual(controller.getSnapshot().draft, { chinese: '我的星术', english: 'EXTERNAL' })
  await controller.saveBrand()
  assert.equal(controller.getSnapshot().view.brandChinese, '我的星术')
  assert.equal(controller.getSnapshot().draft.chinese, '我的星术')
  stop()
})

test('failed writes retain committed values, reject duplicate operations and keep drafts', async () => {
  const write = deferred()
  let calls = 0
  const host = carrier({ configure: () => { calls++; return write.promise } })
  const controller = createSettingsController(host.api)
  const stop = controller.start()
  await settle()
  controller.editBrand('english', 'DRAFT')
  const first = controller.configure({ petEnabled: true })
  assert.equal(await controller.configure({ petEnabled: false }), false)
  assert.equal(calls, 1)
  assert.equal(controller.getSnapshot().view.petEnabled, false)
  write.reject(Error('disk full'))
  assert.equal(await first, false)
  assert.equal(controller.getSnapshot().notice, 'failure')
  assert.equal(controller.getSnapshot().draft.english, 'DRAFT')
  assert.equal(controller.getSnapshot().busy, false)
  stop()
})

test('cancelled pickers report no change; failed previews remain actionable', async () => {
  const host = carrier({ presentation: async () => { throw Error('unavailable') } })
  const controller = createSettingsController(host.api)
  const stop = controller.start()
  await settle()
  await controller.chooseBackground()
  assert.equal(controller.getSnapshot().notice, 'unchanged')
  assert.equal(await controller.preview(), false)
  assert.equal(controller.getSnapshot().notice, 'previewFailure')
  stop()
})

test('settings events supersede pending reads and writes; unload suppresses completion', async () => {
  const read = deferred(), write = deferred()
  const host = carrier({ state: () => read.promise, configure: () => write.promise })
  const controller = createSettingsController(host.api)
  const stop = controller.start()
  host.emit('settings', { ...preferences, brandEnglish: 'EVENT' })
  read.resolve(preferences)
  await settle()
  assert.equal(controller.getSnapshot().view.brandEnglish, 'EVENT')
  const result = controller.configure({ petEnabled: true })
  host.emit('settings', { ...preferences, brandEnglish: 'NEWER' })
  write.resolve({ ...preferences, petEnabled: true })
  await result
  assert.equal(controller.getSnapshot().view.brandEnglish, 'NEWER')
  const pending = deferred()
  host.api.presentation = () => pending.promise
  const preview = controller.preview()
  stop()
  const snapshot = controller.getSnapshot()
  pending.resolve()
  assert.equal(await preview, false)
  assert.equal(controller.getSnapshot(), snapshot)
  assert.equal(host.listeners.settings.size, 0)
})

test('effect restart invalidates a previous mount read', async () => {
  const old = deferred()
  let calls = 0
  const controller = createSettingsController(carrier({ state: () => ++calls === 1 ? old.promise : Promise.resolve(preferences) }).api)
  const firstStop = controller.start()
  firstStop()
  const stop = controller.start()
  await settle()
  old.resolve({ ...preferences, brandEnglish: 'STALE' })
  await settle()
  assert.equal(controller.getSnapshot().view.brandEnglish, preferences.brandEnglish)
  stop()
})
