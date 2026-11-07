# Changelog

## Unreleased

- Play and preview startup animation or imported intro videos in stock DSH.
- Add an effort slider that uses the stock model menu's existing effort selections.
- Add an opt-in Windows companion process with a transparent, draggable window and Host-owned cleanup.

- Enable theme, editable sidebar branding and local background media on stock Desktop without a native bridge.
- Embed namespaced CSS with fixed selectors and normalized line endings so builds match across checkout paths and operating systems.

- Validate the complete API v1 renderer bridge before mounting native settings.
- Load and dispose styles for compatibility pages as well as Desktop presentation; scope root layout rules to active Astrology presentation.
- Keep editable names separate from committed settings, retry failed reads, observe host updates and prevent overlapping operations.
- Distinguish cancelled media selection from successful changes and keep settings open when intro preview fails.
- Preserve background video playback across unrelated preference changes, release replaced media and handle image load failures.
- Ignore stale initial snapshots and callbacks after unload; restore existing document attributes and cancel pending intro claims.
- Add regression checks for settings, presentation lifecycle and built module-loader fallback, plus committed-artifact checks in CI and Release.
- Include README-linked host integration, licensing, contribution, security and setup documents in the package archive.

Full native integration still requires the upstream Desktop Astrology API described in `HOST-INTEGRATION.md`.
