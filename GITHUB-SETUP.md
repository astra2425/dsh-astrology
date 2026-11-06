# GitHub repository setup and first upload

The local `astrology/` folder is already an independent Git repository on branch `main`. Create the remote repository yourself, review its contents, then connect and push it.

## Recommended repository settings

- Repository name: `dsh-astrology`
- Description: `Astrology theme and Desktop personalization plugin for DeepSeek Harness`
- Visibility: Public
- License: MIT
- Topics: `dsh-plugin`, `dsh-category-desktop`, `dsh-category-theme`, `deepseek-harness`, `cordis`
- Default branch: `main`
- Do not initialize the remote with a README, license or `.gitignore`; these files already exist locally.

The package metadata currently points to `astra2425/dsh-astrology`. If the remote owner or repository name differs, update the `repository`, `bugs`, and `homepage` fields in `package.json` and all matching README commands before the first push.

## Review before upload

1. Confirm you have rights to publish the plugin code and the project-generated artwork.
2. Review `ASSET-LICENSES.md`, `NOTICE.txt` and `DSH-PET-MIT.txt`; the default background video is intentionally absent.
3. Confirm the official Desktop host API has been accepted and released. Until then keep the compatibility status in both READMEs and do not announce the plugin as fully functional.
4. Inspect `git status`, `git diff --check` and `git ls-files` for secrets, local paths, personal media, generated caches and oversized files.
5. Confirm `lib/client.js` and `lib/index.mjs` are present and match the source build.

## First push

Create an empty public repository named `dsh-astrology` under the intended account. Then run from the `astrology` directory:

```sh
git status
git add -A
git commit -m "feat: prepare open-source Astrology plugin"
git remote add origin https://github.com/astra2425/dsh-astrology.git
git push -u origin main
```

After GitHub indexes the repository, verify it appears under the `dsh-plugin` topic. The plugin index searches that topic and may take time to refresh.

## Release

After the official Desktop API is available, update the supported DSH/Desktop version in both READMEs and package metadata, build and commit `lib/`, then create a GitHub Release with a tag such as `v0.1.0`. Attach the `npm pack` archive produced by the release workflow. The package is installed from GitHub and is not published to npm by this workflow.
