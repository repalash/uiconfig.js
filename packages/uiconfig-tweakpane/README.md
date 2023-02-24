# UiConfig-Tweakpane

Tweakpane theme/wrapper library for [uiconfig.js](https://github.com/repalash/uiconfig.js): A UI renderer framework to dynamically generate website/configuration UIs from a JSON-like configurations and/or typescript decorators. 

It includes several components for editor-like user interfaces like folders, sliders, pickers, inputs for string, number, file, vector, colors, etc.

The UI components are bound to javascript/typescript objects and properties through a JSON configuration.

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
    
    const ui = new tpUi.UI()
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

