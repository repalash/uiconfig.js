# UiConfig Tweakpane

[![NPM Package](https://img.shields.io/npm/v/uiconfig-tweakpane.svg)](https://www.npmjs.com/package/uiconfig-tweakpane)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Tweakpane theme/wrapper library for [uiconfig.js](https://github.com/repalash/uiconfig.js): A UI renderer framework to dynamically generate website/configuration UIs from a JSON-like configurations and/or typescript decorators. 

It includes several components for editor-like user interfaces like folders, sliders, pickers, inputs for string, number, file, vector, colors, etc.

The UI components are bound to javascript/typescript objects and properties through a JSON configuration.

### Examples

Basic Examples: https://repalash.com/uiconfig.js/examples/index.html

Renderer examples: https://repalash.com/uiconfig.js/examples/uiconfig-tweakpane/index.html

API docs: https://repalash.com/uiconfig.js/docs/uiconfig-tweakpane/

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
- `dist/index.js` (`main`, `require`, `browser`, the CDN link): UMD bundle with all dependencies included, for a `<script>` tag or `require()`. This build is legacy and will be removed in the next major version.

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
