# Official Desktop host integration

## Status

The stock-host mode already provides the theme, sidebar branding and workspace media through the standard DSH client plugin. This document concerns the additional native features.

This is a required upstream change, not functionality that the external plugin can install by itself. The current official Desktop release does not expose the Astrology API used by this plugin. Full functionality becomes installable only after the API and its Desktop implementation ship in an official DSH release.

The local `deepseek-harness` checkout contains a private Astrology implementation in its current uncommitted worktree. That work is useful as a behavior reference, but it does not establish a published extension contract. Do not advertise current released DSH versions as compatible based on this checkout.

## Public contract

The Desktop Host publishes a versioned capability package, tentatively `@deepseek-ai/dsh-desktop-api`, and registers an optional `desktopAstrology` service. The package name and service key are proposed values and must be confirmed in upstream review before publishing this plugin.

```ts
export interface DesktopAstrologyService {
  readonly apiVersion: 1
  /** Enable Astrology for this Desktop process and return a disposer. */
  activate(): () => void
}

export interface AstrologyView {
  readonly introEnabled: boolean
  readonly videoSound: boolean
  readonly startupDisplay: 'window' | 'fullscreen'
  readonly videoFit: 'contain' | 'cover'
  readonly reasoningSliderStyle: 'codex' | 'stage' | 'minimal'
  readonly reasoningSliderMotion: boolean
  readonly petEnabled: boolean
  readonly media: 'mp4' | 'webm' | null
  readonly brandChinese: string
  readonly brandEnglish: string
  readonly backgroundMedia: 'mp4' | 'webm' | 'png' | 'jpg' | 'webp' | null
  readonly backgroundLoop: boolean
  readonly backgroundFit: 'cover' | 'contain'
  readonly mediaURL: string | null
  readonly backgroundURL: string | null
}

export interface AstrologyRendererApi {
  readonly apiVersion: 1
  state(): Promise<AstrologyView>
  onSettings(listener: (view: AstrologyView) => void): () => void
  claimIntro(): Promise<boolean>
  presentation(enabled: boolean): Promise<void>
  toggleFullscreen(): Promise<void>
  onShown(listener: () => void): () => void
  onVisibility(listener: (visible: boolean) => void): () => void
  configure(changes: AstrologyPreferenceChanges): Promise<AstrologyView>
  chooseVideo(): Promise<AstrologyView>
  chooseBackground(): Promise<AstrologyView>
}
```

The bundle's Host entry reads `desktopAstrology` with optional service lookup. If the service is present and has `apiVersion: 1`, the entry calls `activate()` and returns its disposer through `ctx.effect()`. When absent, Web and other non-Desktop profiles load without activating native behavior. The Desktop Host loads only fixed resources from the installed plugin's resolved package directory through a fixed allowlist; it never accepts a renderer-supplied path.

The client bridge is exposed only to the top-level `dsh-app://app/` main frame. It contains no Electron objects, filesystem paths, raw IPC channel names, arbitrary file paths, or generic command dispatch. It accepts only typed preference changes; the Host parses every durable or cross-process value and rejects unknown keys. The Host marks the application root as Astrology-enabled before client feature registration so the official model-selection package can add its existing reasoning control.

The Desktop service is inactive unless the external plugin activates it. Activation owns the process-level listeners and windows; disposal closes the intro and companion windows, removes listeners, and prevents later preference or media operations. The settings and user-imported media remain under the application's Astrology userData directory after plugin removal unless the user explicitly clears them.

## Required host behavior

1. **Activation and lifecycle:** register a Desktop-only `desktopAstrology` Host service; its `activate()` returns an idempotent disposer. No intro or companion window appears until the plugin activates the service and persisted preferences enable it.
2. **Caller checks:** validate every IPC caller against the primary application window and main frame; validate the intro and pet windows against their owned BrowserWindows. Reject unowned frames and invalid argument types.
3. **Preference storage:** read and write a versioned JSON record under `app.getPath('userData')/astrology/`. Use atomic writes and the host's normal directory/file modes. Preserve safe defaults when optional fields are absent.
4. **Media selection:** show native pickers from the primary window. Accept only MP4/WebM intro files and MP4/WebM/PNG/JPEG/WebP backgrounds. Verify file size, regular-file status and signatures before copying. Never accept a renderer-supplied path.
5. **Asset routes:** serve only a fixed allowlist of bundled plugin resources and revisioned imported-media URLs. Support GET/HEAD and bounded single byte ranges for video. Set MIME type, `nosniff`, cache rules and no filesystem-derived URL.
6. **Window ownership:** create intro and pet windows with the existing sandbox and context isolation settings. Keep creation, fullscreen, pointer routing, menu and shutdown inside the host implementation.
7. **Failure handling:** return structured actionable failures for unsupported API, file validation, persistence and missing media. A rejected preference write leaves the previous committed state visible.
8. **Compatibility:** export `apiVersion: 1` from both the Host service and preload projection. Incompatible callers fail at activation with an explicit diagnostic. Any incompatible later contract change requires a new API version and an upgrade note.

## Upstream change inventory

The official PR should:

- Add the public API package and generated/reference documentation for its Host service and preload API.
- Add the Desktop service provider, gated by plugin activation, and move the current `AstrologyDesktop` implementation behind that provider.
- Keep private IPC handlers, window creation, native dialogs, file validation, settings writes and fixed asset routes in `apps/desktop`.
- Expose only the versioned, path-free renderer API through preload.
- Remove built-in Astrology UI registration from `ui-brand-official`; preserve the default official brand when this plugin is absent.
- Add a public client extension point for slider appearance if the existing `model.effort` UI slot cannot safely support the three styles and motion preference.
- Ensure the Desktop feature marker and path-free preload projection are available before `ui-model-selection` decides whether the plugin's reasoning slider presentation is active.
- Keep Web clients functional without Desktop support and prevent an optional plugin dependency from making Web, headless, SDK or ACP profiles fail at load.
- Update desktop/profile package manifests so plugin code does not import Electron or private packages directly.
- Update Desktop user documentation and the API upgrade documentation in the same upstream PR.

## Review and acceptance

The official maintainers must review the public API names, package location, service lifecycle and compatibility policy. Before declaring the Astrology plugin supported, verify the API package is in a released DSH version, the official Desktop profile provides it, and an independently installed plugin can activate and dispose the capability. This repository's documentation must name that released DSH version; until then it must label installation as pending upstream support.
