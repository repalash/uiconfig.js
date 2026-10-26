# Changelog for uiconfig-blueprint

## [Unreleased]

## [0.1.0-dev.16] - 2026-10-26
- `homepage` in `package.json` is the website, https://repalash.com/uiconfig.js/, and the `keywords` describe the package.
- `[Dev]` The example pages of the package moved to the website (https://repalash.com/uiconfig.js/examples/), where each example runs in both renderers; the package has no example build anymore.
- `sideEffects` lists the CSS files, so bundlers keep imports of `uiconfig-blueprint/lib/css/*` (it was `false`).
- Fix: a refresh asked for while a component was refreshing was dropped, so the component could keep an old value (seen when text typed fast in another panel bound to the same object). The component now refreshes once more after the running refresh.
- The renderer adds its stylesheet (about 3 MB) to the document once, for the first renderer, instead of once for each renderer: a page with several Blueprint panels parses and matches one copy of the rules.
- Text inputs set the value once more on blur after an edit, with `last: true`, so the change event marks the end of the edit and the undo manager closes the step. They already set the value on each keystroke, with `last: false`.
- License: MIT from this release (releases up to 0.1.0-dev.15 stay under Apache 2.0).
- `[Dev]` Moved into the uiconfig monorepo: https://github.com/repalash/uiconfig.js, folder `packages/uiconfig-blueprint`. The npm package name stays `uiconfig-blueprint`.
- Fix: relative imports in the declaration files (`dist/*.d.ts`, `lib/esm/*.d.ts`) end in `.js`, so TypeScript with `moduleResolution: node16` or `nodenext` resolves every export.
- Depend on `uiconfig.js` `^0.4.0` (was `^0.3.1`).
- The ES module `dist/index.mjs` no longer bundles its dependencies: it imports `uiconfig.js`, `ts-browser-helpers`, `react`, `react-dom`, `@blueprintjs/core`, `@blueprintjs/icons`, `@blueprintjs/select`, `react-colorful` and `classnames`, so the bundler of the app dedupes them with the app's copy. The styles and the modules that the source imports by deep path from `@blueprintjs/core` and that its root does not export stay in the bundle. The icon chunks in `dist/` are gone: the bundler of the app takes them from `@blueprintjs/icons`.
- `@blueprintjs/core`, `react` and `react-dom` are required peer dependencies (they were optional). Depend on `classnames` `^2.5.1`, which the source imports.
- Depend on `ts-browser-helpers` `>=0.19.4` (was `^0.19.4`), the range that `uiconfig.js` uses.
- The UMD bundle `dist/index.js` (`main`, `require`, `browser`) stays self-contained for script tags and `require()`. It is deprecated and will be removed in the next major version.
- `[Dev]` Built with Vite 7 (was Vite 5), like the other packages: `dist/` targets the Vite 7 default browsers (`baseline-widely-available`: Chrome and Edge 107, Firefox 104, Safari 16).
- `lib/esm` no longer contains the tree components that 0.1.0-dev.14 removed from the source (0.1.0-dev.15 still shipped their old build output).

## [0.1.0-dev.15] - 2025-12-16
- Add uuid support to dropdown elements.

## [0.1.0-dev.14] - 2025-12-01
- Upgrade changes and improvements, remove the tree components.
- Pointer lock drag, with a fallback.
- Some UI changes and minor fixes.

## [0.1.0-dev.13] - 2025-08-24
- Version bump.

## [0.1.0-dev.12] - 2025-08-22
- UI improvements, precision fix.

## [0.1.0-dev.11] - 2025-08-06
- Better lib build, exports in package.json.

## [0.1.0-dev.9] - 2025-07-27
- Number units, dialog submit, tree fixes, menu popover delay, handle container `unwrapContents`.
- Numeric input fix, multi-selection in tree view.

## [0.1.0-dev.8] - 2025-07-05
- Update ts-browser-helpers.

## [0.1.0-dev.7] - 2025-07-05
- Support the `baseWidth` config property, custom tree with drag and drop, some UI improvements.

## [0.1.0-dev.6] - 2025-06-25
- Minimize feature, minor fixes.

## [0.1.0-dev.5] - 2025-01-12
- Expand in `BPTreeComponent.setSelected`, update some dependencies.

## [0.1.0-dev.4] - 2025-01-05
- Update uiconfig.js, add undo.
- Keyboard shortcuts for the tree component.

## [0.1.0-dev.3] - 2024-07-17
- Icon mappings, refactor dialog, UI changes.

## [0.1.0-dev.2] - 2024-01-01
- Refactor dependencies.

## [0.1.0-dev.1] - 2024-01-01
- Several updates, add the lib build.

## [0.0.3] - 2023-12-18
- Minor changes.

## [0.0.2] - 2023-12-18
- Support path syntax, example build config, GitHub Pages workflow.

## [0.0.1] - 2023-12-18
- First release: Blueprint 5 components, blueprint-styler themes and theme switcher, color, file and vector components.
