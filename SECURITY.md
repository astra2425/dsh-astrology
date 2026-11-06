# Security policy

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting for this repository. Do not post exploit details, personal files or sensitive logs in a public issue. If private reporting is unavailable, contact the repository owner through the email listed on the GitHub profile.

## Scope

Security reports may cover the plugin package, its build and release workflow, the Desktop preload contract and handling of imported media. The official Desktop host and DSH plugin manager are maintained upstream; report their vulnerabilities to the DeepSeek Harness maintainers as well.

The plugin does not grant the Web client filesystem access. Desktop file selection, validation, persistence, window creation and media routes must remain inside the official host. Please include the affected plugin version, DSH Desktop version, reproduction steps and relevant sanitized logs.
