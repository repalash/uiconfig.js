// Component gallery: a table of the component types and a panel that shows each of them,
// rendered by Tweakpane or (on request) by Blueprint.
import type {UiConfigRenderer, UiObjectConfig} from 'uiconfig.js'
import {createRenderer, type RendererName} from '../renderers'
import {createGalleryConfig, createGalleryState} from './gallery-config.js'
import {showPanelError} from './panel-error'
import {setupRendererSwitch} from './renderer-switch'

export function setupGallery() {
    const state = createGalleryState()
    const hosts: Record<RendererName, HTMLElement> = {
        tweakpane: document.getElementById('gallery-tweakpane')!,
        blueprint: document.getElementById('gallery-blueprint')!,
    }
    const renderers: Partial<Record<RendererName, Promise<UiConfigRenderer>>> = {}
    const configs: Record<RendererName, UiObjectConfig> = {
        tweakpane: createGalleryConfig(state, 'tweakpane') as UiObjectConfig,
        blueprint: createGalleryConfig(state, 'blueprint') as UiObjectConfig,
    }

    const show = (name: RendererName) => {
        for (const [n, host] of Object.entries(hosts)) host.hidden = n !== name
        // the values can have changed in the other panel
        if (renderers[name]) return configs[name].uiRefresh?.(true)
        renderers[name] = createRenderer(name, hosts[name])
        renderers[name]
            .then(ui => ui.appendChild(configs[name]))
            .catch(e => showPanelError(hosts[name], `The ${name} panel did not load`, e))
    }
    setupRendererSwitch(document.getElementById('gallery-switch')!, show)
    show('tweakpane')
}
