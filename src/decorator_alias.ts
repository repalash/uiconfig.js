import {UiObjectConfig} from './types'
import {TParams, uiConfig, uiContainer} from './decorators'

export function uiMonitor(label?: string, params?: TParams): PropertyDecorator {
    return uiConfig('monitor', {label, params})
}

export function uiSlider(label?: string, bounds?: [number, number], stepSize?: number, params?: TParams): PropertyDecorator {
    return uiConfig('slider', {label, bounds, stepSize, params})
}

export function uiVector(label?: string, bounds?: [number, number], stepSize?: number, params?: TParams): PropertyDecorator {
    return uiConfig('vec', {label, bounds, stepSize, params})
}

export function uiDropdown(label?: string, children?: UiObjectConfig[], params?: TParams): PropertyDecorator {
    return uiConfig('dropdown', {label, children, params})
}

export function uiButton(label?: string, params?: TParams): PropertyDecorator {
    return uiConfig('button', {label, params})
}

export function uiInput(label?: string, params?: TParams): PropertyDecorator {
    return uiConfig('input', {label, params})
}

export function uiNumber(label?: string, params?: TParams): PropertyDecorator {
    return uiConfig('number', {label, params})
}

export function uiColor(label?: string, params?: TParams): PropertyDecorator {
    return uiConfig('color', {label, params})
}

export function uiImage(label?: string, params?: TParams): PropertyDecorator {
    return uiConfig('image', {label, params})
}

export function uiToggle(label?: string, params?: TParams): PropertyDecorator {
    return uiConfig('checkbox', {label, params})
}

export function uiPanelContainer(label: string, params?: any) {
    return uiContainer(label, params, 'panel')
}

export function uiFolderContainer(label: string, params?: any) {
    return uiContainer(label, params, 'folder')
}

