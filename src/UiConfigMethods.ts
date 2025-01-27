import {ChangeArgs, ChangeEvent, UiObjectConfig} from './types'
import {Fof, getOrCall, safeSetProperty, uuidV4} from 'ts-browser-helpers'
import {UiConfigRendererBase} from './UiConfigRendererBase'
import {ActionCommand, SetValueCommand} from './undo_commands'
import {clonePrimitive, copyPrimitive, equalsPrimitive, PrimitiveVal} from './primitive_value'

export class UiConfigMethods {
    constructor(protected _renderer: UiConfigRendererBase) {
    }

    getBinding(config: UiObjectConfig, parent = true) {
        let prop = getOrCall(config.property, config)
        const path = getOrCall(config.path, config)
        if (prop === undefined && Object.hasOwn(config, 'value')) {
            prop = [config, 'value']
        }
        if (prop === undefined && parent) {
            prop = getOrCall(config.parentProperty, config)
        }
        if (!prop || typeof prop[0] !== 'object' || !prop[1]) {
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

    getRawValue<T extends any /*PrimitiveVal*/>(config: UiObjectConfig<T>): T | undefined {
        const [tar, key] = this.getBinding(config)
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
    getValue<T extends PrimitiveVal>(config: UiObjectConfig<T>, val: T | undefined, copyOnEqual = true): T | undefined {
        const [tar, key] = this.getBinding(config)
        if (!tar) return undefined
        const res = tar[key]
        // console.log('get', config, res)
        if (val !== undefined && res !== undefined) {
            if (equalsPrimitive(val, res) && !copyOnEqual) return undefined // returns undefined if equal
            return copyPrimitive(val, res)
        }
        return clonePrimitive(res)
    }

    dispatchOnChangeSync(config: UiObjectConfig, props: {last?: boolean, config?: UiObjectConfig, configPath?: UiObjectConfig[], value?: any, lastValue?: any}, ...args: any[]) {
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

    undoEditingWaitTime = 2000
    recordUndo(com: SetValueCommand|ActionCommand) {
        const um = this._renderer.undoManager
        if (!um || !um.enabled) return
        const c = com as SetValueCommand
        if (c.type !== 'UiConfigMethods_set') return um.record(com)

        const lastCommand = um.peek()
        let sameType = !!lastCommand && (lastCommand as SetValueCommand).type === 'UiConfigMethods_set' && (lastCommand as SetValueCommand).config === c.config
        if (sameType) {
            const cLast = lastCommand as SetValueCommand
            if (!cLast.final && (c.time - cLast.time) < this.undoEditingWaitTime) {
                // replace cLast with c using lastVal from cLast
                c.lastVal = cLast.lastVal
                c.val = clonePrimitive(c.val)
                um.replaceLast(c)
            } else {
                sameType = false
            }
        }
        if (!sameType) {
            if (!equalsPrimitive(c.lastVal, c.val)) {
                c.val = clonePrimitive(c.val)
                um.record(c)
            }
        }
    }

    /**
     *
     * @param config
     * @param value
     * @param props - only the prop `last` need to be set, rest are optional. `lastValue` can be set if known (but it should be exactly equal to the value in the binding and not cloned). `config`, `configPath` are for parentOnChange, no need to set that.
     * @param forceOnChange
     * @param trackUndo
     */
    async setValue<T extends PrimitiveVal>(config: UiObjectConfig<T>, value: T, props: {last?: boolean, config?: UiObjectConfig, configPath?: UiObjectConfig[], lastValue?: T}, forceOnChange?: boolean, trackUndo = true) {
        return this.runAtEvent(config, () => {
            const [tar, key] = this.getBinding(config)
            const lastValueRaw = props.lastValue ?? tar?.[key] as T
            let failed = false
            const final = props.last ?? true

            const same = equalsPrimitive(lastValueRaw, value)
            const lastValue = clonePrimitive(lastValueRaw)
            if (same) failed = !final
            else if (tar) {
                const a = copyPrimitive(lastValueRaw, value)
                if (a !== lastValueRaw) failed = !safeSetProperty(tar, key, value, true, true)
                else failed = false
            } else failed = true

            // console.log('set', config, value, lastValue, failed, same, final)
            if (failed) {
                if (!forceOnChange) return false
            }

            if (trackUndo && !failed && (final || !same)) {
                this.recordUndo({
                    type: 'UiConfigMethods_set',
                    config,
                    lastVal: lastValue,
                    val: value,
                    final,
                    props,
                    time: Date.now(),
                })
            }
            this.dispatchOnChangeSync(config, {...props, last: final, value, lastValue: lastValue})
            return true
        })
    }

    /**
     *
     * @param config
     * @param props - only last needs to be set. check the docs for `setValue`
     */
    async dispatchOnChange<T>(config: UiObjectConfig<T>, props: {last?: boolean, config?: UiObjectConfig, configPath?: UiObjectConfig[], value?: any, lastValue?: any}) {
        return this.runAtEvent(config, () => {
            this.dispatchOnChangeSync(config, props)
        })
    }

    getLabel(config: UiObjectConfig): string {
        return (getOrCall(config.label, config) ?? this.getBinding(config)?.[1]) + ''
    }

    getChildren(config: UiObjectConfig): UiObjectConfig[] {
        return (getOrCall(config.children, config) ?? []).map(v => getOrCall(v)).flat(2).filter(v => v) as UiObjectConfig[]
    }

    async clickButton(config: UiObjectConfig, options?: {args: any[]}) {
        return this.runAtEvent(config, async() => {
            // const args: any[] = []
            // const prmpt = getOrCall(config.prompt)
            // if (prmpt) args.push(await this._renderer.prompt(...prmpt))

            const binding = this.getBinding(config, false)
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
                let res = await action.call(targ, ...args) // if a function is returned, it is treated as undo function
                const undo = typeof res === 'function' ? res : res?.undo?.bind(res)
                const resAction = typeof res !== 'function' ? res?.action?.bind(res) : null
                const redo = typeof res === 'function' ? action : res?.redo?.bind(res) ?? resAction
                if (typeof resAction === 'function') {
                    res = await resAction() // execute the action now. adding await just in case
                }
                if (typeof undo === 'function') {
                    this.recordUndo({
                        type: 'UiConfigMethods_action',
                        config,
                        target: targ,
                        undo: undo,
                        redo: redo,
                        args,
                    } as ActionCommand)
                }
            }

            await this.dispatchOnChange(config, {})
            // this.dispatchOnChangeSync(config, {})
        })
    }

    async runAtEvent<T>(config: UiObjectConfig, run: () => T | Promise<T>) {
        const dispatchMode = getOrCall(config.dispatchMode, config) ?? 'postFrame'
        if (dispatchMode === 'immediate') return run()
        return new Promise<T>((resolve) => {
            const listener = async() => { // make sure it is only called post frame
                this._renderer.removeEventListener(dispatchMode, listener)
                resolve(await run())
            }
            this._renderer.addEventListener(dispatchMode, listener)
        })
    }

    initUiConfig(config: UiObjectConfig) {
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

    getBounds(config: UiObjectConfig, unbounded = false) {
        const bounds = getOrCall(config.bounds)
        const max = (bounds?.length ?? 0) >= 2 ? bounds![1] : unbounded ? Infinity : 1
        const min = (bounds?.length ?? 0) >= 1 ? bounds![0] : unbounded ? -Infinity : 0
        const step = getOrCall(config.stepSize) || (unbounded ? 0.01 : Math.pow(10, Math.floor(Math.log10((max - min) / 100))))
        return {min, max, step}
    }

    undoPresets = {
        ['UiConfigMethods_set']: (c: SetValueCommand)=>{
            const ref = ()=>c.config.uiRefresh?.(false)
            return {
                undo: ()=>{
                    // console.log('undo', c.lastVal)
                    this.setValue(c.config, c.lastVal, c.props, undefined, false).then(ref)
                },
                redo: ()=>{
                    // console.log('redo', c.val)
                    this.setValue(c.config, c.val, c.props, undefined, false).then(ref)
                },
            }
        },
        ['UiConfigMethods_action']: (c: ActionCommand)=>{
            const ref = ()=>c.config.uiRefresh?.(false)
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
}
