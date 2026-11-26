# uiconfig.js/dom

`uiconfig.js/dom` is the plain-DOM renderer of uiconfig.js: `UiConfigForm`. No UI library (no Tweakpane, no React): it draws the configs with a few elements and one
small stylesheet, as

- a **form**: a row for each field, with its name, for a popup or a card next to an object;
- a **bar**: a toolbar, one row of buttons, e.g. over a canvas;
- a **stack**: the same buttons in a column, e.g. the controls of an example card.

```js
import {UiConfigForm} from 'uiconfig.js/dom'

const form = new UiConfigForm([
    {type: 'slider', label: 'Roughness', property: [material, 'roughness'], bounds: [0, 1], stepSize: 0.01},
    {type: 'color', label: 'Color', property: [material, 'color']},
    {type: 'button', label: 'Random color', value: () => material.color.setHSL(Math.random(), 0.6, 0.5)},
], {undoManager})
card.appendChild(form.element)

const bar = new UiConfigForm([
    {type: 'button', label: 'Snapshot', icon: 'camera', value: async() => downloadSnapshot()},
    {type: 'checkbox', label: 'Auto rotate', icon: 'rotate-3d', property: [controls, 'autoRotate']},
], {layout: 'bar'})
document.body.appendChild(bar.element)
```

## Why

A Tweakpane or Blueprint panel is the right UI for an editor, but too large for a popup, a card or a toolbar, and it
loads its UI library. The form uses the same configs (a library describes its controls once, with uiconfig.js), and
weighs about 12 KB gzip with its stylesheet and icons, after the app's bundler minifies it (14.6 KB gzip as built, see
below). It started as `UiConfigForm` of threepipe's editor plugin (`@threepipe/plugin-tweakpane-editor`), and moved
here so that a page can use it without loading the editor and Tweakpane. It is part of uiconfig.js, not a package of its
own: it needs no UI library, and it changes with the core (its refresh listeners, `PerformAction`).

## Install

It comes with uiconfig.js (`npm install uiconfig.js`), as the entry point `uiconfig.js/dom`: an ES module
(`dist/dom.mjs`) with its declarations (`dist/dom/`). It shares the code of the core with `uiconfig.js` (both import
`dist/core.mjs`), so an app that uses both has one copy of it. It is not in the UMD and CommonJS bundles of uiconfig.js,
and an app that does not import it does not load it.

## What it draws

- **Fields:** `number` (drag the name left or right to scrub, Shift for 10x), `slider`, `checkbox` / `toggle`,
  `dropdown` (or `select`), `vec`, `vec2`, `vec3`, `vec4` (or `vector`; a three.js vector or a tuple of numbers),
  `color` (a three.js `Color`, a number or a CSS string), `monitor` (read only), `button`, and `folder` / `panel`
  (always open). An `input` (or a type that the form does not know) bound to a boolean or a number gets a checkbox or a
  number field, else a text field.
