# Contributing to the CRW Safari Extension Fork

This repository is a Safari-focused fork of [FULU-Foundation/CRW-Extension](https://github.com/FULU-Foundation/CRW-Extension). The original CRW Extension codebase and project credit belong to the original upstream developer and maintainers. Contributions in this fork should be understood as downstream Safari packaging, testing, documentation, and maintenance work.

## Table of Contents

- [Asking Questions](#asking-questions)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Contributing Code](#contributing-code)

---

## Asking Questions

Before opening an issue to ask a question:

- Search existing issues in this fork first.
- Check [docs/SAFARI.md](docs/SAFARI.md) for Safari setup, testing, and known behavior notes.

---

## Reporting Bugs

> [!IMPORTANT]
> **Do not report security vulnerabilities publicly.** Use GitHub private vulnerability reporting if it is enabled for this repository, or contact the maintainers through a private channel.

Before opening a bug report, you **must**:

- [ ] Confirm you are testing the latest Safari build from this fork.
- [ ] Reproduce the issue on Safari for macOS, iOS, or iPadOS.
- [ ] Search existing issues in this fork to check your bug has not already been reported.
- [ ] Check that the extension is enabled in Safari and has the required website access.

Your bug report must include:

- Extension version
- Safari version and platform (macOS, iOS, or iPadOS)
- macOS, iOS, or iPadOS version
- Xcode version, simulator/device model, and whether the build was run from Xcode, TestFlight, or App Store
- Clear steps to reproduce the issue
- What you expected to happen vs. what actually happened
- Any relevant console errors or screenshots

**Skipping these steps creates duplicate issues, forces maintainers to chase missing information, and takes time away from productive work. Issues that do not follow these guidelines will be closed without review.**

Bugs with no reproduction steps will be labelled `needs-repro` and ignored until they are provided.

---

## Suggesting Features

Before opening a feature request:

- [ ] Confirm the request applies to Safari on macOS, iOS, or iPadOS.
- [ ] Search existing issues in this fork to check it has not already been suggested. If it has, comment on that issue instead.

Your feature request must include:

- A clear description of the problem it solves
- What the current behaviour is and what you'd like instead
- Why this would benefit most users, **not just your specific use case**
- Screenshots or recordings if relevant

**Skipping these steps creates duplicate issues, forces maintainers to chase missing information, and takes time away from productive work. Issues that do not follow these guidelines will be closed without review.**

---

## Contributing Code

Before submitting code changes, run the relevant local checks:

```shell
npm test
npm run lint
npm run build
```

For Safari resource or Xcode project changes, also run:

```shell
npm run sync-safari-resources
diff -qr "dist/safari" "safari/Consumer Rights Wiki/Shared (Extension)/Resources"
```
