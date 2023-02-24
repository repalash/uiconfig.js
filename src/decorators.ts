import {ValOrFunc} from 'ts-browser-helpers'
import {UiObjectConfig} from './types'
import {generateUiFolder, UiConfigTypeMap} from './decorator_utils'


export type TParams = ValOrFunc<Partial<UiObjectConfig>, [Partial<UiObjectConfig>]>

// for properties
export function uiConfig(uiType?: string, params?: Partial<UiObjectConfig> & {params?: TParams}): PropertyDecorator {
    return (targetPrototype: any, propertyKey: string | symbol) => {
        const type = targetPrototype.constructor
        if (type === Object) throw new Error('All properties in an object are serialized by default')
        if (!UiConfigTypeMap.Map.has(type)) UiConfigTypeMap.Map.set(type, [])

        const arr = UiConfigTypeMap.Map.get(type)
        const index = arr?.findIndex(item => item.propKey === propertyKey)
        if (arr && index && index < 0)
            arr.push({
                params: params || {},
                propKey: propertyKey as string,
                uiType,
            })
        else {
            throw new Error(`Property ${propertyKey as string} already has a uiConfig decorator`)
        }
    }

}

// for classes
export function uiContainer(label: string, params?: any, type = 'panel') {
    return <T extends new (...args: any[]) => any>(constructor: T) => {
        return class extends constructor {
            uiConfig = generateUiFolder(label, this, params || {}, type)
        }
    }
}
