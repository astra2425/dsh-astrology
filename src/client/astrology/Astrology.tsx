/** Native branding and feature-owned settings, rendered through the existing slots. */
import { useEffect, useMemo, useSyncExternalStore } from 'react'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { AstrologyClient, AstrologyPreferenceChanges } from './host-api.ts'
import { createSettingsController } from './settings-controller.ts'
import type { createAstrologyBrandStore } from './store.ts'

/** @returns Two-line personal brand. */
export function AstrologyBrandName({ useStore }: PropsStore<ReturnType<typeof createAstrologyBrandStore>>) {
  const chinese = useStore(state => state.chinese)
  const english = useStore(state => state.english)
  return <span className="dsh-astrology-brand" data-astrology-brand><span>{chinese}</span><small>{english}</small></span>
}

/** @param props Host-requested mark size. @returns Personal star mark. */
export function AstrologyBrandMark({ size }: PropsRuntime<'sidebar.brand.mark'>) {
  return <span aria-hidden="true" style={{ fontSize: size, color: 'var(--dsw-alias-brand-primary)' }}>✦</span>
}

/** Private callbacks injected by the native presentation adapter. */
export interface AstrologySettingsInjected {
  api: AstrologyClient
  native: boolean
}

type Props = PropsRuntime<'settings.section'> & PropsLocale<'brand.astrology'> & AstrologySettingsInjected

