# Upstream Desktop integration

The external Astrology plugin requires an official Desktop host capability. The current official application does not provide a public API for external plugins to create the Astrology intro or companion windows, own their lifecycle, select media through native dialogs, or receive safe media URLs.

Submit the design in [`../HOST-INTEGRATION.md`](../HOST-INTEGRATION.md) to the DeepSeek Harness maintainers. Do not copy the current monorepo's private Electron files into the plugin package and do not publish the plugin as fully supported until the corresponding API has been reviewed and released.

The source checkout used to prepare this proposal has local uncommitted changes. This proposal is not a generated patch and must not be applied as one. After upstream accepts the API design, prepare a reviewable patch or pull request from the upstream repository's current base and carry the official tests and documentation required by its contribution policy.
