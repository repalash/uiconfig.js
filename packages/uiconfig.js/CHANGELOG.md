# Changelog for uiconfig.js

uiconfig.js is a UI renderer framework to generate UIs from a JSON/ts decorators/zod schema etc

## [Unreleased]

## v0.4.1
- Fix: a binding with the key `0` (`property: [array, 0]`) works; `GetBinding` rejected every falsy key.
- Add `liveUpdate` to `UiObjectConfig`, for text inputs: set the value on each keystroke (change event with `last: false`) and once more when the input is committed (`last: true`), so the undo manager records one step for the edit.
- `[Dev]` The repository is now a monorepo of the uiconfig packages: uiconfig.js is in `packages/uiconfig.js`, next to uiconfig-tweakpane, uiconfig-blueprint, uiconfig-react and uiconfig-shadcn.
- Fix: relative imports in the declaration files (`dist/*.d.ts`) end in `.js`, so TypeScript with `moduleResolution: node16` or `nodenext` resolves every export.
- The UMD bundle `dist/index.js` (`main`, `require`, `browser`) includes `ts-browser-helpers` and works alone in a script tag. Before, it read `ts-browser-helpers` from a global of that name, which no build of that package sets. The ES module `dist/index.mjs` still imports `ts-browser-helpers`.
- The UMD bundle is deprecated and will be removed in the next major version.
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
