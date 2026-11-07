# DSH Astrology Plugin

Astrology adds a coordinated theme and Desktop personalization to DeepSeek Harness: a custom sidebar identity, workspace backdrop, startup intro, reasoning slider appearance and a floating Desktop companion.

**Stock DeepSeek Harness Desktop supports the theme, sidebar branding, workspace backgrounds, an in-app intro and a reasoning slider.** Windows also supports an optional floating companion. Hosts with Astrology API v1 can provide the native intro and companion integration. [Host integration](HOST-INTEGRATION.md)

English | [简体中文](README.zh-CN.md)

## Features

- Light and dark Astrology palettes using the DSH theme service.
- Chinese and English sidebar branding.
- User-selected image or video background, startup intro controls, and appearance-only reasoning slider choices.
- Optional independent floating companion on Windows and companion controls on hosts with Astrology API v1.
- Stock mode stores preferences and media locally in the DSH interface. Native mode delegates storage to the host.
- Retry failed settings reads in place. Unsaved names survive unrelated changes, and settings follow host updates.
- Background video retains its playback position across name, companion and framing changes, and pauses when the host reports a hidden window.
- Includes project-generated companion artwork and excludes the default background video because its redistribution terms are not recorded.

## Install

Launch Desktop once to initialize its profile, then quit Desktop completely and install using the DSH command:

```sh
dsh plugin --profile desktop add github:astra2425/dsh-astrology
```

Open Desktop again. The theme applies automatically. In **Settings → Astrology**, edit the sidebar name, import or remove a background, enable or preview the intro, and choose a slider style. Stock mode accepts PNG, JPEG, WebP, MP4 and WebM backgrounds and MP4/WebM intros, with a 128 MiB limit per file.

- The intro plays as the workspace loads. Press Esc or select **Skip intro**. An imported video plays for up to 60 seconds. With no video, Astrology shows its logo animation.
- The slider appears under **Model → Effort** when the model provides at least two choices. It activates the host's existing effort buttons and targets the DSH 0.2.2-rc.1 menu layout.

To uninstall:

```sh
dsh plugin --profile desktop remove @dsh-external/dsh-plugin-astrology
```

To update the installed plugin:

```sh
dsh plugin --profile desktop update @dsh-external/dsh-plugin-astrology
```

Stock mode stores settings in local storage and imported media in IndexedDB. The data remains after uninstalling the plugin. Native mode uses separate storage managed by the host.

### Floating companion on Windows

Quit Desktop completely, then run these commands in PowerShell. Replace the executable path with your installation path.

```powershell
$env:DSH_ASTROLOGY_DESKTOP_PET = '1'
& 'E:\Program Files\DeepSeek Harness\DeepSeek Harness.exe'
```

Drag the companion to move it or use its context menu to close it. The helper exits when the plugin unloads or the DSH Host exits. For persistent enablement, set `desktopPet: true` in the plugin's Cordis entry configuration.

## Build from source

Requires Node.js 22.19 or later and pnpm 11.28.5. The checked-in `lib/` is the runtime consumed by GitHub installation; users do not need to build it.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
pnpm pack --dry-run
```

The build has no install lifecycle script. See [CONTRIBUTING.md](CONTRIBUTING.md) for the change process.

Regression checks use host and DOM substitutes to cover settings, media lifecycle and loading the built plugin. They do not establish official Desktop native-window compatibility. CI and Release also require rebuilt `lib/` to match the committed artifacts.

## Compatibility

The client uses DSH theme and settings extension points. The in-app intro runs after the renderer loads. Showing an intro before the workspace opens and controlling the native startup window require a compatible host.

## Troubleshooting

- **No Astrology settings:** confirm the bundle is enabled in the Desktop profile, then quit and reopen Desktop.
- **No slider:** open the model's Effort pane and check that the model provides at least two choices. If a newer host changes the menu layout, the stock effort buttons remain available.
- **An imported background is blank:** try a supported image or an MP4/WebM file your Desktop build can decode.
- **Settings did not save:** retry once Desktop is responsive. The UI keeps the last committed values when the host rejects a write.
- **Settings could not load:** select **Retry** without closing settings. Cancelling a media picker reports **Settings unchanged**.
- **Intro preview failed:** settings stay open with an error message. Retry once the host is responsive.

## License and notices

Plugin source and project-owned resources are under MIT. The companion adaptation preserves the third-party attribution and MIT notice in [NOTICE.txt](NOTICE.txt) and [DSH-PET-MIT.txt](DSH-PET-MIT.txt). Review [ASSET-LICENSES.md](ASSET-LICENSES.md) before publishing; do not add media without documented redistribution rights.

## Repository setup

Use [GITHUB-SETUP.md](GITHUB-SETUP.md) for the recommended repository name, topics, first push and release steps. Security reports go through [SECURITY.md](SECURITY.md).
