# Astrology Standalone Plugin Implementation Plan

> **For agentic workers:** This plan is executed inline in the current session. Each task is tracked with checkboxes; do not modify the source checkout under `../deepseek-harness`.

**Goal:** Prepare `astrology/` as an independently installable DeepSeek Harness desktop plugin repository with a documented upstream host integration and complete GitHub open-source materials.

**Architecture:** The plugin is a root-level DSH bundle with a Node host-facing plugin and a Web client plugin. A restricted, versioned Desktop Astrology capability contract is documented as an upstream prerequisite; the plugin does not import Electron or private monorepo modules. Published runtime artifacts are checked into the repository so GitHub installation does not run plugin lifecycle scripts.

**Tech Stack:** TypeScript ESM, Cordis, React, DSH bundle metadata, pnpm, GitHub Actions, Markdown.

## Global Constraints

- Keep all deliverables in `astrology/`; do not edit or clean the existing `deepseek-harness` checkout.
- Target the official DSH Desktop profile and state Desktop/API version requirements explicitly.
- Never expose local filesystem paths, raw Electron IPC, or general-purpose Node APIs to the Web client.
- Include only source assets whose redistribution rights are clear; inventory large or third-party assets before copying them.
- Keep built runtime output in the plugin repository; GitHub installation must not require `prepare`, `postinstall`, or other lifecycle scripts.
- Do not create or run tests in this task; perform read-only source, manifest, and documentation consistency reviews only.
- Prepare local files only; do not create a remote repository, push, publish a package, or create a release.

---

### Task 1: Record source map and asset provenance

**Files:**
- Create: `SOURCE-MAP.md`
- Create: `ASSET-LICENSES.md`
- Read only: `../deepseek-harness/apps/desktop/src/astrology*.ts`
- Read only: `../deepseek-harness/apps/desktop/resources/astrology/`
- Read only: `../deepseek-harness/packages/client/ui-brand-official/src/client/`
- Read only: `../deepseek-harness/packages/client/ui-model-selection/src/client/`

**Interfaces:**
- Produces a feature-to-source-to-plugin mapping and an asset-by-asset redistribution decision consumed by Tasks 2–4.
- Any asset without explicit evidence of redistribution rights is marked excluded from the plugin payload.

- [x] Inventory settings, intro lifecycle, desktop companion, backdrop, brand and slider source files.
- [x] Record each asset's filename, size, source note, license evidence and inclusion decision.
- [x] Record that `background-default.mp4` is excluded because its redistribution license is not documented.
- [x] Record generated pet artwork and third-party inspiration separately; preserve attribution text when applicable.
- [x] Review the source map against the feature list in `SPEC.md`.

### Task 2: Define the upstream Desktop capability contract

**Files:**
- Create: `HOST-INTEGRATION.md`
- Create: `upstream/README.md`
- Create: `upstream/host-api.patch` only if a self-contained patch can be generated from reviewed source changes; otherwise document exact upstream files and API declarations in `HOST-INTEGRATION.md`.

**Interfaces:**
- Proposed service name: optional `desktopAstrology` on the Desktop Host, with a separate path-free client projection.
- Read returns validated preferences plus safe, revisioned asset URLs; mutation accepts only documented preference fields.
- Media selection accepts no caller-supplied path; Desktop shows its own chooser, validates bytes and stores copies under app `userData`.
- Intro and pet operations are explicit methods. No `BrowserWindow`, `ipcMain`, `ipcRenderer`, `fs`, or arbitrary URL is exposed to plugin code.
- The host declares API version and platform support; the plugin checks both before enabling Desktop-only controls.

- [x] Map each current private IPC operation to a narrow public service method or explicitly remove it from the extension contract.
- [x] Specify caller identity, lifecycle ownership, event disposal, validation, error behavior, asset serving and version compatibility.
- [x] Specify fallback behavior when the host service or required API version is absent.
- [x] List the upstream package and Desktop files that need changes and the public docs/upgrade notes they own.
- [x] Mark the plugin's full-featured installation as dependent on an upstream Desktop release carrying this API.

### Task 3: Create the standalone DSH bundle package

**Files:**
- Create: `package.json`
- Create: `cordis.patch.yml`
- Create: `pnpm-workspace.yaml`
- Create: `pnpm-lock.yaml`
- Create: `tsdown.config.ts`
- Create: `.gitignore`
- Create: `src/index.ts`
- Create: `src/client/index.ts`
- Create: `lib/` built plugin runtime output

**Interfaces:**
- Root package owns the installable package identity and `dsh.bundle.patch` declaration.
- Node entry registers the client projection only when the Desktop Astrology service and declared API version are available.
- Client entry imports only published DSH peer packages, reads a typed path-free host projection, and contributes Astrology UI through public slots.
- `lib/` is committed and matches the package export map; installation does not compile source or run lifecycle hooks.

