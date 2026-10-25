# uiconfig

[uiconfig.js](packages/uiconfig.js) is a minimal UI renderer framework: it generates website and configuration UIs from JSON-like configurations, TypeScript decorators or schemas. This repository holds uiconfig.js and its renderers as npm workspaces.

| Package | Folder | npm | License |
|---|---|---|---|
| `uiconfig.js` | [packages/uiconfig.js](packages/uiconfig.js) | [![npm](https://img.shields.io/npm/v/uiconfig.js.svg)](https://www.npmjs.com/package/uiconfig.js) | MIT |
| `uiconfig-tweakpane` | [packages/uiconfig-tweakpane](packages/uiconfig-tweakpane) | [![npm](https://img.shields.io/npm/v/uiconfig-tweakpane.svg)](https://www.npmjs.com/package/uiconfig-tweakpane) | MIT |
| `uiconfig-blueprint` | [packages/uiconfig-blueprint](packages/uiconfig-blueprint) | [![npm](https://img.shields.io/npm/v/uiconfig-blueprint.svg)](https://www.npmjs.com/package/uiconfig-blueprint) | MIT |
| `uiconfig-react` | [packages/uiconfig-react](packages/uiconfig-react) | not published (private) | MIT |
| `uiconfig-shadcn` | [packages/uiconfig-shadcn](packages/uiconfig-shadcn) | not published (private) | MIT |

- **uiconfig.js**: the configuration types, `UiConfigMethods`, decorators and the renderer base classes.
- **uiconfig-tweakpane**: renderer and custom components on [Tweakpane](https://tweakpane.github.io/docs/) 3.
- **uiconfig-blueprint**: renderer and components on [Blueprint](https://blueprintjs.com/) 5 (React).
- **uiconfig-react**: base classes, a sample React renderer and un-styled components.
- **uiconfig-shadcn**: components on [shadcn/ui](https://ui.shadcn.com/) for uiconfig-react.

Each package has its own README and CHANGELOG.md. Website, API docs and examples: https://repalash.com/uiconfig.js/ (source in [website](website), a private workspace package).

## Development

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

## Publishing

[.github/workflows/publish.yml](.github/workflows/publish.yml) publishes on each push to `master`:

1. In the package folder, set the new `version` in `package.json`.
2. In its `CHANGELOG.md`, rename `## [Unreleased]` to the version (`## [1.2.3]` or `## v1.2.3`).
3. Push to `master`.

It calls the shared workflow [repalash/release-tools](https://github.com/repalash/release-tools) (`npm-release.yml@v1`). For each public package whose version is not on npm, it builds and packs the package (`prepack`: build, examples, docs; `clean-package`), posts a Discord notice, and waits for approval of the `npm-publish` environment. It then publishes the package with provenance through npm trusted publishing and pushes the tag `<package name>-<version>`. A version without a CHANGELOG entry stops the run. A prerelease version (`1.2.3-beta.1`) goes to the dist-tag `next`, unless `publishConfig.tag` in its `package.json` sets one. Packages with `"private": true` are skipped.

## History

uiconfig-tweakpane and uiconfig-blueprint were separate repositories (repalash/uiconfig-tweakpane, repalash/uiconfig-blueprint). Their full history is merged into this repository, and `git log --follow` works on their files. Their tags are renamed to `<package name>-<version>`; the `v*` tags belong to uiconfig.js.
