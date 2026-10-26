# UiConfig Blueprint.js

[![NPM Package](https://img.shields.io/npm/v/uiconfig-blueprint.svg)](https://www.npmjs.com/package/uiconfig-blueprint)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

Blueprint.js theme/wrapper library for [uiconfig.js](https://github.com/repalash/uiconfig.js): A UI renderer framework to dynamically generate website/configuration UIs from a JSON-like configurations and/or typescript decorators. 

It includes several components for editor-like user interfaces like folders, panels, sliders, pickers, inputs for string, number, file, vector, colors, etc.

The UI components are bound to javascript/typescript    objects and properties through a simple and flexible JSON configuration.

### Examples

Examples: https://repalash.com/uiconfig.js/examples/ (pick Blueprint on an example page)

API docs: https://repalash.com/uiconfig.js/docs/modules/uiconfig-blueprint.html

Threepipe Basic UI: https://threepipe.org/examples/#blueprintjs-ui-plugin/

Threepipe Editor: https://threepipe.org/examples/#blueprintjs-editor/

## Installation and Usage

### npm package

Install the `uiconfig-blueprint` package from npm.
```bash
npm install uiconfig-blueprint
```

Use in any javascript/typescript file.
```typescript
import { UI } from 'uiconfig-blueprint';
// in a browser without a bundler, use the CDN link below

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
<script src="https://unpkg.com/uiconfig-blueprint"></script>
<!--or-->
<script src="https://cdn.jsdelivr.net/npm/uiconfig-blueprint"></script>
```

The module can be accessed with the short-form `bpui`
```html
<script>
    const config = {
        type: "button",
        label: "click me",
        onClick: () => {
            console.log("clicked");
        },
    }
    
    const ui = new bpui.UI()
    ui.appendChild(config)
</script>
```

### Builds

- `dist/index.mjs` (`import`, `module`): ES module. It imports its dependencies `uiconfig.js`, `ts-browser-helpers`, `react`, `react-dom`, `@blueprintjs/core`, `@blueprintjs/icons`, `@blueprintjs/select`, `react-colorful` and `classnames` instead of bundling them, so the bundler of the app keeps one copy of each. The styles and a few internal modules of `@blueprintjs/core` stay in the bundle. `react`, `react-dom` and `@blueprintjs/core` are peer dependencies: npm 7 and later install them, other package managers can need them in the app's `package.json`.
- `lib/esm`: the TypeScript output, one file per source module.
- `dist/index.js` (`main`, `require`, `browser`, the CDN link): UMD bundle with all dependencies included, for a `<script>` tag or `require()`. This build is legacy and will be removed in the next major version.

## Configuration

Check the documentation at [uiconfig.js](https://github.com/repalash/uiconfig.js) on how to create a configuration for the UI.

## Components

1. `folder` - A folder that can be collapsed and expanded. It can have other components as children.
2. `panel` - A panel that will replace the current panel.
3. `input` - A text input field for any kind of primitive types. The type is determined automatically from initial value.
4. `number` - A number input field for numbers.
5. `slider` - A slider for numbers. 
6. `dropdown` - A dropdown. Options can be specified in children with label and optional value properties.
7. `checkbox/toggle` - A toggle for boolean values.
8. `button` - A button that can trigger a function, `onClick` or bound property/value function.
9. `color` - A color picker for colors.
10. `vector/vec/vec2/vec3/vec4` - Multiple number input fields in a row for vectors.
11. `image` - A file input field for files.

## Three.js integration

Set the three.js classes for Color, Vector2, Vector3, Vector4 in the renderer and the color and vector components will automatically use them.

```typescript
import { UI } from 'uiconfig-blueprint';
import { Color, Vector4, Vector3, Vector2 } from 'three';

const ui = new UI();
ui.THREE = {Color, Vector4, Vector3, Vector2}
```


## Development

This package lives in the [uiconfig monorepo](https://github.com/repalash/uiconfig.js). Clone it and install the dependencies at the root.
```bash
git clone https://github.com/repalash/uiconfig.js.git
cd uiconfig.js
npm install
npm run build -w uiconfig.js
```

The examples are pages of the website ([website/README.md](https://github.com/repalash/uiconfig.js/blob/master/website/README.md)), which uses the built `dist` of this
package: build it, then run the website's dev server and open its examples.
```bash
npm run build -w uiconfig-blueprint
npm run dev -w uiconfig-website
```
After a change in `src`, build the package again.

Build the project.
```bash
npm run build -w uiconfig-blueprint
```

Releases are published to npm from GitHub Actions: see the root README.

## License
MIT, see [LICENSE](LICENSE). Releases up to 0.1.0-dev.15 were licensed under Apache 2.0.

## Library usage in react

This part is still a WIP.

Note: First check the dependencies. (Install all the required peerDependencies)

Import from `uiconfig-blueprint/lib` build.

In JS/TS/JSX/TSX files:
```javascript
import {ConfigurationPanelComponent} from 'uiconfig-blueprint/lib/esm/lib'
```

In SCSS
```scss
@import 'uiconfig-blueprint/src/renderer';
```
or 
In CSS
```css
@import 'uiconfig-blueprint/lib/css/renderer.css';
```

postcss plugin for themes
```javascript
{
  postcssPlugin: 'modify-css-content',
  Once(root) {
    // Modify to fix :root.bpx-flat :root twice when imported in renderer.scss
    root.walkRules(rule => {
      rule.selector = rule.selector.replace(/:root.bpx-(.*) :root/g, ':root.bpx-$1');
    });
  },
}
```