/** @param props Settings owner, native operations and localized copy. @returns Grouped personalization controls. */
export function AstrologySettings({ api, native, close, t }: Props) {
  const controller = useMemo(() => createSettingsController(api), [api])
  const { view, draft, busy, loading, notice } = useSyncExternalStore(controller.subscribe, controller.getSnapshot)
  useEffect(() => controller.start(), [controller])

  const brandChanged = view !== undefined
    && (draft.chinese !== view.brandChinese || draft.english !== view.brandEnglish)
  const backgroundLabel = view?.backgroundMedia === null || view?.backgroundMedia === undefined ? t('backgroundDefault')
    : view.backgroundMedia === 'mp4' ? t('backgroundMp4')
      : view.backgroundMedia === 'webm' ? t('backgroundWebm')
        : view.backgroundMedia === 'png' ? t('backgroundPng')
          : view.backgroundMedia === 'jpg' ? t('backgroundJpg') : t('backgroundWebp')

  function updatePreference<K extends keyof AstrologyPreferenceChanges>(key: K, value: AstrologyPreferenceChanges[K]): void {
    void controller.configure({ [key]: value })
  }

  return <section className="dsh-astrology-settings" aria-label={t('title')} aria-busy={busy || loading}>
    <header className="dsh-astrology-pageHeader">
      <h2>{t('title')}</h2>
      <p>{t(native ? 'description' : 'rendererDescription')}</p>
    </header>
    {loading && <p className="dsh-astrology-loading" role="status">{t('loading')}</p>}
    {notice === 'loadFailure' && <div className="dsh-astrology-cardFooter">
      <p role="alert">{t('loadFailure')}</p>
      <button type="button" className="dsh-astrology-secondaryButton" disabled={loading || busy}
        onClick={() => { void controller.refresh() }}>{t('retry')}</button>
    </div>}

    <section className="dsh-astrology-group" aria-labelledby="astrology-brand-heading">
      <header className="dsh-astrology-groupHeader">
        <h3 id="astrology-brand-heading">{t('brandSection')}</h3>
        <p>{t('brandDescription')}</p>
      </header>
      <fieldset className="dsh-astrology-card" disabled={busy || !view}>
        <label className="dsh-astrology-row">
          <span>{t('brandChinese')}</span>
          <input className="dsh-astrology-textInput" maxLength={24} value={draft.chinese}
            onChange={event => controller.editBrand('chinese', event.target.value.slice(0, 24))} />
        </label>
        <label className="dsh-astrology-row">
          <span>{t('brandEnglish')}</span>
          <input className="dsh-astrology-textInput" maxLength={32} value={draft.english}
            onChange={event => controller.editBrand('english', event.target.value.slice(0, 32))} />
        </label>
        <div className="dsh-astrology-cardFooter">
          <span className="dsh-astrology-helper">{t('brandScope')}</span>
          <button className="dsh-astrology-primaryButton" type="button" disabled={!brandChanged || !draft.chinese.trim() || busy}
            onClick={() => { void controller.saveBrand() }}>{t('saveBrand')}</button>
        </div>
      </fieldset>
    </section>

    <section className="dsh-astrology-group" aria-labelledby="astrology-background-heading">
      <header className="dsh-astrology-groupHeader">
        <h3 id="astrology-background-heading">{t('backgroundSection')}</h3>
        <p>{t('backgroundDescription')}</p>
      </header>
      <fieldset className="dsh-astrology-card" disabled={busy || !view}>
        <label className="dsh-astrology-row">
          <span>{t('backgroundFit')}</span>
          <select value={view?.backgroundFit ?? 'cover'} onChange={event => updatePreference('backgroundFit', event.target.value === 'contain' ? 'contain' : 'cover')}>
            <option value="cover">{t('coverFit')}</option><option value="contain">{t('contain')}</option>
          </select>
        </label>
        <label className="dsh-astrology-row">
          <span>{t('backgroundLoop')}</span>
          <input type="checkbox" checked={view?.backgroundLoop !== false}
            disabled={view?.backgroundMedia === 'png' || view?.backgroundMedia === 'jpg' || view?.backgroundMedia === 'webp'}
            onChange={event => updatePreference('backgroundLoop', event.target.checked)} />
        </label>
        <div className="dsh-astrology-cardFooter">
          <span className="dsh-astrology-helper">{backgroundLabel}</span>
          <div className="dsh-astrology-buttonGroup">
            {controller.clearBackground && view?.backgroundMedia && <button type="button"
              className="dsh-astrology-secondaryButton" disabled={busy}
              onClick={() => { void controller.clearBackground?.() }}>{t('clearBackground')}</button>}
            <button type="button" className="dsh-astrology-secondaryButton" disabled={busy || !view} onClick={() => { void controller.chooseBackground() }}>
              {t('chooseBackground')}
            </button>
          </div>
        </div>
        {(view?.backgroundMedia === 'png' || view?.backgroundMedia === 'jpg' || view?.backgroundMedia === 'webp')
          && <p className="dsh-astrology-inlineNote">{t('imageLoopNote')}</p>}
      </fieldset>
    </section>

    <section className="dsh-astrology-group" aria-labelledby="astrology-intro-heading">
      <header className="dsh-astrology-groupHeader">
        <h3 id="astrology-intro-heading">{t('introSection')}</h3>
        <p>{t(native ? 'introDescription' : 'workspaceIntroDescription')}</p>
      </header>
      <fieldset className="dsh-astrology-card" disabled={busy || !view}>
        <label className="dsh-astrology-row"><span>{t('intro')}</span>
          <input type="checkbox" checked={view?.introEnabled === true} onChange={event => updatePreference('introEnabled', event.target.checked)} />
        </label>
        <label className="dsh-astrology-row"><span>{t('sound')}</span>
          <input type="checkbox" checked={view?.videoSound === true} onChange={event => updatePreference('videoSound', event.target.checked)} />
        </label>
        {native && <label className="dsh-astrology-row"><span>{t('startupDisplay')}</span>
          <select value={view?.startupDisplay ?? 'window'} onChange={event => updatePreference('startupDisplay', event.target.value === 'fullscreen' ? 'fullscreen' : 'window')}>
            <option value="window">{t('window')}</option><option value="fullscreen">{t('fullscreen')}</option>
          </select>
        </label>}
        <label className="dsh-astrology-row"><span>{t('introFit')}</span>
          <select value={view?.videoFit ?? 'contain'} onChange={event => updatePreference('videoFit', event.target.value === 'cover' ? 'cover' : 'contain')}>
            <option value="contain">{t('contain')}</option><option value="cover">{t('coverFit')}</option>
          </select>
        </label>
        <div className="dsh-astrology-cardFooter">
          <span className="dsh-astrology-helper">{t(view?.media ? 'introVideo' : 'introDefault')}</span>
          <div className="dsh-astrology-buttonGroup">
            {controller.clearVideo && view?.media && <button type="button"
              className="dsh-astrology-secondaryButton" disabled={busy}
              onClick={() => { void controller.clearVideo?.() }}>{t('clearVideo')}</button>}
            <button type="button" className="dsh-astrology-secondaryButton" disabled={busy || !view} onClick={() => { void controller.chooseVideo() }}>{t('chooseVideo')}</button>
            <button type="button" className="dsh-astrology-secondaryButton" disabled={busy || !view} onClick={() => {
              void controller.preview().then(opened => { if (opened && native) close() })
            }}>{t('preview')}</button>
          </div>
        </div>
        <p className="dsh-astrology-inlineNote">{t(native ? 'introSequence' : 'workspaceIntroSequence')}</p>
      </fieldset>
    </section>

    <section className="dsh-astrology-group" aria-labelledby="astrology-slider-heading">
      <header className="dsh-astrology-groupHeader">
        <h3 id="astrology-slider-heading">{t('sliderSection')}</h3>
        <p>{t('sliderNote')}</p>
      </header>
      <fieldset className="dsh-astrology-card" disabled={busy || !view}>
        <label className="dsh-astrology-row"><span>{t('sliderStyle')}</span>
          <select value={view?.reasoningSliderStyle ?? 'codex'} onChange={event => updatePreference('reasoningSliderStyle',
            event.target.value === 'minimal' ? 'minimal' : event.target.value === 'stage' ? 'stage' : 'codex')}>
            <option value="codex">{t('sliderCodex')}</option><option value="stage">{t('sliderStage')}</option><option value="minimal">{t('sliderMinimal')}</option>
          </select>
        </label>
        <label className="dsh-astrology-row"><span>{t('sliderMotion')}</span>
          <input type="checkbox" checked={view?.reasoningSliderMotion !== false} onChange={event => updatePreference('reasoningSliderMotion', event.target.checked)} />
        </label>
      </fieldset>
    </section>

    <section className="dsh-astrology-group" aria-labelledby="astrology-companion-heading">
      <header className="dsh-astrology-groupHeader">
        <h3 id="astrology-companion-heading">{t('companionSection')}</h3>
        <p>{t('companionDescription')}</p>
      </header>
      {native ? <fieldset className="dsh-astrology-card" disabled={busy || !view}>
        <label className="dsh-astrology-row"><span>{t('pet')}</span>
          <input type="checkbox" checked={view?.petEnabled === true} onChange={event => updatePreference('petEnabled', event.target.checked)} />
        </label>
        <p className="dsh-astrology-inlineNote">{t('companionHelp')}</p>
      </fieldset> : <p className="dsh-astrology-inlineNote">{t('windowsPetHelp')}</p>}
    </section>

    <p className="dsh-astrology-status" role="status" aria-live="polite">{t(notice === 'loadFailure' ? 'statusEmpty' : notice || 'statusEmpty')}</p>
  </section>
}
