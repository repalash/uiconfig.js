import type {ValOrFunc} from 'ts-browser-helpers'
import {getOrCall} from 'ts-browser-helpers'
import {UiObjectConfig} from './types'
import {generateUiFolder, UiConfigTypeMap} from './decorator_utils'


export type TParams<T> = ValOrFunc<Partial<UiObjectConfig>, [T]>

/**
 * Decorator for uiConfig
 * @param action - function that will be called with the targetPrototype, propertyKey and uiConfigs, and should modify the uiConfigs
 */
export function uiConfigDecorator(action: (targetPrototype: any, propertyKey: string|symbol, uiConfigs: any[])=>void): PropertyDecorator {
    return (targetPrototype: any, propertyKey: string | symbol) => {
        const type = targetPrototype.constructor
        if (type === Object) throw new Error('Not possible to use uiConfig decorator on an object, use class instead')
        if (!UiConfigTypeMap.Map.has(type)) UiConfigTypeMap.Map.set(type, [])
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        action(targetPrototype, propertyKey, UiConfigTypeMap.Map.get(type)!)
    }
}

// for properties
export function uiConfig<T=any>(uiType?: string, params?: Partial<UiObjectConfig> & {params?: TParams<T>, group?: string}): PropertyDecorator {
    return uiConfigDecorator((_, propertyKey, uiConfigs) => {
        const index = uiConfigs.findIndex(item => item.propKey === propertyKey)
        if (index && index < 0)
            uiConfigs.push({
                params: params || {},
                propKey: propertyKey as string,
                uiType,
            })
        else {
            throw new Error(`Property ${propertyKey as string} already has a uiConfig decorator`)
        }
    })
}

// for classes
export function uiContainer<TP = any>(label: ValOrFunc<string, [TP]>, params?: any, type = 'panel') {
    return <T extends new (...args: any[]) => any>(constructor: T) => {
        return class extends constructor {
            uiConfig = generateUiFolder(getOrCall(label, this) || '', this, params || {}, type)
        }
    }
}
