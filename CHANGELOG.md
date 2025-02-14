# Changelog for uiconfig.js

uiconfig.js is a UI renderer framework to generate UIs from a JSON/ts decorators/zod schema etc

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
