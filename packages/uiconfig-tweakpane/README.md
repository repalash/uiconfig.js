# UiConfig Tweakpane

[![NPM Package](https://img.shields.io/npm/v/uiconfig-tweakpane.svg)](https://www.npmjs.com/package/uiconfig-tweakpane)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Tweakpane theme/wrapper library for [uiconfig.js](https://github.com/repalash/uiconfig.js): A UI renderer framework to dynamically generate website/configuration UIs from a JSON-like configurations and/or typescript decorators. 

It includes several components for editor-like user interfaces like folders, sliders, pickers, inputs for string, number, file, vector, colors, etc.

The UI components are bound to javascript/typescript objects and properties through a JSON configuration.

### Examples

Basic Examples: https://repalash.com/uiconfig.js/examples/index.html

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

The module can be accessed with the short-form `tpui`
```html
<script>
    const config = {
        type: "button",
        label: "click me",
        onClick: () => {
            console.log("clicked");
        },
    }
    
    const ui = new tpui.UI()
    ui.appendChild(config)
</script>
```

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

## Three.js integration

Set the three.js classes for Color, Vector2, Vector3, Vector4 in the renderer and the color and vector components will automatically use them.

```typescript
import { UI } from 'uiconfig-tweakpane';
import { Color, Vector4, Vector3, Vector2 } from 'three';

const ui = new UI();
ui.THREE = {Color, Vector4, Vector3, Vector2}
```
