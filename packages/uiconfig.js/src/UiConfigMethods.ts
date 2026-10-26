import {ChangeArgs, ChangeEvent, TUiRefreshModes, UiObjectConfig} from './types'
import {
    AnyFunction,
    clonePrimitive,
    copyPrimitive,
    equalsPrimitive,
    Fof,
    getOrCall,
    JSUndoManager,
    PrimitiveVal,
    recordUndoCommand,
    setValueUndoCommand,
    uuidV4
} from 'ts-browser-helpers'
import {UiConfigRendererBase} from './UiConfigRendererBase'
import {ActionCommand, SetValueCommand, SetValueCommandProps, undoCommandTypes} from './undo_commands'

export class UiConfigMethods {
    constructor(
        protected _renderer: UiConfigRendererBase
    ) {
    }

    undoEditingWaitTime = 2000

    // not used
    recordUndo(com: SetValueCommand|ActionCommand) {
        recordUndoCommand(this._renderer.undoManager, com, undoCommandTypes.setValue, this.undoEditingWaitTime)
    }

    async performAction<T extends AnyFunction>(targ: any|undefined, action: T, args: Parameters<T>, config: UiObjectConfig, onUndoRedo?: (c: ActionCommand)=>void) {
        return UiConfigMethods.PerformAction(targ, action, args, config, onUndoRedo, this._renderer.undoManager, this.undoEditingWaitTime)
    }

    getValue<T extends PrimitiveVal>(config: UiObjectConfig<T>, val: T | undefined, copyOnEqual = true): T | undefined {
        return UiConfigMethods.GetValue(config, val, copyOnEqual)
    }

    async setValue<T extends PrimitiveVal>(config: UiObjectConfig<T>, value: T, props: {last?: boolean, config?: UiObjectConfig, configPath?: UiObjectConfig[], value?: any, lastValue?: any}, forceOnChange?: boolean, trackUndo = true) {
        return UiConfigMethods.SetValue(config, value, props, forceOnChange, trackUndo, this._renderer, this._renderer.undoManager, this.undoEditingWaitTime)
    }

    /**
     *
     * @param config
     * @param props - only last needs to be set, rest are optional. `lastValue` can be set if known (but it should be exactly equal to the value in the binding and not cloned). `config`, `configPath` are for parentOnChange, no need to set that.
     */
    async dispatchOnChange<T>(config: UiObjectConfig<T>, props: (SetValueCommandProps&{value?: PrimitiveVal, [key:string]:any})) {
        return this.runAtEvent(config, () => UiConfigMethods.DispatchOnChangeSync(config, props))
    }

    /**
     * Args is generally the event like the mouse event - `clickButton(config, {args: [event]})`
     * @param config
     * @param options
     */
    async clickButton(config: UiObjectConfig, options?: {args: any[]}) {
        return this.runAtEvent(config, async() => {
            // const args: any[] = []
            // const prmpt = getOrCall(config.prompt)
            // if (prmpt) args.push(await this._renderer.prompt(...prmpt))

            const binding = UiConfigMethods.GetBinding(config, false)
            const tar = binding[0]
            const key = binding[1]
            const args = getOrCall(config.sendArgs, config) === false ? [] : options?.args ?? []
            const actions = []
            if (tar) {
                const action = (tar[key] ?? tar.value) as Fof<any>
                if (typeof action === 'function') {
                    actions.push([action, tar])
                } else if (action) {
                    console.warn('Invalid action type for button', action)
                }
            }
            if (typeof config.onClick === 'function') {
                actions.push([config.onClick, config])
            }
            for (const [action, targ] of actions) {
                await this.performAction(targ, action, args, config)
            }

            await this.dispatchOnChange(config, {})
            // this.dispatchOnChangeSync(config, {})
        })
    }

    async runAtEvent<T>(config: UiObjectConfig, run: () => T | Promise<T>) {
        return UiConfigMethods.RunAtEvent(config, run, this._renderer)
    }

