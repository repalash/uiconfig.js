# UiConfig Tweakpane

[![NPM Package](https://img.shields.io/npm/v/uiconfig-tweakpane.svg)](https://www.npmjs.com/package/uiconfig-tweakpane)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Tweakpane theme/wrapper library for [uiconfig.js](https://github.com/repalash/uiconfig.js): A UI renderer framework to dynamically generate website/configuration UIs from a JSON-like configurations and/or typescript decorators. 

It includes several components for editor-like user interfaces like folders, sliders, pickers, inputs for string, number, file, vector, colors, etc.

The UI components are bound to javascript/typescript objects and properties through a JSON configuration.

### Examples

Examples: https://repalash.com/uiconfig.js/examples/ (each example runs in Tweakpane; some are only for Tweakpane: themes, text areas and tabs, custom components)

API docs: https://repalash.com/uiconfig.js/docs/modules/uiconfig-tweakpane.html

Threepipe Basic UI: https://threepipe.org/examples/#tweakpane-ui-plugin/

Threepipe Editor: https://threepipe.org/examples/#tweakpane-editor/

## Installation and Usage

### npm package

Install the `uiconfig-tweakpane` package from npm.
```bash
npm install uiconfig-tweakpane
```

Use in any javascript/typescript file.
```typescript
import { UI } from 'uiconfig-tweakpane';

const config = {
    type: "slider",
    label: "slider",
    value: 0.5,
    bounds: [0, 1],
    onChange: () => {
        console.log("changed", config.value);
    },
}

const ui = new UI();
ui.appendChild(config);
```

### CDN link

The module can be imported to HTML/JS a CDN link using [unpkg](https://unpkg.com/) or [jsdelivr](https://www.jsdelivr.com/).

```html
<script src="https://unpkg.com/uiconfig-tweakpane"></script>
<!--or-->
<script src="https://cdn.jsdelivr.net/npm/uiconfig-tweakpane"></script>
```

The module is available as the global `window['uiconfig-tweakpane']`
```html
<script>
    const config = {
        type: "button",
        label: "click me",
        onClick: () => {
            console.log("clicked");
        },
    }
    
    const tpui = window['uiconfig-tweakpane']
    const ui = new tpui.UI()
    ui.appendChild(config)
</script>
```

### Builds

- `dist/index.mjs` (`import`, `module`): ES module. It imports its dependencies `uiconfig.js`, `ts-browser-helpers`, `tweakpane` and `@pangenerator/tweakpane-textarea-plugin` instead of bundling them, so the bundler of the app keeps one copy of each. `tweakpane` and the textarea plugin are peer dependencies: npm 7 and later install them, other package managers can need them in the app's `package.json`.
- `lib/esm`: the TypeScript output, one file per source module.
- `dist/index.js` (`browser`, the CDN link): UMD bundle with all dependencies included, for a `<script>` tag.
- `dist/index.cjs` (`main`, `require`): the same bundle as CommonJS, for `require()`.

The UMD and CommonJS builds are legacy and will be removed in the next major version.

## Configuration

Check the documentation at [uiconfig.js](https://github.com/repalash/uiconfig.js) on how to create a configuration for the UI.

## Components

1. `folder/panel` - A folder that can be collapsed and expanded. It can have other components as children.
2. `input` - A text input field for any kind of primitive types. The type is determined automatically from initial value.
3. `number` - A number input field for numbers.
4. `slider` - A slider for numbers. 
5. `dropdown` - A dropdown. Options can be specified in children with label and optional value properties.
6. `checkbox/toggle` - A checkbox for boolean values.
7. `button` - A button that can trigger a function, `onClick` or bound property/value function.
8. `color` - A color picker for colors.
9. `vector/vec2/vec3/vec4` - Multiple number input fields in a row for vectors.

## Folder menus

A `button` with the tag `context-menu` is an action on the folder's object, like duplicate or delete. A folder shows
such buttons (its direct children) in its header instead of in its body: as small buttons after the title while they
fit, and the rest in a menu that a ⋮ button opens. On a narrow panel, most of them are in the menu. uiconfig-blueprint
does the same in its folders. Example: https://repalash.com/uiconfig.js/examples/folder-menus.html

```js
{
    type: 'folder', label: 'Box', children: [
        {type: 'checkbox', label: 'Visible', property: [box, 'visible']},
        {type: 'button', label: 'Duplicate', tags: ['context-menu'], value: () => duplicate(box)},
        {type: 'button', label: 'Delete', icon: '<svg viewBox="0 0 16 16">…</svg>', tags: ['context-menu'], value: () => remove(box)},
        {type: 'button', label: 'Center', tags: ['context-menu', 'inline'], value: () => center(box)}, // stays in the body
    ],
}
```

- A button that also has the tag `inline` stays in the body.
- A button with an `icon` shows the icon only in the header, with the label as its tooltip and name; the menu shows
  the icon and the label. `icon` is SVG markup (it takes the text color; app markup only, it is inserted as HTML) or an
  image URL. An icon name (for uiconfig-blueprint) shows the label here, since Tweakpane has no icon set.
- A hidden button is not shown; a disabled or read-only one is dimmed. The ⋮ button shows only when a button does not
  fit. In a disabled folder (or a folder in one) the header buttons and the ⋮ button are off.
- The header follows its size (a resize of the panel, a theme) and each render of the folder: buttons that come and go,
  and changes of `hidden`, `disabled` and the labels. The title keeps its place; a long title ends with … before the
  buttons. A click on the rest of the header folds the folder, as before.
- A click runs the button as a click in the body does (`methods.clickButton`, with undo), and the folder `onChange`
  gets it. The button's `uiRefresh` refreshes the folder header.
- The keys: the menu takes the focus; the arrow keys, Home and End move between the items; Enter or Space presses one;
  Escape closes the menu and gives the focus back to the ⋮ button; Tab closes it. The keys do not reach the page while
  the menu has the focus. A press outside the menu closes it.
- The menu stays inside the window, and scrolls when it is taller (a phone in landscape). It takes the colours of the
  folder (the Tweakpane theme variables).
- `ui.folderMenus = false` (before the folders render) shows all the buttons in the body, as before.
- `ui.mountFolderActions(config, element)` draws the actions of a folder in another element, as in its header: buttons
  while they fit in the element's width, and the rest in a ⋮ menu. It is for an app that hides the header of a folder and
  shows its own title row (the actions of a hidden header are not shown there). The bar follows each render of the
  folder, the element's size and the folder's disabled state, and takes the folder's Tweakpane theme. It returns
  `refresh()` and `remove()`.

  ```js
  const actions = ui.mountFolderActions(objectConfig, myTitleRow) // myTitleRow: an element of the app
  // later
  actions.remove()
  ```
- `ui.openFolderMenu(config, element)` opens a menu with all the header buttons of a folder at another element, for a
  folder whose header the app hides; `ui.folderMenuButtons(config)` lists them. `openButtonMenu(ui, buttons, element)` opens
  such a menu for any list of buttons.

## Theme

An optional theme with five color modes (`light`, `dark`, `blue`, `white`, `black`): larger rows, folder borders and
adjusted type, from threepipe's Tweakpane plugin. Import the stylesheet once and pick a mode for a renderer:

```typescript
import 'uiconfig-tweakpane/theme.css' // or <link rel="stylesheet" href="https://unpkg.com/uiconfig-tweakpane/dist/theme.css">
import { UI } from 'uiconfig-tweakpane';

const ui = new UI();
ui.setTheme('dark'); // null for the default Tweakpane look
```

The mode is a class on the renderer's container (`tpTheme tpTheme-<mode>`), so panels on the same page can use
different modes. `applyTweakpaneTheme(element, mode)` sets the classes on any other element, for example `document.body`.
Without the classes, the stylesheet changes nothing.

## Three.js integration

Set the three.js classes for Color, Vector2, Vector3, Vector4 in the renderer and the color and vector components will automatically use them.

```typescript
import { UI } from 'uiconfig-tweakpane';
import { Color, Vector4, Vector3, Vector2 } from 'three';

const ui = new UI();
ui.THREE = {Color, Vector4, Vector3, Vector2}
```
