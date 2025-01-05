import {UiObjectConfig} from './types'
import {Fof, uuidV4} from 'ts-browser-helpers'

export class UiConfigTypeMap {
    static Map = new Map<ObjectConstructor, any[]>()
}

export function generateValueConfig(obj: any, key: string | number, label?: string, val?: any) {
    val = val ?? obj[key]
    const config = val?.uiConfig
    let result: UiObjectConfig|undefined = undefined
    if (config) {
        result = config
    } else {
        const uiType = valueToUiType(val)
        if (uiType === 'folder') {
            result = generateUiFolder(key + '', val, {}, 'folder', true)
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

export function generateUiConfig(obj: any): Required<UiObjectConfig>['children'] {
    if (!obj) return []
    let type = obj.constructor || Object
    if (type === Array) type = Object

    const result: UiObjectConfig['children'] = []
    const types: any[] = []
    while (type && type !== Object) {
        types.push(type)
        type = Object.getPrototypeOf(type)
    }
    if (!types.length || Array.isArray(obj)) {
        const keys = typeof obj === 'object' ? Object.keys(obj) : Array.isArray(obj) ? obj.map((_, i)=>i) : []
        for (const key of keys) {
            const val = obj[key]
            if (val === undefined || val === null) continue
            // if (Array.isArray(obj)) debugger
            // todo: make only the children of folder inside the value config dynamic instead of the whole thing? as in webgi
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
                const params1 = {...params}
                delete params1.params
                if (typeof config === 'function') {
                    const c1: Fof<any, any> = config
                    config = ()=>Object.assign(c1(), {...params1, ...extraParams})
                }
                Object.assign(config, {...params1, ...extraParams})
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

export function generateUiFolder(label: string, obj: any, params: any = {}, type = 'folder', dynamic = false): UiObjectConfig {
    return {
        type, label,
        children: !dynamic ? generateUiConfig(obj) : ()=> generateUiConfig(obj),
        uuid: uuidV4(),
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


