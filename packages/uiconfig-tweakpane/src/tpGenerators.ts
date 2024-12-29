import {BladeApi, ButtonApi, FolderApi, InputBindingApi, MonitorBindingApi} from 'tweakpane'
import {BladeController, TextView, View} from '@tweakpane/core'
import {tweakPaneMoveToParentIndex} from './tpUtils'
import {ChangeEvent, UiObjectConfig} from 'uiconfig.js'
import {getOrCall, objectHasOwn, safeSetProperty} from 'ts-browser-helpers'
import {UiConfigRendererTweakpane} from './UiConfigRendererTweakpane'

export const tpFolderGenerator = (parent: FolderApi, config: UiObjectConfig, plugin: UiConfigRendererTweakpane, _?: any) => {
    let folder = config.uiRef as FolderApi | undefined
    if (folder?.controller_.viewProps.get('disposed')) folder = undefined
    const lastExpanded = folder?.expanded
    if (!folder) {
        const folder1 = parent.addFolder({
            title: '',
        })
        folder = folder1
        folder.on('fold', _2 => {
            let expanded = folder1.expanded
            safeSetProperty(config, 'expanded', expanded, true)
            expanded = getOrCall(config.expanded) ?? expanded
            if (expanded !== folder1.expanded) folder1.expanded = expanded
            config.uiRefresh?.(expanded, 'postFrame')
            if (expanded) {
                config.onExpand?.(config)
            }
        })
    }

    if (!folder) return folder
    folder.expanded = getOrCall(config.expanded) ?? lastExpanded ?? false // todo;;

    const childObjects = plugin.methods.getChildren(config)
    // console.log(childObjects)
    // if (childObjects) {
    // const children = childObjects?.map(value => value.uiRef) as BladeApi<BladeController<View>>[]
    let i = 0
    for (const child of childObjects) { // todo check comparison with uiConfig.uuid
        child.parentOnChange = (ev: ChangeEvent, ...args) => { // there will be an issue if this child is then added to the root pane in tweakpane
            plugin.methods.dispatchOnChangeSync(config, {...ev}, ...args)
        }
        if (child.property === undefined &&
            child.value === undefined &&
            child.getValue === undefined &&
            child.setValue === undefined &&
            child.type !== 'button' &&
            (config.property !== undefined || config.value !== undefined)
        ) child.property = config.property !== undefined ? config.property : [config, 'value']

        let ui = child.uiRef as BladeApi<BladeController<View>> | undefined
        if (ui) {
            // check if all correct or set child.uiRef to undefined.

            // if (!tweakpaneCheckParent(ui, folder)) { // different parent
            // }
            if (ui.controller_.viewProps.get('disposed')) {
                plugin.disposeUiConfig(child, false)
            }
        }

        ui = child.uiRef
        if (!ui) {
            plugin.renderUiObject(child, folder)
            ui = child.uiRef
        } else {
            // this._refreshUiObject({uiConfig: child}, folder) // this is done in add, see flattenUiConfig
        }

        if (ui) {
            const moved = tweakPaneMoveToParentIndex(ui, folder, i++)
            if (moved) {
                // child.uiRefresh?.('postFrame', false)
                // plugin._refreshUiObject({uiConfig: child}, folder)
                plugin.renderUiObject(child, folder) // its the same as refresh
            }
        }
    }
    let ch = folder.children
    while (ch.length > i) {
        const rm = ch[ch.length - 1]
        folder.remove(rm) // todo; remove listeners etc
        ch = folder.children
        const child = (rm as any).srcUiConfig as UiObjectConfig
        if (child) {
            child.parentOnChange = undefined
            if (Array.isArray(child.property) &&
                (child.property === config.property ||
                    child.property[0] === config &&
                        child.property[1] === 'value'
                )
            ) delete child.property
            // todo: remove uiRef here?
        }
        // todo: do we need to do disposeUiConfig?
    }

    folder.controller_.props.set('title', plugin.methods.getLabel(config))

    const container = folder.controller_.view.containerElement
    const domChildren = getOrCall(config.domChildren, [])
    if (domChildren?.length !== undefined) {
        const x: any = []
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let j = 0; j < container.children.length; j++) {
            const child: any = container.children[j]
            if (!child.dataset?.tpCustomDOM) continue
            x.push(child)
        }
        for (const child of x) {
            container.removeChild(child)
        }
        for (const domChild of domChildren) {
            if (domChild.parentElement !== container) {
                container.appendChild(domChild)
                domChild.dataset.tpCustomDOM = 'true'
            }
            // check ordering maybe?
        }
        folder.controller_.foldable.cleanUpTransition()
    }

    return folder
}

export const tpButtonInputGenerator = (parent: FolderApi, config: UiObjectConfig, plugin: UiConfigRendererTweakpane, _?: any) => {
    let input = config.uiRef as ButtonApi | undefined
    if (input?.controller_.viewProps.get('disposed')) input = undefined
    if (!input) {
        // Create button in parent and bind click to property
        input = parent.addButton({title: ''})
        input.on('click', async() => plugin.methods.clickButton(config))
    }
    if (input) {
        input.title = plugin.methods.getLabel(config) || 'click me'
    }
    return input
}

