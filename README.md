![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

# Consumer Rights Wiki Safari Extension

Consumer Rights Wiki is a Safari extension for macOS, iOS, and iPadOS. It shows a popup when the site, product, or service you are viewing has an article on the [Consumer Rights Wiki](https://consumerrights.wiki).

## Download

Download the latest release from [GitHub Releases](https://github.com/6K6666/crw-extension/releases/latest).

- macOS: download the `.dmg` file.
- iPhone and iPad: download the `.ipa` file for AltStore Classic.

## Install On macOS

1. Download the `.dmg` from the latest release.
2. Open the `.dmg`.
3. Drag `Consumer Rights Wiki.app` into `Applications`.
4. Eject the mounted DMG.
5. Open `Consumer Rights Wiki` from `Applications`.
6. Click `Open Safari Settings`, or open Safari and go to Settings > Extensions.
7. Enable `Consumer Rights Wiki`.
8. Grant website access. `All Websites` is recommended so the extension can match pages as you browse.

Do not run the app from the mounted DMG. Safari tracks extensions by the installed app copy, so install the app into `Applications`, eject the DMG, and run it from there.

## Install On iPhone Or iPad With AltStore

1. Install [AltStore Classic](https://altstore.io/) and set up AltServer.
2. Download the `.ipa` from the latest release on your iPhone or iPad.
3. Open the `.ipa` in AltStore.
4. If AltStore asks whether to keep app extensions, keep them. The Safari extension will not work if the embedded extension is removed.
5. Open the installed `Consumer Rights Wiki` app once.
6. Open Settings > Safari > Extensions.
7. Enable `Consumer Rights Wiki`.
8. Grant website access.

AltStore installs made with a free Apple ID must be refreshed periodically through AltStore/AltServer. This app uses two AltStore App IDs: one for the containing app and one for the Safari extension.

## Updates

For now, install updates by downloading the newest release asset and replacing the old app.

- macOS: download the newest `.dmg`, drag the new app into `Applications`, and replace the existing copy.
- iPhone and iPad: install the newest `.ipa` through AltStore.

## Build From Source

Developers and maintainers should use [docs/BUILD_FROM_SOURCE.md](docs/BUILD_FROM_SOURCE.md).

Safari packaging, release validation, notarization, and AltStore packaging details are in [docs/SAFARI.md](docs/SAFARI.md).

## Contributing

Technical contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening issues or pull requests.

The extension matches sites and services against data sourced from the [Consumer Rights Wiki](https://consumerrights.wiki). You can help improve matching data by contributing to the wiki directly or to the [Cargo completion project](https://consumerrights.wiki/w/Projects:Cargo-complete).

## Attribution

This repository is a Safari-focused fork of [FULU-Foundation/CRW-Extension](https://github.com/FULU-Foundation/CRW-Extension). The original codebase, concept, extension behavior, and project credit belong to the original upstream developer and maintainers. See [NOTICE.md](NOTICE.md).

## License And Disclaimer

The source code for the CRW Extension is licensed under the MIT License.

All references found by this software are provided to the end user under CC BY-SA 4.0 licensing by the originating site [consumerrights.wiki](https://consumerrights.wiki). The extension checks page URL, title, and metadata locally against its match dataset; website access is not used for tracking or advertising.
