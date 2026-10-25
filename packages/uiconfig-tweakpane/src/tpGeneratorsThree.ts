import {FolderApi} from 'tweakpane'
import {UiObjectConfig} from 'uiconfig.js'
import {getOrCall} from 'ts-browser-helpers'
import {UiConfigRendererTweakpane} from './UiConfigRendererTweakpane'
// eslint-disable-next-line @typescript-eslint/naming-convention
import type * as THREE_1 from 'three'
import {tpInputGenerator} from './tpGenerators'

export type THREE = Pick<typeof THREE_1, 'Color' | 'Vector2' | 'Vector3' | 'Vector4'>

export const tpColorInputGenerator = (parent: FolderApi, config: UiObjectConfig, renderer: UiConfigRendererTweakpane, params?: any) => {
    if (!renderer.THREE) {
        console.error('tpColorInputGenerator requires THREE to be set in the renderer')
        return
    }
    if (!config.__proxy) {
        config.__proxy = {
            forceOnChange: false,
        }
        const uiColorSpace = 'srgb'
        const tempColor = new renderer.THREE.Color()
        Object.defineProperty(config.__proxy, 'value', {
            get: () => {
                // config.__proxy.value_ = renderer.methods.getValue(config) // this is done below so it will be triggered on ui refresh
                const cc: any = config.__proxy.value_
                if (cc)
                    return tempColor.set(cc).getHex(uiColorSpace)
                return 0
            },
            set: (v: number) => {
                config.__proxy.value_ = renderer.methods.getValue(config, config.__proxy.value_ || undefined)
                const cc: any = config.__proxy.value_
                const tempC = tempColor.setHex(v, uiColorSpace)
                if (cc?.isColor) {
                    (cc as THREE_1.Color).copy(tempC)
                } else if (typeof cc === 'number') config.__proxy.value_ = tempC.getHex()
                else if (typeof cc === 'string') config.__proxy.value_ = '#' + tempC.getHexString()
            },
        })
    }
    config.__proxy.value_ = renderer.methods.getValue(config, config.__proxy.value_ || undefined)
    // console.log(config.__proxy.value_)
    params = params ?? {}
    params.view = 'color'
    if (getOrCall(config.inlinePicker))
        params.picker = 'inline'
    return tpInputGenerator(parent, config, renderer, params)
}

