/** Native Astrology presentation adapter; no credentials or filesystem paths cross this face. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { BoundActions } from '@deepseek-ai/dsh-client-store'
import type { AstrologyClient } from './host-api.ts'
import { AstrologyBrandMark, AstrologyBrandName, AstrologySettings } from './Astrology.tsx'
import { createAstrologyBrandStore } from './store.ts'
import { observePreferences } from './observe.ts'

/** Preferences committed by the restricted native carrier. */
export type { AstrologyPreferences } from './host-api.ts'
import type { AstrologyPreferences } from './host-api.ts'

export const zh = {
  nav: '星术', title: '星术 · ASTROLOGY', description: '个性化侧栏名称、主界面背景、启动片头、思考强度控件与桌面伙伴。',
  brandSection: '侧栏名称', brandDescription: '自定义侧栏星形标志旁的两行文字。', brandChinese: '中文名称', brandEnglish: '英文名称', brandScope: '仅修改主界面侧栏文字；其他“星术”名称保持不变。', saveBrand: '保存名称',
  backgroundSection: '主界面背景', backgroundDescription: '应用进入后在新会话、会话内容和设置页面显示；欢迎向导与片头动画不受影响。',
  backgroundFit: '画面适配', backgroundLoop: '循环播放视频', backgroundDefault: '当前：未选择背景',
  backgroundMp4: '当前：自定义 MP4 视频', backgroundWebm: '当前：自定义 WebM 视频', backgroundPng: '当前：自定义 PNG 图片',
  backgroundJpg: '当前：自定义 JPEG 图片', backgroundWebp: '当前：自定义 WebP 图片', imageLoopNote: '静态图片不需要循环播放；选择视频后将按此开关设置循环。',
  chooseBackground: '更换背景图片或视频',
  introSection: '启动片头', introDescription: '管理进入主界面前播放的片头视频与窗口行为。', intro: '启动时播放片头', sound: '播放片头声音',
  startupDisplay: '启动窗口', window: '跟随窗口（默认）', fullscreen: '全屏启动', introFit: '片头画面适配', contain: '完整显示', coverFit: '铺满并裁切',
  introVideo: '已选择自定义片头视频', introDefault: '未导入时使用默认星术动画封面', chooseVideo: '更换片头视频', preview: '预览片头',
  introSequence: '片头顺序：视频播放 → 星术 Logo 动画 → 主界面。播放中按 Esc 可跳过。全屏启动后可按 F11 切换。',
  sliderSection: '思考强度控件', sliderStyle: '滑动条样式', sliderCodex: '跟随主题（推荐）', sliderStage: '舞台紫金', sliderMinimal: '极简中性', sliderMotion: '滑动过渡动效',
  sliderNote: '只调整会话模型菜单中思考强度滑动条的外观，不改变模型档位或实际思考强度。',
  companionSection: '桌面伙伴', companionDescription: '控制悬浮桌面伙伴的显示。', pet: '显示桌面伙伴',
  companionHelp: '长按伙伴约 0.35 秒后拖动；右键可打开菜单。悬停会触发动作。',
  statusEmpty: '', saved: '设置已保存。', failure: '保存失败，请重试。', loading: '正在读取设置…',
  unchanged: '设置未更改。', loadFailure: '无法读取设置，请重试。', retry: '重新读取', previewFailure: '无法预览片头，请重试。',
  rendererDescription: '主题已启用。可修改侧栏名称及工作区背景，设置和媒体保存在当前应用的数据中。',
  workspaceIntroDescription: '工作区加载时播放星术动画或你选择的视频。',
  workspaceIntroSequence: '片头在应用窗口内播放。按 Esc 或点击「跳过片头」返回工作区。',
  clearVideo: '移除片头视频',
  windowsPetHelp: '官方 Windows 版可通过星术插件的 desktopPet 配置启动独立的桌面伙伴。操作见插件 README。',
  clearBackground: '移除背景',
}
export const en: Record<keyof typeof zh, string> = {
  nav: 'Astrology', title: '星术 · ASTROLOGY', description: 'Personalize the sidebar name, workspace background, startup intro, reasoning slider and desktop companion.',
  brandSection: 'Sidebar name', brandDescription: 'Change the two lines beside the star mark in the sidebar.', brandChinese: 'Chinese name', brandEnglish: 'English name', brandScope: 'Only the primary sidebar text changes; other Astrology names stay fixed.', saveBrand: 'Save name',
  backgroundSection: 'Workspace background', backgroundDescription: 'Shown in new sessions, conversations and settings after entering the app. The welcome wizard and intro animation are unaffected.',
  backgroundFit: 'Image framing', backgroundLoop: 'Loop video', backgroundDefault: 'Current: no background selected',
  backgroundMp4: 'Current: custom MP4 video', backgroundWebm: 'Current: custom WebM video', backgroundPng: 'Current: custom PNG image',
  backgroundJpg: 'Current: custom JPEG image', backgroundWebp: 'Current: custom WebP image', imageLoopNote: 'Static images do not loop. This setting applies when a video is selected.',
  chooseBackground: 'Choose background image or video',
  introSection: 'Startup intro', introDescription: 'Manage the video shown before the primary workspace opens.', intro: 'Play intro on launch', sound: 'Play intro audio',
  startupDisplay: 'Startup window', window: 'Follow window (default)', fullscreen: 'Start fullscreen', introFit: 'Intro framing', contain: 'Show entire image', coverFit: 'Fill and crop',
  introVideo: 'A custom intro video is selected', introDefault: 'Uses the default Astrology animation cover when no video is imported', chooseVideo: 'Choose intro video', preview: 'Preview intro',
  introSequence: 'Sequence: video → Astrology logo animation → workspace. Press Esc to skip during playback. Press F11 to toggle fullscreen.',
  sliderSection: 'Reasoning slider', sliderStyle: 'Slider style', sliderCodex: 'Follow theme (recommended)', sliderStage: 'Stage violet', sliderMinimal: 'Minimal neutral', sliderMotion: 'Slider transition',
  sliderNote: 'Changes only the reasoning slider appearance in the conversation model menu, not the model level or actual reasoning strength.',
  companionSection: 'Desktop companion', companionDescription: 'Control the floating desktop companion.', pet: 'Show desktop companion',
  companionHelp: 'Hold for about 0.35 seconds to drag. Right-click for its menu; hovering triggers an action.',
  statusEmpty: '', saved: 'Settings saved.', failure: 'Save failed. Please try again.', loading: 'Loading settings…',
  unchanged: 'Settings unchanged.', loadFailure: 'Could not load settings. Please try again.', retry: 'Retry', previewFailure: 'Could not preview the intro. Please try again.',
  rendererDescription: 'The theme is active. Customize the sidebar name and workspace background. Preferences and media are stored in this app.',
  workspaceIntroDescription: 'Play the Astrology animation or an imported video when the workspace loads.',
  workspaceIntroSequence: 'The intro plays inside the app window. Press Esc or select Skip intro to return to the workspace.',
  clearVideo: 'Remove intro video',
  windowsPetHelp: 'On stock Windows Desktop, enable the separate companion using the plugin’s desktopPet setting. See the plugin README.',
  clearBackground: 'Remove background',
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Native Astrology settings copy. */
    'brand.astrology': keyof typeof zh
  }
}

