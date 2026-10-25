// Creates the renderers for the panels on the page.
// Tweakpane is small and loads with the page; Blueprint (React, about 1 MB compressed with its styles)
// loads the first time a section needs it.
import {type TweakpaneThemeMode, UI as TweakpaneUI} from 'uiconfig-tweakpane'
import 'uiconfig-tweakpane/theme.css'
import type {UiConfigRenderer} from 'uiconfig.js'
import {Color, Vector2, Vector3, Vector4} from 'three'
import {isDark} from './scheme'

export type RendererName = 'tweakpane' | 'blueprint'

// The color and vector components of both renderers create their values with these classes.
// They accept '#rrggbb' strings, numbers and plain {x, y, z} objects as well.
export const THREE = {Color, Vector2, Vector3, Vector4}

// Tweakpane panels use the theme of uiconfig-tweakpane (theme.css), in the mode picked under the hero panel;
// 'auto' follows the page's light or dark scheme. The component list keeps the plain Tweakpane look.
export type PanelTheme = TweakpaneThemeMode | 'auto' | 'plain'
const themed = new Set<TweakpaneUI>()
let panelTheme: PanelTheme = 'auto'
const themeMode = (): TweakpaneThemeMode | null =>
    panelTheme === 'plain' ? null : panelTheme === 'auto' ? (isDark() ? 'dark' : 'light') : panelTheme
export function setPanelTheme(theme: PanelTheme = panelTheme) {
    panelTheme = theme
    for (const ui of themed) ui.setTheme(themeMode())
    dispatchEvent(new Event('paneltheme'))
}
export const getPanelTheme = () => panelTheme
addEventListener('schemechange', () => setPanelTheme())

// A renderer runs an update loop on every animation frame (refresh queue, frame events). The panels on this page
// stop their loop while they are off screen and start it again when they come back; refreshes asked for in the
// meantime wait in the queue.
const loops = new Map<Element, UiConfigRenderer>()
const visibility = new IntersectionObserver(entries => {
    for (const e of entries) {
        const ui = loops.get(e.target)
        if (!ui) continue
        if (e.isIntersecting) ui.start()
        else ui.stop()
    }
}, {rootMargin: '200px'})
function pauseWhenHidden(ui: UiConfigRenderer, host: HTMLElement) {
    loops.set(host, ui)
    visibility.observe(host)
}

export function createTweakpane(host: HTMLElement, {theme = true} = {}): UiConfigRenderer {
    // no undo manager: it binds Ctrl+Z on the whole document, which belongs to the editors on this page
    const ui = new TweakpaneUI(host, {expanded: true}, false)
    ui.THREE = THREE
    if (theme) {
        themed.add(ui)
        ui.setTheme(themeMode())
    }
    pauseWhenHidden(ui, host)
    return ui
}

let blueprintModule: Promise<typeof import('uiconfig-blueprint')> | undefined
export const loadBlueprint = () => blueprintModule ??= import('uiconfig-blueprint')

export async function createBlueprint(host: HTMLElement): Promise<UiConfigRenderer> {
    const {UI} = await loadBlueprint()
    // The Blueprint panel reads its light or dark mode from localStorage when it mounts;
    // match it to the page.
    localStorage.setItem('bpUiDarkMode', isDark() ? 'true' : 'false')
    host.replaceChildren() // the loading message
    const ui = new UI(host, {}, false)
    ui.THREE = THREE
    pauseWhenHidden(ui, host)
    return ui
}

export function createRenderer(name: RendererName, host: HTMLElement, options?: {theme?: boolean}): Promise<UiConfigRenderer> {
    return name === 'blueprint' ? createBlueprint(host) : Promise.resolve(createTweakpane(host, options))
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
