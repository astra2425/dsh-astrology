# Asset licenses and provenance

| Asset or group | Current location | Evidence found | Redistribution decision |
|---|---|---|---|
| Astrology palette and CSS | `../packages/astrology-theme/src/palette.ts`; `../deepseek-harness/apps/desktop/resources/astrology/theme.css` | Project source; source checkout uses the MIT license. | Include with project attribution and MIT license. |
| Intro and companion HTML, CSS, and JavaScript | `../deepseek-harness/apps/desktop/resources/astrology/{intro,pet,hint}.*`, `intro-shell.js`, `intro.js`, `pet.js`, `pet-atlas.js`, `logo.js` | Project-authored implementation. `logo.js` reuses the DSH FishLogo outline as documented in `NOTICE.txt`. Pet behavior adaptation identifies its upstream source and retains the MIT notice. | Included in `resources/desktop/`; preserve project and third-party notices. The intro stylesheet is the scoped intro-window subset of `desktop.css`; the full workspace stylesheet is not copied here. |
| Ziqi companion idle/singing artwork | `../design/assets/ziqi-idle-2d.png`, `ziqi-sing-2d.png` | `../deepseek-harness/apps/desktop/resources/astrology/NOTICE.txt` states these are independently generated 2D resources based on the project character. | Included as project-owned resources under this repository's MIT license at the project owner's request; preserve `NOTICE.txt`. |
| Companion action atlases | `../design/assets/frames/frames-*.png`, `pet-atlas.json` | `NOTICE.txt` states these are independently generated 2D atlases and do not use upstream animation pixels. | Included as project-owned resources under this repository's MIT license at the project owner's request; preserve `NOTICE.txt`. Local generation metadata containing workstation paths is excluded. |
| Pet behavior adaptation | `../deepseek-harness/apps/desktop/src/astrology-pet-*.ts`, `resources/astrology/pet*.js` | `NOTICE.txt` identifies `PC2005-cloud/dsh-pet`, commit `d1de1ae1f8734f70ded49c36d84a350e11ff447`, and says the adaptation is reworked; `DSH-PET-MIT.txt` contains MIT terms. | If copied or derived portions are included, preserve `NOTICE.txt` and the full upstream MIT notice. Review source comparison before release. |
| Fish Logo outline in intro animation | `../deepseek-harness/apps/desktop/resources/astrology/logo.js` | `NOTICE.txt` says the vector outline is reused from DeepSeek Harness under MIT. | Preserve DeepSeek Harness attribution and license notice when included. |
| `自由的你.mp4` default background | `../media_resource/自由的你.mp4`, copied by the current prototype sync script | No redistribution license or rights statement found in the local files inspected. | Exclude from the public plugin repository unless the owner provides an explicit redistribution grant. |
| `001.mp4` | `../media_resource/001.mp4` | No use by the current Astrology package and no redistribution license found. | Exclude. |
| Other videos, fonts or sourced images | Current media/resource directories | No redistribution grant recorded. | Exclude unless separately cleared and listed here. |

## Release rule

Do not publish excluded media. A repository-wide MIT license does not grant rights to the background video or any other media without a documented license.
