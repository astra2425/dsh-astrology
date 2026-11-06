# DSH Astrology Plugin

Astrology adds a coordinated theme and Desktop personalization to DeepSeek Harness: a custom sidebar identity, workspace backdrop, startup intro, reasoning slider appearance and a floating Desktop companion.

**Stock DeepSeek Harness Desktop supports the theme, sidebar names and workspace backgrounds.** Native startup intro, reasoning slider styling and the floating companion require a host with Astrology API v1. See [HOST-INTEGRATION.md](HOST-INTEGRATION.md).

English | [简体中文](README.zh-CN.md)

## Features

- Light and dark Astrology palettes using the DSH theme service.
- Chinese and English sidebar branding.
- User-selected image or video background, startup intro controls, and appearance-only reasoning slider choices.
- Desktop companion controls backed by the official Desktop host.
- Settings persist in the official Desktop user data directory. The plugin receives no local paths or raw Electron APIs.
- Retry failed settings reads in place. Unsaved names survive unrelated changes, and settings follow host updates.
- Background video retains its playback position across name, companion and framing changes, and pauses when the host reports a hidden window.
- Includes project-generated companion artwork and excludes the default background video because its redistribution terms are not recorded.

## Install

Launch Desktop once to initialize its profile, then quit Desktop completely and install using the DSH command:

```sh
dsh plugin --profile desktop add github:astra2425/dsh-astrology
```

Open Desktop again. The theme applies automatically. In **Settings → Astrology**, save the sidebar names or import a PNG, JPEG, WebP, MP4 or WebM background (up to 128 MiB in stock mode). Use **Remove background** to delete the imported media. To uninstall:

```sh
dsh plugin --profile desktop remove @dsh-external/dsh-plugin-astrology
```

To update the installed plugin:

```sh
dsh plugin --profile desktop update @dsh-external/dsh-plugin-astrology
```

Stock mode stores settings in local storage and imported media in IndexedDB. The data remains after uninstalling the plugin. Native mode uses separate storage managed by the host.

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

The client bundle uses DSH theme and settings extension points. Stock mode exposes the theme, sidebar and background settings. Hosts with Astrology API v1 also expose native feature settings.

## Troubleshooting

- **No Astrology settings:** confirm the bundle is enabled in the Desktop profile, then quit and reopen Desktop.
- **Only theme, sidebar and background settings appear:** the host is in stock mode. Native features require Astrology API v1.
- **An imported background is blank:** try a supported image or an MP4/WebM file your Desktop build can decode.
- **Settings did not save:** retry once Desktop is responsive. The UI keeps the last committed values when the host rejects a write.
- **Settings could not load:** select **Retry** without closing settings. Cancelling a media picker reports **Settings unchanged**.
- **Intro preview failed:** settings stay open with an error message. Retry once the host is responsive.

## License and notices

Plugin source and project-owned resources are under MIT. The companion adaptation preserves the third-party attribution and MIT notice in [NOTICE.txt](NOTICE.txt) and [DSH-PET-MIT.txt](DSH-PET-MIT.txt). Review [ASSET-LICENSES.md](ASSET-LICENSES.md) before publishing; do not add media without documented redistribution rights.

## Repository setup

Use [GITHUB-SETUP.md](GITHUB-SETUP.md) for the recommended repository name, topics, first push and release steps. Security reports go through [SECURITY.md](SECURITY.md).
