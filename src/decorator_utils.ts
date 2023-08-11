import {UiObjectConfig} from './types'
import {v4} from 'uuid'
import {Fof} from 'ts-browser-helpers'

export class UiConfigTypeMap {
    static Map = new Map<ObjectConstructor, any[]>()
}

function generateValueConfig(obj: any, key: string | number, label?: string, val?: any) {
    val = val ?? obj[key]
    const config = val?.uiConfig
    let result: UiObjectConfig|undefined = undefined
    if (config) {
        result = config
    } else {
        const uiType = valueToUiType(val)
        if (uiType === 'folder') {
            result = generateUiFolder(key + '', val)
        } else if (uiType)
            result = {
                type: uiType,
                label: key + '',
                property: [obj, key],
            }
    }
    label = label ?? key + ''
    if (result && !result.label) result.label = label
    return result
}

export function generateUiConfig(obj: any): UiObjectConfig[] {
    if (!obj) return []
    let type = obj.constructor || Object
    if (type === Array) type = Object

    const result: UiObjectConfig[] = []
    const types: any[] = []
    while (type && type !== Object) {
        types.push(type)
        type = Object.getPrototypeOf(type)
    }
    if (!types.length) {
        const keys = typeof obj === 'object' ? Object.keys(obj) : Array.isArray(obj) ? obj.map((_, i)=>i) : []
        for (const key of keys) {
            const val = obj[key]
            if (val === undefined || val === null) continue
            // if (Array.isArray(obj)) debugger
            const c = ()=>generateValueConfig(obj, key, key + '', val)
            if (c) result.push(c)
        }
    }
    // reversing so we get the parent first
    types.reverse().forEach(t => {
        UiConfigTypeMap.Map.get(t)?.forEach(({params, propKey, uiType}: any) => {
            let config: any
            if (!uiType) {
                config = ()=>generateValueConfig(obj, propKey)
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
                if (typeof config === 'function') {
                    const c1: Fof<any, any> = config
                    config = ()=>Object.assign(c1(), {...params, ...extraParams})
                }
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


export function valueToUiType(val: any) {
    if (val === null || val === undefined) return null
    if (Array.isArray(val)) return 'folder'
    if (typeof val === 'boolean') return 'checkbox'
    if (typeof val === 'number') return 'number'
    if (typeof val === 'string') return 'input'
    if (typeof val === 'function') return 'button'
    if (typeof val.x === 'number') return 'vec'
    if (typeof val.r === 'number') return 'color'
    if (val.isTexture) return 'image'
    if (typeof val === 'object') return 'folder'
    return null
}


