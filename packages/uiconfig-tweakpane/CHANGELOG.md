# Changelog for uiconfig-tweakpane

## [Unreleased]
- The renderer adds its container stylesheet to the document once, for the first renderer, instead of once for each renderer.
- Add an opt-in theme with the color modes `light`, `dark`, `blue`, `white` and `black`, from threepipe's Tweakpane plugin: the stylesheet `uiconfig-tweakpane/theme.css` (`dist/theme.css`), `UiConfigRendererTweakpane.setTheme(mode)` and `applyTweakpaneTheme(element, mode)`. The theme applies only inside an element with its classes, so pages that do not use it do not change.
- Text inputs with `liveUpdate: true` in their config set the value on each keystroke, with `last: false`, and on Enter or blur with `last: true`; the undo manager records one step for the edit. Without the option, the value is set on Enter or blur, as before.
- `[Dev]` Moved into the uiconfig monorepo: https://github.com/repalash/uiconfig.js, folder `packages/uiconfig-tweakpane`. The npm package name stays `uiconfig-tweakpane`.
- Fix: relative imports in the declaration files (`dist/*.d.ts`, `lib/esm/*.d.ts`) end in `.js`, so TypeScript with `moduleResolution: node16` or `nodenext` resolves every export.
- The ES module `dist/index.mjs` no longer bundles its dependencies: it imports `uiconfig.js`, `ts-browser-helpers`, `tweakpane` and `@pangenerator/tweakpane-textarea-plugin`, so the bundler of the app dedupes them with the app's copy.
- `tweakpane` and `@pangenerator/tweakpane-textarea-plugin` are required peer dependencies (they were optional).
- Depend on `uiconfig.js` `^0.4.0` (was `>=0.2.1`) and `ts-browser-helpers` `>=0.19.4` (was `>=0.19.3`).
- The UMD bundle `dist/index.js` (`main`, `require`, `browser`) stays self-contained for script tags and `require()`, and includes `uiconfig.js` 0.4.0 (1.0.1 bundled 0.2.1). It is deprecated and will be removed in the next major version.

## [1.0.1] - 2025-10-27
- Remove `console.log` calls.

## [1.0.0] - 2025-10-27
- Changes to how folders are handled, some examples and tests.

## [0.1.1] - 2025-08-29
- Add textarea component.

## [0.1.0] - 2025-08-13
- Add divider and basic tabs.

## [0.0.12] - 2025-08-07
- Add the `lib/esm` build.

## [0.0.11] - 2025-07-15
- Support `domChildren` in `inputGenerator`.

## [0.0.10] - 2024-12-29
- Use vite instead of rollup, update to TypeScript 5 and uiconfig.js v0.1.0, add support for undo, add basic examples.

## [0.0.8] - 2023-12-18
- Support trickling down property and value from parent to children.
- Option to add extra options to the ui config when appending, fix the color setter for number and string values.

## 0.0.2 to 0.0.7 - 2023-03-11 to 2023-12-10
- First releases: Tweakpane renderer for uiconfig.js, vector and color inputs, fixes in folder UI and Tweakpane dispose.
