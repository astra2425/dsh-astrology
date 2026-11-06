# DSH Astrology Plugin

Astrology adds a coordinated theme and Desktop personalization to DeepSeek Harness: a custom sidebar identity, workspace backdrop, startup intro, reasoning slider appearance and a floating Desktop companion.

**Full functionality requires an official DeepSeek Harness Desktop release that provides Astrology API v1.** That host API is not part of the current public release. Until the upstream API is reviewed and shipped, installing the plugin shows a compatibility notice and does not create native windows. See [HOST-INTEGRATION.md](HOST-INTEGRATION.md).

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

Install only after the official Desktop release notes announce Astrology API v1:

```sh
dsh plugin --profile desktop add github:astra2425/dsh-astrology
```

Restart Desktop to load the bundle. To remove it:

```sh
dsh plugin --profile desktop remove @dsh-external/dsh-plugin-astrology
```

To update the installed plugin:

```sh
dsh plugin --profile desktop update @dsh-external/dsh-plugin-astrology
```

Settings and imported media remain in Desktop user data after removal. The current plugin has no data-clear control. To remove them, close Desktop and delete the `astrology` subdirectory inside that installation's application `userData` directory; confirm the exact directory with the Desktop documentation for your operating system before deleting it.

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

The plugin's client bundle is loaded as a normal DSH Web client plugin. On a host without Astrology API v1, it applies the theme and reports that the full Desktop feature set is unavailable. Full Desktop behavior requires the official API, preload bridge and native resource support described in [HOST-INTEGRATION.md](HOST-INTEGRATION.md).

## Troubleshooting

- **No Astrology settings:** confirm the bundle is enabled in the Desktop profile, restart Desktop, and check that its release provides Astrology API v1.
- **The compatibility notice remains:** the installed Desktop host does not expose API v1, or the plugin and host API versions differ. Update Desktop after upstream support is released.
- **An imported background is blank:** choose a supported image or MP4/WebM file again. Media is validated and served by the official Desktop host.
- **Settings did not save:** retry once Desktop is responsive. The UI keeps the last committed values when the host rejects a write.
- **Settings could not load:** select **Retry** without closing settings. Cancelling a media picker reports **Settings unchanged**.
- **Intro preview failed:** settings stay open with an error message. Retry once the host is responsive.

## License and notices

Plugin source and project-owned resources are under MIT. The companion adaptation preserves the third-party attribution and MIT notice in [NOTICE.txt](NOTICE.txt) and [DSH-PET-MIT.txt](DSH-PET-MIT.txt). Review [ASSET-LICENSES.md](ASSET-LICENSES.md) before publishing; do not add media without documented redistribution rights.

## Repository setup

Use [GITHUB-SETUP.md](GITHUB-SETUP.md) for the recommended repository name, topics, first push and release steps. Security reports go through [SECURITY.md](SECURITY.md).