- [x] Select the DSH package and peer version ranges from current package manifests.
- [x] Declare Cordis peers, package exports, repository metadata and published files.
- [x] Keep Desktop service optional during load so incompatible profiles can start and show an actionable unsupported-host state.
- [x] Define the Cordis patch row and package entry exports without depending on the source checkout.
- [x] Ensure package scripts expose a deliberate build command but no install lifecycle scripts.

### Task 4: Extract UI and settings behavior into the plugin

**Files:**
- Create: `src/client/astrology/Astrology.tsx`
- Create: `src/client/astrology/Astrology.module.css`
- Create: `src/client/astrology/adapter.ts`
- Create: `src/client/astrology/store.ts`
- Create: `src/client/astrology/host-api.ts`
- Create: `src/client/presentation.ts`
- Create: `src/client/theme/palette.ts`

**Interfaces:**
- Settings use the host service declared in Task 2; UI receives no local path or raw transport object.
- Slider customization changes presentation only; model effort choices and submission remain owned by the existing model-selection feature.
- Locale dictionaries are plugin-owned and include Chinese and English strings.

- [x] Extract the Astrology settings UI and branding contributors from the official brand package.
- [x] Keep slider rendering and model selection in the official package; contribute appearance variables from the plugin.
- [x] Map settings persistence and user-visible failures to the host contract.
- [x] Add host capability/version status copy and disable unsupported Desktop controls safely.
- [x] Remove imports that resolve only inside the monorepo; use public peer exports or plugin-owned types.

### Task 5: Prepare distributable resources and default behavior

**Files:**
- Create: `resources/` for licensed copied assets only.
- Modify: `src/client/Astrology.tsx` for missing-default-media copy.
- Modify: `src/index.ts` package resource registration.

**Interfaces:**
- Resource names are fixed and registered in package metadata; the host resolves them through safe package-relative resource identifiers.
- If no redistributable default video is available, the plugin starts with the built-in static/vector intro and no default video backdrop.
- User-imported media remains in Desktop `userData` and is never copied into the plugin installation directory.

- [x] Copy project-generated pet artwork and attribution material listed in `ASSET-LICENSES.md`.
- [x] Exclude `background-default.mp4` and other media without documented redistribution rights.
- [x] Preserve `NOTICE.txt` and third-party MIT text.
- [x] Ensure user-selected assets continue to be stored by the host rather than under the plugin package.
- [x] Reconcile `package.json` files, runtime routes and resource directory contents; exclude local generation metadata and duplicate asset copies.

### Task 6: Write open-source repository materials

**Files:**
- Create: `README.md`
- Create: `README.zh-CN.md`
- Create: `LICENSE`
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`
- Create: `CODE_OF_CONDUCT.md`
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Create: `.github/PULL_REQUEST_TEMPLATE.md`
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/release.yml`
- Create: `GITHUB-SETUP.md`

**Interfaces:**
- README installation instructions use `dsh plugin --profile desktop add github:astra2425/dsh-astrology` only after the required Desktop API ships.
- Release workflow builds committed `lib/`, validates metadata and creates a GitHub release; it does not publish to npm unless the user later requests that distribution.
- License terms cover only owned code and approved assets; every third-party component retains its required notices.

- [x] Write equivalent Chinese and English installation, update, removal, compatibility, troubleshooting and feature documentation.
- [x] Add the chosen repository topic list and exact first-push instructions without embedding credentials.
- [x] Provide issue and security-report paths that do not promise an unstaffed response time.
- [x] Define CI as static install/build/package checks; do not add tests in this task.
- [x] Document that GitHub repository creation, remote push and release remain user actions.

### Task 7: Review package consistency and hand off

**Files:**
- Review: all files under `astrology/`
- Update: `SPEC.md` only if the approved scope changes during extraction.
- Update: `IMPLEMENTATION_PLAN.md` checkboxes.

**Interfaces:**
- The repository must be internally installable and explain the official Desktop API prerequisite without claiming that an unreleased host supports it.
- The original source checkout remains unchanged by this task.

- [x] Compare package exports, Cordis patch metadata, peer ranges and checked-in `lib/` contents.
- [x] Review links, commands, license claims, source provenance and platform labels across both READMEs and setup guides.
- [x] Inspect `git status` for `astrology/` and `deepseek-harness/`; retain only intended Astrology repository changes.
- [x] Record that no tests were created or run and list remaining upstream merge/release prerequisites.

## Plan self-review

- The source mapping and license review cover every feature and asset before copying.
- The host API is a prerequisite, not an undocumented assumption; the package reports unsupported hosts safely.
- Plugin packaging, UI extraction, resources and GitHub materials each have explicit deliverables.
- No remote GitHub action is part of this plan, and the user's source working tree is protected.