- **In a bar or a stack:** a button; a checkbox is a toggle button (`aria-pressed`); a dropdown is a select with its
  label; a monitor shows its value; any other field is a button with its value that opens the field in a popover. A
  folder is a group (`role="group"`), with a line between groups; a stack shows its name above it. The key of a button
  ([`shortcutOf`](#options)) is at the end of its row in a stack, and in its tooltip in a bar.
- **Values:** read and written through the bindings of the configs (`property`, `value`, `getValue` / `setValue`), as in
  the other renderers. A change calls `onChange` of the config and of each folder of the form that holds it, then
  `parentOnChange` of the top config: the same handlers, once each, as an edit in a Tweakpane panel. The events carry the
  new and the previous value (`value`, `lastValue`), also on undo and redo.
- **Buttons:** the function of a button (its `property`, its `value`, or `onClick`) can return an undo function or
  `{action, undo, redo}`; it runs through `methods.performAction` of uiconfig.js, and with an `undoManager` it is one
  undo step. A function that returns a promise disables the button and shows a spinner until the promise settles; an
  error goes to `onError`.
- **Undo:** with an `undoManager`, each edit is one undo step; quick edits of the same field (typing, the spinner, a
  scrub, a slider drag) merge into one step. Without one, the form records nothing and binds no keys.
- **Icons:** the `icon` of a config is SVG markup, an image URL, or a name: one of the Lucide icons in `lucideIcons`, or
  one that the app added with `addIcons`. In a bar on a narrow screen (640 px), a button with an icon shows the icon
  only. A label or an icon can be a function (Play / Pause): a refresh draws it again.
- **Disabled and read only:** `disabled` and `readOnly` (values or functions) disable a field, also its scrub. A refresh
  applies them again.
- **Hidden:** `hidden` (a value or a function) hides a field or a group; a refresh shows or hides it again, as in the
  other renderers, and closes the open popover of a field that hides. A config hidden when the form is made is drawn
  the first time it shows, so its value is not read before (a field hidden while there is no object to edit). Make the
  form again when the configs themselves change ([`onStructureChange`](#options)).
- **Errors:** an error in the refresh of a field (a `getValue` that throws) goes to `onError`, and the other fields
  still update.

## Refresh

A config can be drawn by the form and by another renderer at the same time (for example a Tweakpane panel on the same
object): `config.uiRefresh(deep, mode, delay)` refreshes it in both. The form adds its refresh to each config that it
draws with `addRefreshListener` (see [Refreshing the UI](README.md#refreshing-the-ui-after-a-change-from-code)), and `dispose()` removes it again; the listeners of the other
renderers, and a function that the app assigned to `config.uiRefresh`, stay. The form does not use `config.uiRef`,
which stays with the other renderer.

- `config.uiRefresh()` refreshes the fields of that config and of the configs in it (a folder). With the mode
  `'immediate'` it runs at once; with another mode (`'postFrame'` by default) in the next animation frame; after
  `delay` ms when one is given.
- `form.refresh(force?)` reads every field again, at once. A refresh is cheap: the DOM changes only when a value does,
  so an app can call it after each frame of its own loop (threepipe's example card does). A field that has the focus
  keeps what is typed in it, unless `force` is true.
- The form refreshes itself after its own edits, undo and redo.

The form has no frame loop of its own: it asks for one animation frame only when it needs one (a queued refresh, or
uiconfig.js waiting for a frame event of the renderer for the `dispatchMode` of a config).

## Options

`new UiConfigForm(configs, options)`:

| Option | |
|---|---|
| `layout` | `'form'` (default), `'bar'` or `'stack'`. Also `form.layout = ...` later: between `bar` and `stack` the elements stay; to or from `form` the form draws them again. |
| `undoManager` | A `JSUndoManager` (ts-browser-helpers, as in the other renderers): one undo step per edit. |
| `onChange(config)` | After every change, e.g. to redraw. |
| `onStructureChange()` | After a dropdown change (also its undo and redo) or a button click, which can change which fields there are. Make the form again then: a form made in this call takes the place of this one, so the undo and redo of older edits refresh the new one. |
| `onError(error, config)` | When the function of a button throws or rejects. Default: `console.error`. |
| `shortcutOf(config)` | The key of a config, like `⌘S`, shown at the end of its row (stack) or in its tooltip (bar). |
| `isInteger(config, label)` | Whether a number field takes whole numbers. Default: a whole `stepSize` of 1 or more, or the name of a count (`isIntegerName`: segments, count, sides...). |
| `tooltip` | The tooltip hook ([below](#tooltips)), or `false` for none. |

Members: `element` (the root element, put it in the page), `layout`, `refresh(force?)`, `closePopover()`, `dispose()`
(removes the element and the refresh listeners), and those of `UiConfigRendererBase` (`methods`, `undoManager`,
`addRefreshListener`, ...).

Statics: `UiConfigForm.InjectStyles` (true: the first form adds the stylesheet to the page; false: the app adds
`uiConfigFormStyles`, or its own styles for the `ucf-` classes), `UiConfigForm.Tooltips` (false: no tooltips in any
form), `UiConfigForm.Tooltip` (the tooltip hook of the forms; it inherits `UiConfigRendererBase.Tooltip`, the native
`title` by default).

Exports: `UiConfigForm`, `titleTooltip`, `isIntegerName`, `lucideIcons`, `lucideIcon(name)`, `addIcons(icons)`,
`iconMarkup(name)`, `uiConfigFormStyles`, and the types `UiConfigFormLayout`, `UiConfigFormOptions`,
`UiConfigFormTooltip`, `UiConfigFormTooltipInfo` (the `UiTooltipHook` and `UiTooltipInfo` of uiconfig.js).

## Tooltips

The buttons of a bar can have a tooltip: a button with an icon (a narrow screen hides its label) shows its label, and a
button with a key shows the label and the key. A stack shows both in the row, so it has none. The form has no tooltip
library: it calls the tooltip hook of uiconfig.js, which the other renderers use too ([Tooltips](README.md#tooltips)),

```ts
type UiTooltipHook = (element: HTMLElement, text: string, info: {label: string, shortcut?: string, needed: () => boolean}) => void | (() => void)
```

with the text (`Snapshot (⌘S)`), and calls the function that it returns to remove the tooltip (before it calls the hook
again with a new text, when the label or the key changes, and on `dispose`). The default, `titleTooltip`, sets the
native `title`. `needed()` says whether the tooltip adds something now (the label is hidden, or there is a key), for a
hook that can check when the tooltip would show. The accessible name of a button stays its `aria-label`, the label.

The hook of a form: its option `tooltip`, else `UiConfigForm.Tooltip` (the forms only), else
`UiConfigRendererBase.Tooltip` (every renderer). With tippy.js, for example (as threepipe's editor does):

```js
import tippy from 'tippy.js'

UiConfigForm.Tooltip = (el, text, {label, shortcut, needed}) => {
    const content = document.createElement('span')
    content.textContent = label
    if (shortcut) content.append(Object.assign(document.createElement('kbd'), {className: 'ucf-kbd', textContent: shortcut}))
    const t = tippy(el, {content, placement: 'top', onShow: () => needed() ? undefined : false})
    return () => t.destroy()
}
```

`tooltip: false` in the options of a form, or `UiConfigForm.Tooltips = false`, turns them off.

## Theming

The stylesheet uses CSS variables, which an app can set on the form or on any element around it:

| Variable | |
|---|---|
| `--ucf-fg`, `--ucf-dim` | Text, and names and values |
| `--ucf-input`, `--ucf-line`, `--ucf-accent` | Fields, borders, focus and pressed toggles |
| `--ucf-bg`, `--ucf-shadow`, `--ucf-hover` | Background, shadow and hover of a bar, a stack and a popover |
| `--ucf-font` | The font |
| `--ucf-popover-z` | The z-index of a popover (2000) |

Without them, the variables of a Tweakpane theme on the page apply (`--tp-container-foreground-color`,
`--tp-label-foreground-color`, `--tp-input-background-color`, `--tp-container-border-color`,
`--tp-base-background-color`, `--tp-base-shadow-color`, `--tp-button-background-color-hover`, `--tp-font-family`), so a
form looks like the Tweakpane panels next to it; else a light look, or a dark one for a bar, a stack and a popover when
the system prefers it (and the body has no `tpTheme-` class). The classes are `ucf`, `ucf-bar`, `ucf-stack`, `ucf-row`,
`ucf-button`, `ucf-chip`, `ucf-popover` and others (see `uiConfigFormStyles`).

## Icons

`lucideIcons` holds about 70 icons of [Lucide](https://lucide.dev) by name (`camera`, `download`, `play`, `pause`,
`eye`, `layers`, `chevron-down`, ...): the inner markup of each 24x24 icon. `lucideIcon(name)` gives the full SVG (in
the text colour). An app adds more:

```js
import {addIcons, lucideIcons} from 'uiconfig.js/dom'

addIcons({logo: '<svg viewBox="0 0 24 24">...</svg>'}) // any SVG, by name: icon: 'logo'
lucideIcons['bell'] = '<path d="..."/>'                // a Lucide icon, its inner markup from lucide-static
```

Icon markup is inserted as HTML: it must come from the app, never from a user. The Lucide icons are under the ISC
License (some derived from Feather, MIT); see [NOTICE](NOTICE).

## Design notes

- **One base class.** `UiConfigForm` extends `UiConfigRendererBase` of uiconfig.js, uses its `methods.performAction` for
  buttons and `UiConfigMethods.GetBaseProps` for the hidden and disabled state, and registers its refresh with the
  refresh listeners of uiconfig.js 0.5.
- **Its own value setter.** The form sets values with its own code, not `methods.setValue`, because that does not do
  what the form needs yet: it merges quick edits of the same field into one undo step (within a second or in one
  gesture; uiconfig.js merges only while `last` is false), it calls `onChange` of the folders of the form that hold a
  config without setting their `parentOnChange` (on a config that a Tweakpane panel also draws, that would replace the
  panel's), it calls `onStructureChange` after the undo and redo of a dropdown, and it refreshes at once after an undo or
  redo. Aligning `SetValue` of uiconfig.js (an undo/redo hook, the dispatch to the caller's folders, one merge rule) is a
  follow-up: [#20](https://github.com/repalash/uiconfig.js/issues/20).
- **Tooltips are a hook**, with the native `title` by default, so the form needs nothing beyond uiconfig.js and its
  dependency ts-browser-helpers. An app passes its tooltip library through the hook.
- **No threepipe imports.** The plan is that threepipe re-exports the form from its core bundle (and its editor passes its
  tippy.js tooltips through the hook).

## License

[MIT](LICENSE), as uiconfig.js. The Lucide icons: ISC (and MIT for those from Feather), see [NOTICE](NOTICE).
