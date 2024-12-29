# UiConfig

[![https://nodei.co/npm/uiconfig.js.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/uiconfig.js.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/uiconfig.js)

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

Examples: https://repalash.com/uiconfig.js/examples/index.html

A super-small UI renderer framework to dynamically generate website/configuration UIs from a JSON-like configurations and/or typescript decorators or zod schemas etc. It includes the types for the configuration, utilities for parsers and renderers and renderers for different UI frameworks.

It includes several themes with components for editor-like user interfaces like panels, sliders, pickers, inputs for string, number, file, vector, colors, etc. 

Available Renderers: [uiconfig-tweakpane](https://github.com/repalash/uiconfig-tweakpane), [uiconfig-blueprint](https://github.com/repalash/uiconfig-blueprint)

The UI components are bound to javascript/typescript objects and properties through a JSON configuration.

This can be used to quickly create simple configuration panels for web applications or games or to create a full-blown editor for games and applications.

The UI bindings are specified directly in the javascript objects or classes and can be accessed while rendering the UI, so that UIs can be dynamically created and updated, along with getting to choose the theme and the components to use.

The UI can be defined in any js/ts project without adding any dependencies, the renderer needs to be imported while creating/rendering the UI, which can be optional(like in the case of debug UI).

Sample of UI Config in javascript:
```javascript
const config = {
    type: "folder",
    label: "My Panel",
    children: [
        {
            type: "slider",
            label: "My Slider",
            value: 0, // this value will change when the slider is moved
            bounds: [0, 10],
            stepSize: 0.1,
        },
        {
            type: "input",
            label: "My Input",
            property: [obj, 'myProperty'], // obj.myProperty will change when the input is changed
        },
        {
            type: "button",
            label: "My Button",
            onClick: () => {
                console.log("Button clicked");
            },
        }
    ]
}
```

The same sample with decorators in typescript:

```typescript
@uiContainer('My Panel')
class Sample implements IUiConfigContainer {
    uiConfig: UiObjectConfig;
    
    @uiSlider('My Slider', [0, 10], 0.1)
    sliderValue = 0
    
    @uiInput('My Input')
    myProperty = 0;
    
    @uiButton('My Button')
    myFunction = ()=>{
        console.log("Button clicked");
    }

}
```

This UI can be added to any webpage using one of several renderers/themes like lilgui, dat.gui, tweakpane, blueprint, etc, which can be picked based on the project requirements.

TODO: add screenshots


## Getting Started

First the UI specification needs to be defined along with the data objects or classes. This specification is then used to render the UI by the renderer.

The renderer packages are separate from the core library and can be imported separately.

### Installation

uiconfig.js has a core package which contains types and decorators and separate packages for each theme.

#### Core package

For javascript/html files and js libraries there is no need to install the uiconfig.js package, just import the renderer package and use it.

For typescript projects, the package `uiconfig.js` can be installed/imported to use the decorators and types.

```bash
npm install uiconfig.js
```

#### Renderer packages

For both javascript/typescript, renderer packages can be installed separately in the webapp where the UI is to be rendered.

```bash
npm install uiconfig-tweakpane
# or 
npm install uiconfig-blueprint
# or 
npm install uiconfig-lilgui
```

It can also be added with a CDN link with [unpkg](https://unpkg.com/) or [jsdelivr](https://www.jsdelivr.com/).

```html
<script src="https://unpkg.com/uiconfig-tweakpane"></script>
<!--or-->
<script src="https://cdn.jsdelivr.net/npm/uiconfig-tweakpane"></script>

<!--Then the UI can be accessed with the short-form tpui, bpui, lilui...  -->
<script>
    const config = {
        type: "button",
        label: "click me",
        onClick: () => {
            console.log("clicked");
        },
    }
    
    const ui = new tpui.UI() // use bpui.UI() for blueprint
    ui.appendChild(config)
</script>
```


### Defining the UI specification

The UI spec defines the properties to bind and the components to use for each property. The UI spec can be defined in the data object or class itself or it can be defined in a separate file or generated at runtime from JSON or any other format.

Here is a simple example of defining a `Person` data model with `name`, `age` and `city` properties, and creating its UI spec. We are defining it such that an input box is created for `name`, a slider for `age` and a dropdown for `city`.

#### Javascript/Typescript objects

<details><summary><code>javascript</code></summary>

```javascript
const data = {
    name: "John",
    age: 30,
    city: "New York",
};
data.uiConfig = {
    type: "folder",
    label: "Person",
    children: [
        {
            type: "input",
            label: "Name",
            property: [data, "name"],
        },
        {
            type: "slider",
            label: "Age",
            bounds: [0, 150],
            stepSize: 1,
            property: [data, "age"],
        },
        {
            type: "dropdown",
            label: "City",
            property: [data, "city"],
            children: ["New York", "Paris", "London"].map((v) => ({label: v})),
        },
        {
            type: "button",
            label: "Reset",
            onClick: () => {
                data.name = "John";
                data.age = 30;
                data.city = "New York";
                // Update/Re-render the UI so that the changes are reflected
                data.uiConfig.uiRefresh(true);
            },
        }
    ],
};
```

</details>
<details><summary><code>typescript</code></summary>

```typescript
import {UiConfigContainer} from "uiconfig.js";
const data: UiConfigContainer = {
    name: "John",
    age: 30,
    city: "New York",
};
data.uiConfig = {
    type: "folder",
    label: "Person",
    children: [
        {
            type: "input",
            label: "Name",
            property: [data, "name"],
        },
        {
            type: "slider",
            label: "Age",
            bounds: [0, 150],
            stepSize: 1,
            property: [data, "age"],
        },
        {
            type: "dropdown",
            label: "City",
            property: [data, "city"],
            children: ["New York", "Paris", "London"].map((v) => ({label: v})),
        },
        {
            type: "button",
            label: "Reset",
            onClick: () => {
                data.name = "John";
                data.age = 30;
                data.city = "New York";
                // Update/Re-render the UI so that the changes are reflected
                data.uiConfig!.uiRefresh?.(true);
            },
        }
    ],
};
```

</details>

#### Javascript/Typescript classes

<details><summary><code>javascript</code></summary>

```javascript
class Person{
    constructor(){
        this.name = 'John';
        this.age = 30;
        this.city = 'New York';
    }
    uiConfig = {
        type: "folder",
        label: "Person",
        children: [
            {
                type: "input",
                label: "Name",
                property: [this, "name"],
            },
            {
                type: "slider",
                label: "Age",
                bounds: [0, 150],
                stepSize: 1,
                property: [this, "age"],
            },
            {
                type: "dropdown",
                label: "City",
                property: [this, "city"],
                children: ["New York", "Paris", "London"].map((v) => ({label: v})),
            },
            {
                type: "button",
                label: "Reset",
                onClick: () => {
                    this.name = "John";
                    this.age = 30;
                    this.city = "New York";
                    // Update/Re-render the UI so that the changes are reflected
                    this.uiConfig.uiRefresh(true);
                },
            }
        ],
    }
}
const data = new Person();
```

</details>
<details><summary><code>typescript</code></summary>

```typescript
import {UiConfigContainer, UiObjectConfig} from "uiconfig.js";
class Person implements IUiConfigContainer{
    name = "John"
    age = 30
    city = "New York"
    uiConfig: UiObjectConfig = {
        type: "folder",
        label: "Person",
        children: [
            {
                type: "input",
                label: "Name",
                property: [this, "name"],
            },
            {
                type: "slider",
                label: "Age",
                bounds: [0, 150],
                stepSize: 1,
                property: [this, "age"],
            },
            {
                type: "dropdown",
                label: "City",
                property: [this, "city"],
                children: ["New York", "Paris", "London"].map((v) => ({label: v})),
            },
            {
                type: "button",
                label: "Reset",
                onClick: () => {
                    this.name = "John";
                    this.age = 30;
                    this.city = "New York";
                    // Update/Re-render the UI so that the changes are reflected
                    this.uiConfig.uiRefresh?.(true);
                },
            }
        ],
    }
}
const data = new Person();
```

</details>
<details><summary><code>typescript decorators</code></summary>

```typescript
import {IUiConfigContainer, UiObjectConfig, uiContainer, uiInput, uiSlider, uiDropdown, uiButton} from "uiconfig.js";

@uiContainer("Person")
class Person implements IUiConfigContainer{
    uiConfig: UiObjectConfig

    @uiInput('Name')
    name = "John"
  
    @uiSlider('Age', [0, 150], 1)
    age = 30

    @uiDropdown('City', ['New York', 'Paris', 'London'].map((v) => ({label: v})))  
    city = "New York"
    
    @uiButton('Reset')
    reset = ()=>{
        this.name = "John";
        this.age = 30;
        this.city = "New York";
        // Update/Re-render the UI so that the changes are reflected
        this.uiConfig.uiRefresh?.(true);
    }
}
const data = new Person();
```

Note: `experimentalDecorators` is required to be enabled in `tsconfig.json` for this to work.

</details>

### Creating a UI from uiconfig

Once the UI is defined, it can be rendered on the page using any of the UiConfig renderers.

```javascript
import {UI} from 'uiconfig-tweakpane' // or 'uiconfig-blueprint'
const renderer = new UI()
renderer.appendChild(data.uiConfig)
```

This will create a panel with a folder called `Person` containing the input fields for the properties of the data object. This will create an input box is created for `name`, a slider for `age` and a dropdown for `city`, inside the person folder.

Here `appendChild` function appends the UI generated from the config object to the main panel. Tweakpane Renderer only supports a single panel (the main panel), so all objects are appended to it. 

### Structure of a UiConfig
A config object define a single UI component. It can be a folder, a button, a slider, a dropdown, etc. The config object can also contain other UiConfig object  as a list of child configs in `children`, which will be rendered inside the parent component in the way it supports it. The Configs can in this way be nested to create complex interfaces.

Note: The UiConfig is automatically generated when using the decorators in typescript.

The config object must follow this interface:

```typescript
export interface UiObjectConfig<T = any, TType extends UiObjectType = UiObjectType, TTarget = any> {
    /**
     * An optional uuid to identify this object. If not provided, one will be generated during first render.
     * This must be provided if a new UiObjectConfig object is generated each time the config is rendered.
     */
    uuid?: string,
    /**
     * The type of the object. This is used to determine the component to use.
     * Examples: 'button', 'slider', 'dropdown', 'folder', 'input' etc
     */
    type?: TType,
    /**
     * The label to use for the object. This is used as the title for folders, and as the label for inputs.
     * This can be a string or a function that returns a string.
     * If not provided, the label will be determined automatically, by the key of the property or sets to defaults
     */
    label?: ValOrFunc<string>,
    /**
     * Children of this object. This is used for folders and dropdowns.
     * This can be an array of UiObjectConfig objects, or an array of functions that returns an array of UiObjectConfig objects.
     */
    children?: (UiObjectConfig | Fof<ValOrArrOp<UiObjectConfig>>)[],

    /**
     * The property to bind to. This is used for inputs.
     * This can be an array of [target, key] or a function that returns an array of [target, key].
     * key can be a number for arrays, or a dot separated path for json objects.
     */
    property?: ValOrFunc<[TTarget, StringKeyOf<TTarget>|number]>,
    /**
     * Alias for property
     */
    binding?: ValOrFunc<[TTarget, StringKeyOf<TTarget>]>,
    /**
     * The value of the object. This is used for inputs, if property is not provided.
     */
    value?: T,
    /**
     * getValue function. This is used for inputs, if property, value is not specified.
     * This is called to get the value of the input on each render/update.
     * It is ignored if property or value is specified.
     */
    getValue?: () => T,
    /**
     * setValue function. This is used for inputs, if property, value is not specified.
     * This is called when the value of the input changes.
     * It is ignored if property or value is specified.
     * @param value - The value to set
     * @param args - other arguments like the config, renderer, etc. See source code for details.
     */
    setValue?: (value: T, ...args: ChangeArgs) => void,
    /**
     * Path of the binding inside the value. (dot separated json path)
     * In case of property it is appended to the property path.
     */
    path?: ValOrFunc<string>,
    /**
     * The Ui element will be hidden if this is true.
     * This can be a boolean or a function that returns a boolean.
     */
    /**
     * The Ui element will be hidden if this is true.
     * This can be a boolean or a function that returns a boolean.
     */
    hidden?: ValOrFunc<boolean>,
    /**
     * The Ui input will be disabled if this is true, i.e. the user will not be able to change the value.
     * This can be a boolean or a function that returns a boolean.
     */
    /**
     * The Ui input will be disabled if this is true, i.e. the user will not be able to change the value.
     * This can be a boolean or a function that returns a boolean.
     */
    disabled?: ValOrFunc<boolean>,
    /**
     * The Ui input will be read-only if this is true, i.e. the user will not be able to change the value.
     * This can be a boolean or a function that returns a boolean.
     * This can also be achieved by setting specifying a getValue function, but not a setValue function. Or by setting disabled to true.
     */
    readOnly?: ValOrFunc<boolean>,

    /**
     * tags can be added to the config object to be used for filtering, like rendering only objects with a certain tag.
     * This can be a string or an array of strings.
     */
    tags?: ValOrArr<string>,

    /**
     * onChange callbacks can be added to the config object to be called when the value of the object changes.
     * This can be a function or an array of functions.
     * When it's specified with a container(with children) object, it will be called when any of the children change, and the config of the child that's changed will be available in the arguments
     */
    onChange?: ValOrArrOp<((...args: ChangeArgs) => void)>;

    /**
     * A function to be called when the Ui element is clicked.
     * Only for buttons. This is an alias of config.value or config.property for buttons.
     * @param args
     */
    onClick?: (...args: any[]) => void; // for button-like types

    /**
     * bounds for the value of the object. This is used for numeric inputs like number and sliders.
     * This can be an array of [min, max] or a function that returns an array of [min, max].
     */
    bounds?: ValOrFunc<number[]>;
    /**
     * stepSize for specifying the min change in the value. This is used for numeric inputs like number and slider.
     * The value will be rounded to the nearest multiple of stepSize.
     * This can be a number or a function that returns a number.
     */
    stepSize?: ValOrFunc<number>;

    /**
     * Only for folders. The Ui element will be expanded if this is true.
     * This can be a boolean or a function that returns a boolean.
     * If this is not set to a function, config.expanded can be read to get the current state.
     */
    expanded?: ValOrFunc<boolean>,

    /**
     * Only for folders. The callback called when a folder is expanded or collapsed.
     * @param c
     */
    onExpand?: (c: UiObjectConfig) => void,

    /**
     * Only for elements with inline picker support
     * This can be a boolean or a function that returns a boolean.
     */
    inlinePicker?: ValOrFunc<boolean>,

    /**
     * Extra HTMLElements to be added to the UI element. This is used for customizing the UI.
     * This can be an array of HTMLElement or a function that returns an array of HTMLElement.
     */
    domChildren?: HTMLElement[] | (() => HTMLElement[]),
    
    /**
     * After initial rendering, config.uiRef will be set to the instance of the UI component that's created.
     * The type of this will depend on the type of the component and the base UI library used.
     * This can be used to access the UI component directly, for example to add event listeners. Note that the uiRef might change on render.
     */
    uiRef?: any
    /**
     * The type of the UI component that's referenced by config.uiRef. This is set during rendering and used to re-render the UI if config.type changes.
     */
    uiRefType?: UiObjectType
    /**
     * After initial rendering, config.uiRefresh will be set to a function that can be used to re-render the UI.
     * @param deep - If true, the UI will be re-rendered recursively, otherwise only the current object will be re-rendered.
     * @param mode - The mode to re-render in. See TUiRefreshModes for details. Use when syncing with custom render loop
     * @param delay - The delay in ms to wait before re-rendering. This is useful if multiple changes are made in quick succession. If another refresh event is in the queue for the same object, it will be postponed by this amount. This is not exact for small values.
     */
    uiRefresh?: (deep?: boolean, mode?: TUiRefreshModes | 'immediate', delay?: number) => void; // delay in ms
    /**
     * This is used to specify when to change the values and/or call the function(like onClick) or change events. Default is 'postFrame'
     */
    dispatchMode?: TUiRefreshModes | 'immediate';

    /**
     * @internal
     * Can be set by the parent, if this is a child object.
     */
    parentOnChange?: (...args: ChangeArgs) => void;

    /**
     * Individual components can support custom options. These can be added to the config object.
     */
    [id: string]: any
}
```

### Property/Value binding in Ui Object
For UiConfig which have an editable value (like input, slider, dropdown, etc), the value is bound to a property/field in an object. This is done using the `property` field in the config object. The value is an array of `[object, property]` which will be used to bind the value to the property of the object. 

An Example:
```javascript
const state = {
    name: "John"
}
const config = {
    type: "input",
    label: "Name",
    property: [state, "name"],
}
renderer.appendUiConfig(config)
// Here state.name will be bound to the value of the input box, and any changes to the input box will be reflected in state.name
```

In case the property is not defined, the `value` field is used to store/read the state of the UI component. This is useful when the same object is used for data and for UI config.

```javascript
const config = {
    type: "input",
    label: "Name",
    value: "John",
}
renderer.appendUiConfig(config)
// Here the value of the input box will be "John", and any changes to the input box will not be reflected in config.value.
```

As an alternative the config can also define `getValue` and `setValue` functions instead of binding to a property.
```javascript
let name = "John";
const config = {
    type: "input",
    label: "Name",
    getValue: ()=>name,
    setValue: (v)=>{
        console.log("Setting value to", v);
        name = v;
    }
}
renderer.appendUiConfig(config);
// Here the value of the input box will be "John", and any changes to the input box will change the value of the variable name and log to the console.
```

## Integration with three.js

If supported in the renderer(like in tweakpane) the three.js objects will work out of the box for Color and Vector2,
Vector3, Vector4 types.
See [uiconfig-tweakpane](https://github.com/repalash/uiconfig-tweakpane)

For viewing textures and images check the implementation in [threepipe](https://threepipe.org) under[@threepipe/plugin-tweakpane](https://github.com/repalash/threepipe/tree/main/plugins/tweakpane/src/TweakpaneUiPlugin.ts)

## Changelog

See - [CHANGELOG.md](./CHANGELOG.md)