/** @param ctx Child context with locale and slot services. @param api Restricted native carrier. */
export function mountAstrology(ctx: Context, api: AstrologyClient, native: boolean): void {
  const ns = 'brand.astrology'
  ctx.effect(() => ctx.locale.register(ns, { zh, en }), 'Astrology dictionaries')
  const t = ctx.locale.bind(ns)
  const store = createAstrologyBrandStore()
  let brandActions: BoundActions<typeof store> | undefined
  let latest: AstrologyPreferences | undefined
  const syncBrand = (chinese: string, english: string): void => { brandActions?.sync(chinese, english) }
  ctx.effect(() => observePreferences(api, view => {
    latest = view
    syncBrand(view.brandChinese, view.brandEnglish)
  }), 'Astrology brand preferences')
  ctx.slots.inject('sidebar.brand.mark', () => ctx.slots.register({ name: 'sidebar.brand.mark', priority: -10 }, AstrologyBrandMark))
  ctx.slots.inject('sidebar.brand.name', () => ctx.slots.register({ name: 'sidebar.brand.name', priority: -10, store,
    inject: (actions: BoundActions<typeof store>) => {
      brandActions = actions
      if (latest) actions.sync(latest.brandChinese, latest.brandEnglish)
      return {}
    },
  }, AstrologyBrandName))
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section', id: 'astrology', order: 12, label: () => t('nav'), locale: ns,
    store,
    inject: () => ({ api, native }),
  }, AstrologySettings))
}