    undoPresets = {
        [undoCommandTypes.setValue]: (c: SetValueCommand)=>{
            const ref = ()=>{
                c.onUndoRedo && c.onUndoRedo(c)
                c.uid.uiRefresh?.(false)
            }
            return {
                undo: ()=>{
                    // console.log('undo', c.lastVal)
                    this.setValue(c.uid, c.lastVal, c.props, undefined, false).then(ref)
                },
                redo: ()=>{
                    // console.log('redo', c.val)
                    this.setValue(c.uid, c.val, c.props, undefined, false).then(ref)
                },
            }
        },
        [undoCommandTypes.action]: (c: ActionCommand)=>{
            const ref = ()=>{
                c.onUndoRedo && c.onUndoRedo(c)
                c.uid.uiRefresh?.(false)
            }
            return {
                undo: async()=>{
                    await c.undo.call(c.target, ...c.args)
                    ref()
                },
                redo: async()=>{
                    await c.redo.call(c.target, ...c.args)
                    ref()
                },
            }
        },
    }

    static DefaultDispatchMode: TUiRefreshModes | 'immediate' = 'immediate'
    static async RunAtEvent<T>(config: UiObjectConfig, run: () => T | Promise<T>, dispatcher?: UiConfigRendererBase) {
        const dispatchMode = getOrCall(config.dispatchMode, config) ?? this.DefaultDispatchMode
        if (dispatchMode === 'immediate' || !dispatcher) return run()
        return new Promise<T>((resolve) => {
            const listener = async() => { // make sure it is only called post frame
                dispatcher.removeEventListener(dispatchMode, listener)
                resolve(await run())
            }
            dispatcher.addEventListener(dispatchMode, listener)
        })
    }

    static GetBinding(config: UiObjectConfig, parent = true) {
        let prop = getOrCall(config.property, config)
        const path = getOrCall(config.path, config)
        if (prop === undefined && Object.hasOwn(config, 'value')) {
            prop = [config, 'value']
        }
        if (prop === undefined && parent) {
            prop = getOrCall(config.parentProperty, config)
        }
        // a key can be 0 (an array index), so only undefined, null and '' are invalid
        if (!prop || typeof prop[0] !== 'object' || prop[1] === undefined || prop[1] === null || prop[1] === '') {
            // console.warn('Cannot determine property for uiConfig', config)
            return [undefined, ''] as [undefined, string]
        }
        if (typeof prop[1] === 'string' && path && path.length) prop = [prop[0], prop[1] + '.' + path]
        if (typeof prop[1] === 'string' && prop[1].includes('.')) {
            // json path
            const path1 = prop[1].split('.')
            let tar = prop[0]
            const key = path1.pop() || ''
            for (const p of path1) {
                tar = Array.isArray(tar) ? tar[parseInt(p)] : tar[p]
                if (!tar) {
                    console.warn('Cannot determine property, invalid property path', config, prop)
                    return [undefined, ''] as [undefined, string]
                }
            }
            prop = [tar, key]
        }
        if (Array.isArray(prop[0]) && typeof prop[1] === 'string') prop[1] = parseInt(prop[1])
        return prop
    }

    static GetRawValue<T extends any /*PrimitiveVal*/>(config: UiObjectConfig<T>): T | undefined {
        const [tar, key] = this.GetBinding(config)
        if (!tar) return undefined
        const res = tar[key]
        return res as T | undefined
    }

    /**
     * Get the value from config
     * @param config
     * @param val - existing value, new value can be copied to this if not equal.
     * @param copyOnEqual - whether the value should be copied to val if equal. Default is true.
     * @returns The value from the binding, cloned or copied if possible. If the value is equal and copyOnEqual is false, then undefined is returned. this can be used to check if the value is changed
     */
    static GetValue<T extends PrimitiveVal>(config: UiObjectConfig<T>, val: T | undefined, copyOnEqual = true): T | undefined {
        const [tar, key] = this.GetBinding(config)
        if (!tar) return undefined
        const res = tar[key]
        // console.log('get', config, res)
        if (val !== undefined && res !== undefined) {
            if (equalsPrimitive(val, res) && !copyOnEqual) return undefined // returns undefined if equal
            return copyPrimitive(val, res)
        }
        return clonePrimitive(res)
    }

