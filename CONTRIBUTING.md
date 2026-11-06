# Contributing

Thanks for helping improve DSH Astrology.

## Before opening a pull request

1. Check [HOST-INTEGRATION.md](HOST-INTEGRATION.md) for the supported Desktop API version.
2. Keep Desktop-only operations behind the versioned preload API. Do not add Electron imports, direct IPC, local paths or arbitrary resource URLs to the client bundle.
3. Keep model catalog and effort selection behavior owned by the official model-selection package; Astrology changes only presentation.
4. Update the English and Chinese README together when installation, compatibility, feature behavior or user data changes.
5. Update [ASSET-LICENSES.md](ASSET-LICENSES.md) and preserve notices when adding or changing resources.
6. Build the client bundle and ensure the committed `lib/` matches source before submitting.
7. Run `pnpm build`, `pnpm test` and `pnpm pack --dry-run`. Tests use Node's built-in runner and type stripping; no Desktop process is launched. The bundle smoke check reads `lib/client.js`, so build before testing source changes. CI and Release reject differences between rebuilt and committed `lib/`.

Settings regression checks cover pending reads/writes, event ordering, name drafts, retries and disposal. Presentation checks use a minimal DOM substitute for media identity, visibility and cleanup; they do not check browser layout, codecs or Electron behavior. Verify those against the supported upstream host before declaring full Desktop compatibility.

Use focused commits with messages such as `feat: add ...`, `fix: ...`, or `docs: ...`. Do not include secrets, personal media, or unlicensed assets.
