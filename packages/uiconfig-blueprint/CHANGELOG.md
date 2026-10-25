# Changelog for uiconfig-blueprint

## [Unreleased]
- License: MIT from this release (releases up to 0.1.0-dev.15 stay under Apache 2.0).
- `[Dev]` Moved into the uiconfig monorepo: https://github.com/repalash/uiconfig.js, folder `packages/uiconfig-blueprint`. The npm package name stays `uiconfig-blueprint`.
- Fix: relative imports in the declaration files (`dist/*.d.ts`, `lib/esm/*.d.ts`) end in `.js`, so TypeScript with `moduleResolution: node16` or `nodenext` resolves every export.
- Depend on `uiconfig.js` `^0.4.0` (was `^0.3.1`).
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