export const tpDropdownInputGenerator = (parent: FolderApi, config: UiObjectConfig, plugin: UiConfigRendererTweakpane, params?: any) => {
    const children = plugin.methods.getChildren(config)
    const options = Object.fromEntries(children.map(value => {
        const label = plugin.methods.getLabel(value)
        return [label, value!.value ?? label]
    }))
    const i = tpInputGenerator(parent, config, plugin, {options, ...params ?? {}})
    return i
}

export const tpSliderInputGenerator = (parent: FolderApi, config: UiObjectConfig, plugin: UiConfigRendererTweakpane, params?: any) => {
    const bounds = getOrCall(config.bounds)
    const max = (bounds?.length ?? 0) >= 2 ? bounds![1] : 1
    const min = (bounds?.length ?? 0) >= 1 ? bounds![0] : 0
    const step = getOrCall(config.stepSize) || undefined
    return tpInputGenerator(parent, config, plugin, {min, max, step, ...params ?? {}})
}

export const tpInputGenerator = (parent: FolderApi, config: UiObjectConfig, renderer: UiConfigRendererTweakpane, params?: any) => {
    params = params ?? {}
    const inputParams = {
        label: renderer.methods.getLabel(config),
        ...params,
    }

    let input = config.uiRef as InputBindingApi<any, any> | MonitorBindingApi<any> | undefined
    if (input?.controller_.viewProps.get('disposed')) input = undefined

    let proxy = config.__proxy
    if (!proxy) proxy = config.__proxy = {} // see tpColorInputGenerator
    if (!objectHasOwn(proxy, 'value_')) {
        const n = renderer.methods.getValue(config, proxy.value || undefined)
        proxy.value = n
    }
    if (!input) {
        // Create input in parent and bind to property
        try {
            if (!inputParams.view && getOrCall(config.readOnly)) {
                const [tar, key] = renderer.methods.getBinding(config)
                input = tar ? parent.addMonitor(tar, key, inputParams) : undefined
            } else {
                input = parent.addInput(proxy, 'value', inputParams).on('change', ev => {
                    if (proxy.listedOnChange === false) return // used in tpImageInputGenerator
                    // console.log(ev.last ?? true)
                    config.dispatchMode = "immediate" // this is required so that the value is set before the next uiRefresh.
                    renderer.methods.setValue(config, proxy.value_ ?? proxy.value, {last: ev.last ?? true}, proxy.forceOnChange || false)
                })
            }
        } catch (e: any) {
            if (e.message.startsWith('No matching controller for')) input = undefined
            else throw e
        }
    }

    if (input) {
        for (const [key, val] of Object.entries(inputParams)) {
            const cont = input.controller_
            const oVal = cont.props.value(key as any)
            if (oVal !== undefined) {
                if (oVal.rawValue !== val) input.controller_.props.set(key as any, val)
            } else {
                // todo: update??
                // const vCont: any = cont.valueController
                // oVal = vCont.props?.value?.(key as any)
                // if (oVal !== undefined && oVal.rawValue !== val) {
                //     console.log(key, val, oVal)
                //     vCont.props.set(key as any, val)
                // }
            }
        }
        // update min max value of slider manually because it has a separate controller.
        if (config.type === 'slider') {
            if (inputParams.min !== undefined) (input as any).controller_.valueController.sliderController.props.set(
                'minValue',
                inputParams.min,
            )
            if (inputParams.max !== undefined) (input as any).controller_.valueController.sliderController.props.set(
                'maxValue',
                inputParams.max,
            )
        }

        // placeholder for text input
        (input?.controller_.valueController.view as TextView<any>).inputElement?.setAttribute('placeholder', getOrCall(config.placeholder) ?? '')

        input.refresh()
    }
    // console.log('refresh', input)
    // console.log(ev)
    return input
}

export const tpVecInputGenerator = (parent: FolderApi, config: UiObjectConfig, renderer: UiConfigRendererTweakpane, params?: any) => {
    if (!config.__proxy) config.__proxy = {}
    config.__proxy.forceOnChange = false

    // todo handle array type of values instead of {x,y,z,w}

    const bounds = getOrCall(config.bounds)
    if (!bounds || bounds.length < 1)
        return tpInputGenerator(parent, config, renderer, {...params ?? {}})

    // todo: bounds are not working properly
    const max = (bounds.length ?? 0) >= 2 ? bounds[1] : 1
    const min = (bounds.length ?? 0) >= 1 ? bounds[0] : 0
    const step = config.stepSize ?? (max - min) / 100
    const p = {min, max, step}
    const pp: any = {x: p, y: p}
    if (config.type === 'vec3' || config.type === 'vec4') pp.z = p
    if (config.type === 'vec4') pp.w = p
    return tpInputGenerator(parent, config, renderer, {...pp, ...params ?? {}})
}
