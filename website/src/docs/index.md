uiconfig.js describes a UI as plain config objects (or TypeScript decorators) bound to your data. A renderer turns
the config into a live panel. This is the API reference of the three packages; the search at the top covers all of them,
and the switcher next to the name moves between them.

## Packages

- {@link "uiconfig.js"! | uiconfig.js}: the config types (`UiObjectConfig`, `ChangeEvent`), the decorators
  (`uiSlider`, `uiColor`, `uiContainer`, …), `generateUiFolder` to make a config from any object, and the base classes
  for renderers (`UiConfigRenderer`, `UiConfigMethods`). JavaScript code does not need it; TypeScript code imports its
  types and decorators.
- {@link "uiconfig-tweakpane"! | uiconfig-tweakpane}: the renderer on [Tweakpane](https://tweakpane.github.io/docs/), a
  compact panel for debug and tweak UIs. Its `UI` class adds `setTheme` for the modes of `uiconfig-tweakpane/theme.css`
  and `typeGenerators` for components of your own.
- {@link "uiconfig-blueprint"! | uiconfig-blueprint}: the renderer on [Blueprint](https://blueprintjs.com/) (React), for
  app inspectors: folders, panels that open as pages, and editor inputs.

## A config, rendered

```js
import {UI} from 'uiconfig-tweakpane' // or 'uiconfig-blueprint'

const light = {intensity: 2, enabled: true}
const ui = new UI()
ui.appendChild({
    type: 'folder',
    label: 'Light',
    children: [
        {type: 'slider', label: 'Intensity', bounds: [0, 10], property: [light, 'intensity']},
        {type: 'checkbox', label: 'Enabled', property: [light, 'enabled']},
    ],
})
```

## Learn more

- [Examples](https://repalash.com/uiconfig.js/examples/): every feature as a live panel with its code, in Tweakpane and Blueprint.
- [Guide](https://github.com/repalash/uiconfig.js/blob/master/packages/uiconfig.js/README.md): writing configs, the full config reference, binding.
- [Website](https://repalash.com/uiconfig.js/): live panels, a playground and the component list.
- [llms.txt](https://repalash.com/uiconfig.js/llms.txt): these docs, the guide and the examples as Markdown, for AI agents.
- [GitHub](https://github.com/repalash/uiconfig.js): source, issues and the changelogs.