    static DispatchOnChangeSync(config: UiObjectConfig, props: {last?: boolean, config?: UiObjectConfig, configPath?: UiObjectConfig[], value?: any, lastValue?: any}, ...args: any[]) {
        const changeEvent: ChangeEvent = {
            type: 'change',
            last: props.last ?? true,
            config: props.config ?? config,
            configPath: [config, ...props.configPath || []],
            target: config,
            value: props.value,
            lastValue: props.lastValue,
        }
        const changeArgs: ChangeArgs = [changeEvent, ...args]
        if (typeof config.onChange === 'function') config.onChange(...changeArgs)
        else if (Array.isArray(config.onChange)) {
            config.onChange.flat().forEach((c) =>
                typeof c === 'function' && c?.(...changeArgs), // todo .call with config if not a bound function
            )
        } else if (config.onChange) {
            console.error('Invalid onChange type, must be a function or array of functions', config.onChange)
        }
        config.parentOnChange?.(...changeArgs)
    }

    static RecordUndo(com: SetValueCommand|ActionCommand, um?: JSUndoManager, undoEditingWaitTime?: number) {
        recordUndoCommand(um, com, undoCommandTypes.setValue, undoEditingWaitTime)
    }

    /**
     * Performs an action with undo/redo support.
     * @param action - a function that returns - 1. an undo function, 2. an object with undo and redo functions (and optional action)
     * @param targ - the target object to call the action on
     * @param args - the arguments to pass to the action function
     * @param config - ui config
     * @param onUndoRedo - optional callback function to be called on undo/redo of the command. Not called on first action execution, only on undo/redo.
     */
    static async PerformAction<T extends AnyFunction>(targ: any|undefined, action: T, args: Parameters<T>, config: UiObjectConfig, onUndoRedo?: (c: ActionCommand)=>void, um?: JSUndoManager, undoEditingWaitTime?: number) {
        const ac = ()=> targ === undefined ? action(...args) : action.call(targ, ...args) // if a function is returned, it is treated as undo function
        let res = await ac()
        const undo = typeof res === 'function' ? res : res?.undo?.bind(res)
        const resAction = typeof res !== 'function' ? res?.action?.bind(res) : null
        const redo = typeof res === 'function' ? ac : res?.redo?.bind(res) ?? resAction
        if (typeof resAction === 'function') {
            res = await resAction() // execute the action now. adding await just in case
        }
        if (typeof undo === 'function') {
            this.RecordUndo({
                type: 'UiConfigMethods_action',
                uid: config,
                target: targ,
                undo: undo,
                redo: redo,
                args,
                onUndoRedo,
            } as ActionCommand, um, undoEditingWaitTime)
        }
    }

    /**
     *
     * @param config
     * @param value
     * @param props - only the prop `last` need to be set, rest are optional. `lastValue` can be set if known (but it should be exactly equal to the value in the binding and not cloned).
     * @param forceOnChange
     * @param trackUndo
     */
    static async SetValue<T extends PrimitiveVal>(config: UiObjectConfig<T>, value: T, props: {last?: boolean, config?: UiObjectConfig, configPath?: UiObjectConfig[], value?: any, lastValue?: any}, forceOnChange?: boolean, trackUndo = true, dispatcher?: UiConfigRendererBase, um?: JSUndoManager, undoEditingWaitTime?: number) {
        return this.RunAtEvent(config, () => {
            const binding = this.GetBinding(config)
            const ev = setValueUndoCommand(um, binding, value, props, config, undoCommandTypes.setValue, trackUndo, undoEditingWaitTime, false, undefined)
            if(!ev.undoable && !forceOnChange) return false
            this.DispatchOnChangeSync(config, {...props, ...ev})
            return true
        }, dispatcher)
    }

    static GetLabel(config: UiObjectConfig): string {
        return (getOrCall(config.label, config) ?? this.GetBinding(config)?.[1]) + ''
    }

    static GetChildren(config: UiObjectConfig): UiObjectConfig[] {
        return (getOrCall(config.children, config) ?? []).map(v => getOrCall(v, config)).flat(2).filter(v => v) as UiObjectConfig[]
    }

