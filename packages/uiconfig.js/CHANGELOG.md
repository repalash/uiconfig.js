# Changelog for uiconfig.js

uiconfig.js is a UI renderer framework to generate UIs from a JSON/ts decorators/zod schema etc

## [Unreleased]

## v0.5.0
- A config can be drawn by more than one renderer at a time: `config.uiRefresh(deep, mode, delay)` refreshes it in each of them. Before, each renderer assigned `config.uiRefresh`, so a form and a Tweakpane panel on the same config replaced each other's refresh. Callers keep calling `config.uiRefresh?.(deep, mode, delay)`.
  - `UiConfigMethods.AddRefreshListener(config, listener)` adds a function that `config.uiRefresh` calls and returns a function that removes it; `UiConfigMethods.RemoveRefreshListener(config, listener)`. The type of the listener (and of `uiRefresh`) is the new exported type `UiRefreshListener`.
  - `UiConfigRendererBase.addRefreshListener(config)` (once per config; returns a remove function) and `removeRefreshListener(config)`: the listener of a renderer, made by the new protected `_createRefreshListener(config)`, which queues a refresh of the config in the renderer (`addToRefreshQueue`, `postFrame` when no mode is given).
  - `disposeUiConfig` removes only the listener of the renderer that disposes; before, it set `config.uiRefresh` to `undefined`. A renderer that assigned `config.uiRefresh` should call `addRefreshListener` instead.
  - Assigning a function still works (`config.uiRefresh = fn`, for example to forward the refreshes of a config to another): it is called with the listeners, and assigning `undefined` removes only that function, and it is called on the config (`this`), as before. While the config has no listeners, `config.uiRefresh` reads back the assigned function.
  - Once a renderer listens, `uiRefresh` is an accessor that is not enumerable, and the listeners are in a non-enumerable property: JSON, a spread (`{...config}`), `Object.assign` and `structuredClone` leave them out (before, a spread copied the `uiRefresh` function of the original config). Two copies of uiconfig.js on a page (the UMD bundle of a renderer includes one) share the listeners of a config.
