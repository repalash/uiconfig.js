// Creates the renderers for the panels on the page.
// Tweakpane is small and loads with the page; Blueprint (React, about 1 MB compressed with its styles)
// loads the first time a section needs it.
import {UI as TweakpaneUI} from 'uiconfig-tweakpane'
import type {UiConfigRenderer} from 'uiconfig.js'
import {Color, Vector2, Vector3, Vector4} from 'three'

export type RendererName = 'tweakpane' | 'blueprint'

// The color and vector components of both renderers create their values with these classes.
// They accept '#rrggbb' strings, numbers and plain {x, y, z} objects as well.
const THREE = {Color, Vector2, Vector3, Vector4}

export const prefersDark = () => matchMedia('(prefers-color-scheme: dark)').matches

export function createTweakpane(host: HTMLElement): UiConfigRenderer {
    // no undo manager: it binds Ctrl+Z on the whole document, which belongs to the editors on this page
    const ui = new TweakpaneUI(host, {expanded: true}, false)
    ui.THREE = THREE
    return ui
}

let blueprintModule: Promise<typeof import('uiconfig-blueprint')> | undefined
export const loadBlueprint = () => blueprintModule ??= import('uiconfig-blueprint')

export async function createBlueprint(host: HTMLElement): Promise<UiConfigRenderer> {
    const {UI} = await loadBlueprint()
    // The Blueprint panel reads its light or dark mode from localStorage when it mounts;
    // match it to the page.
    localStorage.setItem('bpUiDarkMode', prefersDark() ? 'true' : 'false')
    host.replaceChildren() // the loading message
    const ui = new UI(host, {}, false)
    ui.THREE = THREE
    return ui
}

export function createRenderer(name: RendererName, host: HTMLElement): Promise<UiConfigRenderer> {
    return name === 'blueprint' ? createBlueprint(host) : Promise.resolve(createTweakpane(host))
}

/** Calls `fn` after the window load event, so that large optional chunks do not delay the page. */
export function afterLoad(fn: () => void) {
    if (document.readyState === 'complete') fn()
    else addEventListener('load', () => fn(), {once: true})
}

/** Calls `load` once, when `el` comes within `margin` of the viewport. */
export function whenNear(el: Element, load: () => void, margin = '600px') {
    const io = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) {
            io.disconnect()
            load()
        }
    }, {rootMargin: margin})
    io.observe(el)
}
