# Contributing

uiconfig.js and its renderers live in this repository as npm workspaces, one folder per package under `packages/`.

## Setup

Requires Node.js 20.19+ or 22.12+ (vite 7).

```bash
git clone https://github.com/repalash/uiconfig.js.git
cd uiconfig.js
npm install      # installs every package; links the packages to each other
npm run build    # builds uiconfig.js first, then the packages that depend on it
npm test         # runs the test script of each package that has one
```

`npm install` does not build anything. The other packages use the built `dist/` of uiconfig.js, so build it first (`npm run build -w uiconfig.js`), and again after a change in it.

Work on one package with `-w <package name>` from the root:

```bash
npm run dev -w uiconfig-tweakpane
npm run build -w uiconfig-blueprint
```

Internal dependencies (for example `uiconfig-tweakpane` on `uiconfig.js`) use version ranges that match the local version, so npm links the workspace copy instead of the published one.

`scripts/fix-dts-imports.mjs` is shared by every package that emits declarations: it adds `.js` to the relative imports in the `.d.ts` files, which TypeScript needs with `moduleResolution: node16` or `nodenext`.

## Website

The website, the example pages and the API docs of the three packages are published together on GitHub Pages (https://repalash.com/uiconfig.js/) by `.github/workflows/docs-pages.yml`. `npm run pages` builds the whole site into `website/_site`; [website/README.md](website/README.md) explains the parts.

## Publishing

[.github/workflows/publish.yml](.github/workflows/publish.yml) publishes on each push to `master`:

1. In the package folder, set the new `version` in `package.json`.
2. In its `CHANGELOG.md`, rename `## [Unreleased]` to the version (`## [1.2.3]` or `## v1.2.3`).
3. Push to `master`.

It calls the shared workflow [repalash/release-tools](https://github.com/repalash/release-tools) (`npm-release.yml@v1`). For each public package whose version is not on npm, it builds and packs the package (`prepack`, then `clean-package`), posts a Discord notice, and waits for approval of the `npm-publish` environment. It then publishes the package with provenance through npm trusted publishing and pushes the tag `<package name>-<version>`. A version without a CHANGELOG entry stops the run. A prerelease version (`1.2.3-beta.1`) goes to the dist-tag `next`, unless `publishConfig.tag` in its `package.json` sets one. Packages with `"private": true` are skipped.

## History

uiconfig-tweakpane and uiconfig-blueprint were separate repositories (repalash/uiconfig-tweakpane, repalash/uiconfig-blueprint). Their full history is merged into this repository, and `git log --follow` works on their files. Their tags are renamed to `<package name>-<version>`; the `v*` tags belong to uiconfig.js.
