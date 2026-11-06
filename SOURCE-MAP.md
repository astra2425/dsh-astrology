# Source map

This repository is being prepared from local Astrology work in `../deepseek-harness` and the existing theme prototype in `../packages/astrology-theme`. The source checkout is not modified by this map.

| Feature | Current source | Plugin destination | Extraction notes |
|---|---|---|---|
| Light and dark semantic palette | `../packages/astrology-theme/src/palette.ts`, `lib/client.js` | `src/client/theme/`, `lib/client.js` | Keep token override effect reversible and register through the public theme service. |
| Settings page, sidebar label and mark | `../deepseek-harness/packages/client/ui-brand-official/src/client/Astrology.tsx`, `Astrology.module.css`, `astrology-adapter.ts`, `astrology-store.ts` | `src/client/astrology/` | Move ownership from official branding to this plugin. Replace monorepo-only registrations with public client slots. |
| Reasoning slider appearance preference | `../deepseek-harness/packages/client/ui-model-selection/src/client/index.ts`, `ModelSelect.tsx`, `EffortSlider.tsx`, `EffortSlider.module.css` | `src/client/presentation.ts` supplies theme variables; a public slider-appearance contribution belongs to the upstream client extension point. | Keep model catalog, effort capability selection and persistence in the official model-selection package. Do not duplicate the slider component. |
| Desktop preferences, intro, imported media and safe asset delivery | `../deepseek-harness/apps/desktop/src/astrology.ts`, `astrology-api.ts`, `astrology-state.ts`, `preload-astrology.ts` | `upstream/` integration proposal; plugin client consumes the versioned public projection | Electron behavior stays in the official Desktop host. The plugin must not bundle or import the current private Desktop implementation. |
| Intro and companion windows | `../deepseek-harness/apps/desktop/src/astrology-intro-window.ts`, `astrology-pet.ts`, `astrology-pet-*.ts`, `astrology-intro-window.ts` | `upstream/` integration proposal | Host owns BrowserWindow creation, IPC sender checks, window lifetime, pointer routing and shutdown. |
| Desktop presentation resources | `../deepseek-harness/apps/desktop/resources/astrology/` plus `../design/assets/` | `resources/desktop/` contains the intro/pet/hint runtime, scoped intro stylesheet, licensed notices, and cleared generated artwork | The default video and local generation metadata are excluded. Runtime URLs use the fixed `/astrology/` resource namespace; see `HOST-INTEGRATION.md`. |
| Product and Desktop documentation | `../deepseek-harness/apps/desktop/README.md`, `README.zh.md`; `../deepseek-harness/packages/client/ui-brand-official/README.md`, `README.zh.md` | `README.md`, `README.zh-CN.md`, `HOST-INTEGRATION.md` | Rewrite as external-plugin instructions and distinguish shipped support from the required future official host API. |
| Original theme-only package | `../packages/astrology-theme/package.json`, `cordis.patch.yml`, `src/palette.ts`, `scripts/build.mjs` | Standalone root manifest, `cordis.patch.yml`, `src/client/theme/` | Prototype is private and Web-only; package metadata must be rebuilt for the full Desktop plugin. |

## Ownership split

The official Desktop host owns Electron windows, preload APIs, IPC validation, imported media, protocol routes and process-level lifecycle. The plugin owns Cordis registrations, its client settings and brand UI, theme colors, slider appearance and the text/resources it has rights to distribute.

## Extraction status

The plugin UI and approved resources have been extracted into this repository. The Desktop host API must ship in an official release before the standalone plugin can provide the full Desktop experience.