    static InitUiConfig(config: UiObjectConfig) {
        if (!config) return
        if (!config.type) {
            console.warn('No type for config', config)
            config.type = 'input'
        }
        if (!config.uuid) config.uuid = uuidV4()

        if (config.property === undefined) {
            if (config.binding) config.property = config.binding
            else if (config.value === undefined) {
                if (config.getValue || config.setValue) {
                    Object.defineProperty(config, 'value', {
                        get: () => config.getValue && config.getValue(),
                        set: (v) => config.setValue && config.setValue(v),
                    })
                    config.property = [config, 'value']
                }
            } else if (config.getValue || config.setValue) {
                console.warn('getValue/setValue is ignored since value is provided', config)
            }
            if (config.property === undefined) {
                // todo warn in case of inputs
                // config.property = [config, 'value'] // done in getBinding
                // if(config.value === undefined && config.path === undefined) {
                //     console.error('No property/binding/value/path for config', config)
                //     if(config.type === 'checkbox' || config.type === 'toggle') config.value = false
                //     else if(config.type === 'number' || config.type === 'slider') config.value = 0
                //     else config.value = '' // todo maybe set null?
                //     console.warn('No property/binding/value for config, set default value', config)
                // }
            }
        }
    }

    static GetBounds(config: UiObjectConfig, unbounded = false) {
        const bounds = getOrCall(config.bounds)
        const max = (bounds?.length ?? 0) >= 2 ? bounds![1] : unbounded ? Infinity : 1
        const min = (bounds?.length ?? 0) >= 1 ? bounds![0] : unbounded ? -Infinity : 0
        const step = getOrCall(config.stepSize) || (unbounded ? 0.01 : Math.pow(10, Math.floor(Math.log10((max - min) / 100))))
        return {min, max, step}
    }

    static GetBaseProps(config: UiObjectConfig) {
        const hidden = getOrCall(config.hidden) ?? false
        const disabled = getOrCall(config.disabled) ?? false
        const readOnly = getOrCall(config.readOnly) ?? false
        return {hidden, disabled, readOnly}
    }


    // region deprecated

    /**
     * @deprecated use {@link GetBinding}
     * @param config
     * @param parent
     */
    getBinding(config: UiObjectConfig, parent = true) {
        return UiConfigMethods.GetBinding(config, parent)
    }

    /**
     * @deprecated use {@link GetRawValue}
     * @param config
     */
    getRawValue<T extends any /*PrimitiveVal*/>(config: UiObjectConfig<T>): T | undefined {
        return UiConfigMethods.GetRawValue(config)
    }

    /**
     * @deprecated use {@link GetLabel}
     * @param config
     */
    getLabel(config: UiObjectConfig): string {
        return UiConfigMethods.GetLabel(config)
    }

    /**
     * @deprecated use {@link GetChildren}
     * @param config
     */
    getChildren(config: UiObjectConfig): UiObjectConfig[] {
        return UiConfigMethods.GetChildren(config)
    }
    /**
     * @deprecated use {@link InitUiConfig}
     * @param config
     */
    initUiConfig(config: UiObjectConfig) {
        return UiConfigMethods.InitUiConfig(config)
    }

    /**
     * @deprecated use {@link GetBounds}
     * @param config
     * @param unbounded
     */
    getBounds(config: UiObjectConfig, unbounded = false) {
        return UiConfigMethods.GetBounds(config, unbounded)
    }

    /**
     * @deprecated use {@link GetBaseProps}
     * @param config
     */
    getBaseProps(config: UiObjectConfig) {
        return UiConfigMethods.GetBaseProps(config)
    }

    /**
     * @deprecated use {@link DispatchOnChangeSync}
     * @param config
     * @param props
     * @param args
     */
    dispatchOnChangeSync(config: UiObjectConfig, props: {last?: boolean, config?: UiObjectConfig, configPath?: UiObjectConfig[], value?: any, lastValue?: any}, ...args: any[]) {
        UiConfigMethods.DispatchOnChangeSync(config, props, ...args)
    }

    // endregion
}
