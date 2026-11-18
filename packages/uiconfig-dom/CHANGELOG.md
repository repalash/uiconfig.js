# Changelog for uiconfig-dom

## [Unreleased]

## [0.1.0] - 2026-11-18
- First release: `UiConfigForm`, a plain-DOM renderer for uiconfig.js configs, from `UiConfigForm` of threepipe's `@threepipe/plugin-tweakpane-editor`, with the same options (`layout` `form` / `bar` / `stack`, `undoManager`, `onChange`, `onStructureChange`, `onError`, `shortcutOf`, `isInteger`), members (`element`, `layout`, `refresh()`, `closePopover()`, `dispose()`) and statics (`InjectStyles`, `Tooltips`).
- It extends `UiConfigRendererBase` of uiconfig.js: buttons run through `methods.performAction`, and the hidden and disabled state comes from `UiConfigMethods.GetBaseProps`. It keeps its own value setter (its undo merge rule, the `onChange` of the folders of the form, `onStructureChange` after undo and redo); see the README.
- `config.uiRefresh(deep, mode, delay)` refreshes the form: it adds a refresh listener (uiconfig.js 0.5) to each config that it draws, next to the other renderers, and `dispose()` removes it. `immediate` refreshes at once, the other modes in the next animation frame. `refresh()` works as before.
- Tooltips are a hook: the option `tooltip` and the static `UiConfigForm.Tooltip`, `(element, text, info) => remove`; the default (`titleTooltip`) sets the native `title`. No tippy.js dependency. `tooltip: false` or `UiConfigForm.Tooltips = false` turns them off.
- The Lucide icons by name, `lucideIcons` and `lucideIcon(name)` (lucide-static 1.72.0, ISC, see NOTICE), and `addIcons({name: svg})` for icons of the app.
- The `select` and `vector` type aliases (a dropdown and a vector).
- The colours are the CSS variables `--ucf-fg`, `--ucf-dim`, `--ucf-input`, `--ucf-line`, `--ucf-accent`, `--ucf-bg`, `--ucf-shadow`, `--ucf-hover`, `--ucf-font` and `--ucf-popover-z`, which an app can set on any element around the form; the Tweakpane theme variables (`--tp-*`) are their fallbacks. The stylesheet is exported as `uiConfigFormStyles`.
- The ES module imports `uiconfig.js` and `ts-browser-helpers`, which it does not bundle.
