// The example pages: one entry for each page, grouped by topic. vite.config.js builds website/examples/index.html
// and website/examples/<slug>.html from this list (scripts/examples-pages.mjs); the page script
// (src/examples/page.ts) runs the file `code/<slug>.js` or `.ts`, and the page shows the source of that same file.
//
// Fields of an example:
//   slug       the page is examples/<slug>.html, the code is code/<slug>.js or code/<slug>.ts
//   title      page title
//   summary    one or two sentences under the title
//   renderers  the renderers that support the example; the first is the default
//   preview    the component types drawn on the card of the index page
//   note       optional: a line under the panel, e.g. about the other renderer
//   log        the page shows a log under the panel (the code gets `log`)
//   view       the page shows a view next to the panel (the code gets `view`, an element), for three.js and threepipe
//   theme      false: the page does not set a Tweakpane theme (the example sets it)

/** @typedef {'tweakpane' | 'blueprint'} RendererName */

export const topics = [
    {id: 'syntax', title: 'Writing configs', icon: 'syntax', intro: 'The same panel from a plain object, a class, TypeScript decorators, or generated from the data.'},
    {id: 'binding', title: 'Binding to data', icon: 'bind', intro: 'How a component reads and writes its value: a property of an object, the config itself, functions, or a path.'},
    {id: 'components', title: 'Components', icon: 'components', intro: 'The `type` of a config picks the component. Both renderers have the common set; Tweakpane adds a few.'},
    {id: 'dynamic', title: 'Dynamic panels', icon: 'playground', intro: 'Panels that change with the data: computed properties, children that come and go, change events, undo.'},
    {id: 'renderers', title: 'Renderers', icon: 'install', intro: 'Options of one renderer: the themes of uiconfig-tweakpane and components of your own.'},
    {id: 'three', title: 'three.js and threepipe', icon: 'three', intro: 'Colors and vectors of three.js objects, edited in place, and the panels of threepipe.'},
]

const both = ['tweakpane', 'blueprint']

