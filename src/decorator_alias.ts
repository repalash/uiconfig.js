import {UiObjectConfig} from './types'
import {TParams, uiConfig, uiContainer} from './decorators'
import {ValOrFunc} from 'ts-browser-helpers'

export function uiMonitor<T=any>(label?: string, params?: TParams<T>): PropertyDecorator {
    return uiConfig('monitor', {label, params})
}

export function uiSlider<T=any>(label?: string, bounds?: [number, number], stepSize?: number, params?: TParams<T>): PropertyDecorator {
    return uiConfig('slider', {label, bounds, stepSize, params})
}

export function uiVector<T=any>(label?: string, bounds?: [number, number], stepSize?: number, params?: TParams<T>): PropertyDecorator {
    return uiConfig('vec', {label, bounds, stepSize, params})
}

export function uiDropdown<T=any>(label?: string, children?: string[] | ValOrFunc<UiObjectConfig[]>, params?: TParams<T>): PropertyDecorator {
    if (Array.isArray(children) && typeof children[0] === 'string')
        children = (children as string[]).map((c) => ({label: c, value: c}))
    return uiConfig('dropdown', {label, children: children as UiObjectConfig[], params})
}

export function uiButton<T=any>(label?: string, params?: TParams<T>): PropertyDecorator {
    return uiConfig('button', {label, params})
}

export function uiInput<T=any>(label?: string, params?: TParams<T>): PropertyDecorator {
    return uiConfig('input', {label, params})
}

export function uiNumber<T=any>(label?: string, params?: TParams<T>): PropertyDecorator {
    return uiConfig('number', {label, params})
}

export function uiColor<T=any>(label?: string, params?: TParams<T>): PropertyDecorator {
    return uiConfig('color', {label, params})
}

export function uiImage<T=any>(label?: string, params?: TParams<T>): PropertyDecorator {
    return uiConfig('image', {label, params})
}

export function uiToggle<T=any>(label?: string, params?: TParams<T>): PropertyDecorator {
    return uiConfig('checkbox', {label, params})
}

export function uiPanelContainer<TP = any>(label: ValOrFunc<string, [TP]>, params?: any) {
    return uiContainer(label, params, 'panel')
}

export function uiFolderContainer<TP = any>(label: ValOrFunc<string, [TP]>, params?: any) {
    return uiContainer(label, params, 'folder')
}