- `PerformAction` (and `methods.performAction`) takes an optional `onPending` callback, called once, synchronously, when the action returns a promise (before it settles): for example to show that a button runs. It is not called for a synchronous action or a redo.
- Fixed: `PerformAction`, a redo of an action that returned an undo function: the redo runs the action again, and the undo function that this run returns is used for the next undo. Before, the next undo called the undo function of the first run (undo, redo, undo left the object of the redo).
- Fixed: `PerformAction`, an action that returns `{undo, redo, action}`: `undo`, `redo` and `action` are read from the object when the step is undone or redone, and called on it, not bound when the step is recorded. An undo that replaces the redo (an undo that sets the redo to bring back the same object, as threepipe's `EntityComponentPlugin.addComponent` does) works. An object with only `undo` runs the action again on redo; before, the redo failed.
- These fixes apply to the buttons of uiconfig-tweakpane and uiconfig-blueprint (`clickButton` uses `performAction`).
- `[Dev]` Unit tests (`npm test` runs them with vitest, after the type check and lint), and the lint errors in `src` fixed.


## v0.4.2
- `UiObjectConfig.icon` (a string or a function): SVG markup, an image URL, or an icon name of the renderer. uiconfig-tweakpane and uiconfig-blueprint draw it on the folder header actions and their menus.

## v0.4.1
- Fix: a binding with the key `0` (`property: [array, 0]`) works; `GetBinding` rejected every falsy key.
- Add `liveUpdate` to `UiObjectConfig`, for text inputs: set the value on each keystroke (change event with `last: false`) and once more when the input is committed (`last: true`), so the undo manager records one step for the edit.
- `[Dev]` The repository is now a monorepo of the uiconfig packages: uiconfig.js is in `packages/uiconfig.js`, next to uiconfig-tweakpane, uiconfig-blueprint, uiconfig-react and uiconfig-shadcn.
- Fix: relative imports in the declaration files (`dist/*.d.ts`) end in `.js`, so TypeScript with `moduleResolution: node16` or `nodenext` resolves every export.
- Fix: `require('uiconfig.js')` returns the exports. `main` and the `require` export point to the new CommonJS bundle `dist/index.cjs`. Before, they pointed to the UMD bundle `dist/index.js`, which Node and bundlers load as an ES module in this `"type": "module"` package, so `require()` returned an empty object (or failed with `ERR_REQUIRE_ESM` on Node before 22.12).
- The UMD bundle `dist/index.js` (`browser`) includes `ts-browser-helpers` and works alone in a script tag. Before, it read `ts-browser-helpers` from a global of that name, which no build of that package sets. The ES module `dist/index.mjs` still imports `ts-browser-helpers`.
- The UMD bundle and the CommonJS bundle are deprecated and will be removed in the next major version.
- `[Dev]` The examples are pages of the website (https://repalash.com/uiconfig.js/examples/, sources in `website/src/examples`), each in Tweakpane and Blueprint; the package has no example pages or example build anymore. The API docs of the three packages are one site: https://repalash.com/uiconfig.js/docs/.
- `homepage` in `package.json` is the website, https://repalash.com/uiconfig.js/, and the `keywords` describe the package.

## v0.4.0
- **Breaking Changes**
  - Set default dispatch mode to `immediate` in `UiConfigMethods`, previously it was `postFrame`
  - Make functions in `UiConfigMethods` static, functions deprecated - `getBounds`, `initUiConfig`, `getChildren`, `getLabel`, `getBinding`, `dispatchOnChangeSync`
- Add optional `propertyKey`, `rows`, `placeholder` to `UiObjectConfig` type.
- Minor fix in `UiObjectConfig.children` type 
- Use `WeakMap` in `UiConfigTypeMap`. 
- Fix for `null` value in `generateValueConfig`.
- Save `propertyKey` in config when generating within `generateValueConfig`, `generateUiFolder`.
- Fix label auto-refresh in `uiContainer` decorator.
- Add static helpers in `UiConfigMethods`
- Set `ts-browser-helpers` dependency to `>=0.19.4`

## v0.3.1
- Nested object children fix

## v0.3.0
- Add `UiConfigMethods.performAction`
- Fix decorator `label` type

## v0.2.1
- Fix for empty ui config in auto generated UI.

## v0.2.0
- Move `primitive_value`, undo commands to `ts-browser-helpers` package
- `[Dev]` Migrate to vite, proper exports in package.json

## v0.1.6
- Add optional `baseWidth` property to `UiObjectConfig` type.

## v0.1.5
- Add optional `order` property to `UiObjectConfig` type.

## v0.1.4
- Add property `undoEditingWaitTime` to `UiConfigMethods`

## v0.1.3
Minor update
- Add options to disable primitive logic (for textures, objects etc)
- Add `OnClickReturnType`, Support promise return in onClick
- Fix `getRawValue` type to allow `any`
- Allow promise return in undo action function.

## v0.1.2
Minor update
- Fix dynamic `generateUiFolder`
- Fix types of `PrimitiveValObject`

## v0.1.1
Minor update
- Fix initial setting of `undoManager`

## v0.1.0
Major updates

### Migration Guide
- `UiConfigRendererBase` split into 2 classes.
  - Use class `UiConfigRenderer` in place of `UiConfigRendererBase<T>`
  - Removed `protected _root: T`. It can be defined in the subclass if used.
  - Use `unmount` in place of `dispose`.
  - Add `undoManager`
  - Add functions `start` and `stop` to `UiConfigRendererBase`. Use when not using `UiConfigRenderer`
- Add `parentProperty` similar to `parentOnChange`
- `UiConfigMethods`
  - Added supports for object and array primitives. These will be cloned and copied to, when required  
  - `getValue` returns a cloned value. To get the raw value, use `getRawValue`
  - Add parameters to `getValue` - `val` and `copyOnEqual`. Pass the current state into `val` for comparison and copy.
  - Add functions `recordUndo`, `getRawValue`
  - `setValue` checks equality for objects using primitives and copies if possible, there is no need to do it separately in the renderer now.
  - Add parameter to `setValue` - `trackUndo` for tracking undo/redo for value change, when `last` is `false` the last value is replaced till `undoEditingWaitTime`(ms) or the next time `last` is `true`
  - Now `UiObjectConfig` is passed when functions are called for `label`, `children`, `sendArgs`, `dispatchMode`, `bounds`, `stepSize`, `property`, `path`, `parentProperty`
  - `getBinding` uses the `parentProperty` when `config.property` is not found. `config.path` can be used to pick from parent property.
- Add `dynamic` parameter to `generateUiFolder`
- Add support for `PrimitiveVal` and `PrimitiveValObject`(objects with `clone`, `equals` and `copy` functions)