export const examples = [
    // ---- writing configs
    {
        slug: 'object-syntax', topic: 'syntax', title: 'Plain objects', renderers: both,
        summary: 'Put the config next to the data in a plain object. `property` binds each component to a field, and `uiRefresh` shows values that the code changed.',
        preview: ['input', 'slider', 'dropdown', 'button'],
    },
    {
        slug: 'class-syntax', topic: 'syntax', title: 'Classes', renderers: both,
        summary: 'Build the config in a class field: `this` is the object that the components edit, and methods are the actions of the buttons.',
        preview: ['input', 'slider', 'dropdown', 'button'],
    },
    {
        slug: 'decorators', topic: 'syntax', title: 'TypeScript decorators', renderers: both,
        summary: 'Decorators on the fields generate the config. A field that holds another decorated object becomes a folder. This needs `"experimentalDecorators": true` in tsconfig.json.',
        preview: ['input', 'slider', 'checkbox', 'color', 'folder'],
    },
    {
        slug: 'generated', topic: 'syntax', title: 'Generated from data', renderers: both,
        summary: '`generateUiFolder` makes a config from any object: the type of each value picks the component, and nested objects become folders.',
        preview: ['number', 'checkbox', 'input', 'vec', 'folder'], log: true,
    },

    // ---- binding
    {
        slug: 'property-binding', topic: 'binding', title: 'Property binding', renderers: both,
        summary: '`property: [object, key]` binds a component to a field. The key can be an array index or a dot path, and `property` can be a function that picks the object on each refresh.',
        preview: ['dropdown', 'slider', 'input', 'number'], log: true,
    },
    {
        slug: 'value-binding', topic: 'binding', title: 'Value in the config', renderers: both,
        summary: 'Without a `property`, the component keeps its value in `config.value`. This suits values that belong to the panel only.',
        preview: ['input', 'slider', 'checkbox', 'button'], log: true,
    },
    {
        slug: 'getter-setter', topic: 'binding', title: 'getValue and setValue', renderers: both,
        summary: 'Functions instead of a field: `getValue` gives the value to show, `setValue` gets the edited value. Here the panel shows a temperature in Fahrenheit that is stored in Celsius.',
        preview: ['slider', 'number', 'button'], log: true,
    },
    {
        slug: 'path-binding', topic: 'binding', title: 'Paths in nested data', renderers: both,
        summary: 'A folder gets the data object as its `value`, and its children pick their fields with a dot `path`, array indices included.',
        preview: ['input', 'number', 'folder', 'button'], log: true,
    },

    // ---- components
    {
        slug: 'inputs', topic: 'components', title: 'Inputs, numbers and sliders', renderers: both,
        summary: '`input` takes its kind from the value: text, number or boolean. `number` and `slider` use `bounds` and `stepSize`; `checkbox` and `toggle` edit booleans; `monitor` only shows a value.',
        preview: ['input', 'number', 'slider', 'checkbox', 'monitor'],
    },
    {
        slug: 'dropdowns', topic: 'components', title: 'Dropdowns', renderers: both,
        summary: 'The options of a `dropdown` (or `select`) are its `children`. An option without a `value` uses its `label`. A function in `children` makes the options on each refresh.',
        preview: ['dropdown', 'dropdown', 'dropdown'], log: true,
        note: 'uiconfig-tweakpane reads the options once, when it creates the dropdown, so "Add a font" changes the list in Blueprint only.',
    },
    {
        slug: 'buttons', topic: 'components', title: 'Buttons', renderers: both,
        summary: 'A `button` calls `onClick`, or the function that its `property` or `value` points to. `disabled` can be a function.',
        preview: ['button', 'button', 'monitor'], log: true,
    },
    {
        slug: 'colors-vectors', topic: 'components', title: 'Colors and vectors', renderers: both,
        summary: '`color` edits a hex string, a number or a three.js `Color`; `vec2`, `vec3` and `vec4` edit `{x, y, z, w}` objects. Both components create their values with the classes in `ui.THREE`.',
        preview: ['color', 'color', 'vec', 'vec'], log: true,
    },
    {
        slug: 'folders-panels', topic: 'components', title: 'Folders and panels', renderers: both,
        summary: 'A `folder` groups its children and folds; `expanded` sets its state and `onExpand` runs when it opens. A `panel` opens as a page of its own in Blueprint and shows as a folder in Tweakpane.',
        preview: ['folder', 'slider', 'folder', 'checkbox'], log: true,
    },
    {
        slug: 'text-tabs', topic: 'components', title: 'Text areas, tabs and separators', renderers: ['tweakpane'],
        summary: 'Three components of uiconfig-tweakpane: `textarea` for text on several lines, `tabs` with a folder on each tab, and `separator`.',
        preview: ['textarea', 'separator', 'tabs'],
        note: 'Blueprint has no textarea, tabs or separator component. For text on several lines, give an `input` the option `multiline: true` there.',
    },

    // ---- dynamic panels
    {
        slug: 'hidden-disabled', topic: 'dynamic', title: 'Hidden, disabled and read-only', renderers: both,
        summary: '`hidden`, `disabled`, `readOnly` and `label` can be functions. The renderer calls them on each refresh, so an `onChange` that refreshes the folder keeps them current.',
        preview: ['checkbox', 'dropdown', 'slider', 'input'],
    },
    {
        slug: 'dynamic-children', topic: 'dynamic', title: 'Dynamic children', renderers: both,
        summary: 'A function in `children` returns the child configs on each refresh. Add and remove items in the data, then call `uiRefresh(true)`.',
        preview: ['folder', 'input', 'checkbox', 'button'], log: true,
    },
    {
        slug: 'on-change', topic: 'dynamic', title: 'Change events', renderers: both,
        summary: '`onChange` gets a change event: the new and old value, the config that changed, and `last`, which is false while a slider moves. On a folder, it runs for each change of its children.',
        preview: ['slider', 'color', 'checkbox'], log: true,
    },
    {
        slug: 'live-update', topic: 'dynamic', title: 'Live text input', renderers: both,
        summary: 'Tweakpane sets the value of a text input on Enter or when it loses focus. With `liveUpdate: true`, it sets the value on each key too, with `last: false` until the edit ends.',
        preview: ['input', 'input', 'monitor'], log: true,
        note: 'Blueprint text inputs always set the value on each key, so the two inputs act the same there.',
    },
    {
        slug: 'undo-redo', topic: 'dynamic', title: 'Undo and redo', renderers: both,
        summary: 'Each renderer records the edits in `ui.undoManager` and binds Ctrl+Z and Ctrl+Shift+Z. A button\'s `onClick` can return a function that undoes it.',
        preview: ['slider', 'color', 'button', 'button'], log: true,
    },

    // ---- renderers
    {
        slug: 'tweakpane-themes', topic: 'renderers', title: 'Tweakpane themes', renderers: ['tweakpane'], theme: false,
        summary: 'uiconfig-tweakpane has an optional stylesheet with five color modes. Import `uiconfig-tweakpane/theme.css` once, then pick a mode for each renderer with `setTheme`.',
        preview: ['dropdown', 'slider', 'color', 'checkbox'],
    },
    {
        slug: 'custom-component', topic: 'renderers', title: 'Custom components', renderers: ['tweakpane'],
        summary: 'A new `type` for uiconfig-tweakpane: add a function to `ui.typeGenerators` that makes the Tweakpane blade. This one draws a number as a graph.',
        preview: ['graph', 'slider', 'checkbox'],
        note: 'uiconfig-blueprint does not export a way to add component types from its main entry yet.',
    },

    // ---- three.js
    {
        slug: 'three-objects', topic: 'three', title: 'three.js objects', renderers: both, view: true,
        summary: 'With `ui.THREE` set, color and vector components edit three.js objects in place: the material color, the position and the scale of a mesh.',
        preview: ['color', 'vec', 'vec', 'slider'],
    },
    {
        slug: 'threepipe', topic: 'three', title: 'threepipe viewer', renderers: both, view: true,
        summary: 'threepipe gives its viewer, plugins, objects and materials a `uiConfig`. Append them to a renderer to get an editor. threepipe loads from threepipe.org.',
        preview: ['folder', 'slider', 'color', 'folder'],
    },
    {
        slug: 'threepipe-picking', topic: 'three', title: 'threepipe: edit the picked object', renderers: both, view: true,
        summary: 'Click a part of the model: the panel shows the config of that object and its material. A function in `children` reads the selection on each refresh.',
        preview: ['folder', 'color', 'slider', 'vec'],
    },
]

/** @param {string} slug */
export const exampleBySlug = (slug) => examples.find((e) => e.slug === slug)
