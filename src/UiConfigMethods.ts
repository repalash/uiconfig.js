import {ChangeArgs, UiObjectConfig} from './types'
import {Fof, getOrCall, safeSetProperty} from 'ts-browser-helpers'
import {UiConfigRendererBase} from './UiConfigRendererBase'
import {v4} from 'uuid'

export class UiConfigMethods {
    constructor(protected _renderer: UiConfigRendererBase) {
    }

    getBinding(config: UiObjectConfig) {
        const prop = getOrCall(config.property)
        if (!prop || typeof prop[0] !== 'object' || !prop[1]) {
            // console.warn('cannot determine property', config)
            return [undefined, ''] as [undefined, string]
        }
        return prop
    }

    getValue<T>(config: UiObjectConfig<T>): T | undefined {
        const [tar, key] = this.getBinding(config)
        return tar ? tar[key] : undefined
    }

    dispatchOnChange(config: UiObjectConfig, props: {last?: boolean}) {
        const changeEvent = {
            // todo; change event
            last: props.last ?? true,
        }
        const changeArgs: ChangeArgs = [changeEvent]
        ;[config.onChange].flat().forEach((c) =>
            typeof c === 'function' && c?.(...changeArgs),
        )
        // console.log(value, changeEvent.last)
        // if (typeof tar?.setDirty === 'function') tar.setDirty(changeEvent)
        // todo: dispatch global change event? for setDirty etc
    }

    async setValue<T>(config: UiObjectConfig<T>, value: T, props: {last?: boolean}) {
        return this.runAtEvent(config, () => {
            const [tar, key] = this.getBinding(config)
            if (!tar || value === tar[key] || !safeSetProperty(tar, key, value, true, true)) {
                return false
            }
            this.dispatchOnChange(config, props)
            return true
        })
    }

    getLabel(config: UiObjectConfig) {
        return getOrCall(config.label) ?? this.getBinding(config)[1]
    }

    getChildren(config: UiObjectConfig) {
        return (config.children ?? []).map(v => getOrCall(v)).flat(2).filter(v => v) as UiObjectConfig[]
    }

    async clickButton(config: UiObjectConfig, options?: {args: any[]}) {
        return this.runAtEvent(config, async() => {
            // const args: any[] = []
            // const prmpt = getOrCall(config.prompt)
            // if (prmpt) args.push(await this._renderer.prompt(...prmpt))

            const binding = this.getBinding(config)
            const tar = binding[0] ?? config
            const key = binding[1] || 'onClick'
            const action = tar[key] as Fof<any>
            if (typeof action === 'function') {
                action.call(tar, ...options?.args ?? [])
            } else if (action) {
                console.warn('Invalid action type for button', action)
            }
            this.dispatchOnChange(config, {})
        })
    }

    async runAtEvent<T>(config: UiObjectConfig, run: () => T | Promise<T>) {
        const dispatchMode = getOrCall(config.dispatchMode) ?? 'postFrame'
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
        if (!config.uuid) config.uuid = v4()

        if (config.property === undefined) {
            if (config.binding) config.property = config.binding
            else if (config.value === undefined) {
                if (config.getValue || config.setValue) {
                    Object.defineProperty(config, 'value', {
                        get: () => config.getValue?.(),
                        set: (v) => config.setValue?.(v),
                    })
                }
            }
            if (config.property === undefined && config.value !== undefined) {
                config.property = [config, 'value']
            }
        }
    }
}
