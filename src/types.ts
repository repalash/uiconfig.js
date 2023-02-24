import {Fof, StringKeyOf, ValOrArr, ValOrArrOp, ValOrFunc} from 'ts-browser-helpers'

export type TUiRefreshModes = 'preRender' | 'postRender' | 'preFrame' | 'postFrame'
export type UiObjectType = string
export type ChangeArgs = any[]

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
     */
    property?: ValOrFunc<[TTarget, StringKeyOf<TTarget>]>,
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
     */
    getValue?: () => T,
    /**
     * setValue function. This is used for inputs, if property, value is not specified.
     * This is called when the value of the input changes.
     * @param value - The value to set
     * @param args - other arguments like the config, renderer, etc. See source code for details.
     */
    setValue?: (value: T, ...args: ChangeArgs) => void,

    /**
     * The Ui element will be hidden if this is true.
     * This can be a boolean or a function that returns a boolean.
     */
    hidden?: ValOrFunc<boolean>,
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
     */
    onChange?: ValOrArrOp<((...args: ChangeArgs) => void)>[];

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

    dispatchMode?: TUiRefreshModes | 'immediate'; //  This is used to specify when to change the values and/or call the function(like onClick) or change events. Default is 'postFrame'

    /**
     * Individual components can support custom options. These can be added to the config object.
     */
    [id: string]: any
}

export interface IUiConfigContainer<TValue = any, TType extends string = string> {
    uiConfig?: UiObjectConfig<TValue, TType>;
}

export interface UiConfigContainer<TValue = any, TType extends string = string> extends IUiConfigContainer<TValue, TType> {
    [id: string]: any
}
