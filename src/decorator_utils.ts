import {UiObjectConfig} from './types'
import {v4} from 'uuid'

export class UiConfigTypeMap {
    static Map = new Map<ObjectConstructor, any[]>()
}

export function generateUiConfig(obj: any): UiObjectConfig[] {
    let type = obj?.constructor
    if (!obj || !type) return []

    const result: UiObjectConfig[] = []
    const types: any[] = []
    while (type && type !== Object) {
        types.push(type)
        type = Object.getPrototypeOf(type)
    }
    // reversing so we get the parent first
    types.reverse().forEach(t => {
        UiConfigTypeMap.Map.get(t)?.forEach(({params, propKey, uiType}: any) => {
            let config: any
            if (!uiType) {
                config = obj[propKey]?.uiConfig
            }
            if (!config) {
                config = {
                    property: [obj, propKey],
                    type: uiType || 'input',
                    // ...params,
                    // ...extraParams,
                } as UiObjectConfig
            }
            if (params) {
                const extraParams = typeof params.params === 'function' ? params.params(obj) : params.params || {}
                delete params.params
                Object.assign(config, {...params, ...extraParams})
            }
            result.push(config)

            // if (typeof obj.setDirty === 'function') {
            //     const changer = ()=>obj.setDirty()
            //     if (!obj.onChange) obj.onChange = changer
            //     else {
            //         const oldOnChange = obj.onChange
            //         Array.isArray(oldOnChange) ? oldOnChange.push(changer) : obj.onChange = [...oldOnChange, changer]
            //     }
            // }

        })
    })
    return result
}

export function generateUiFolder(label: string, obj: any, params: any = {}, type = 'folder'): UiObjectConfig {
    return {
        type, label,
        children: generateUiConfig(obj),
        uuid: v4(),
        ...params,
    }
}

