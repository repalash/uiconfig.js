// The design panel ("Tweak this page", or ?design=1 in the URL): fonts, sizes, accent, radius, panel density and theme,
// color scheme and the hero figure, applied live through CSS custom properties. Built with uiconfig-tweakpane.
// The URL only opens the panel; it never carries values or code. The choices are saved in localStorage once the
// visitor changes something, and apply on later visits (main.ts); Reset removes them.
import {UI} from 'uiconfig-tweakpane'
import type {UiObjectConfig} from 'uiconfig.js'
import {setPanelTheme, type PanelTheme, THREE} from '../renderers'
import {isDark, type Scheme, setScheme} from '../scheme'
import {DESIGN_STORAGE_KEY as STORAGE_KEY} from './storage'

const textFonts: Record<string, string> = {
    'Inter': '\'Inter Variable\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif',
    'System UI': '-apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif',
    'IBM Plex Sans': '\'IBM Plex Sans Variable\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif',
    'Schibsted Grotesk': '\'Schibsted Grotesk Variable\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif',
    'Instrument Sans': '\'Instrument Sans Variable\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif',
}
const headingFonts: Record<string, string> = {
    'Same as text': 'var(--font-text)',
    'Bricolage Grotesque': '\'Bricolage Grotesque Variable\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', sans-serif',
    ...textFonts,
}
const codeFonts: Record<string, string> = {
    'JetBrains Mono': '\'JetBrains Mono\', ui-monospace, \'SF Mono\', Menlo, Consolas, monospace',
    'IBM Plex Mono': '\'IBM Plex Mono\', ui-monospace, \'SF Mono\', Menlo, Consolas, monospace',
    'System monospace': 'ui-monospace, \'SF Mono\', Menlo, Consolas, monospace',
}
const accents: Record<string, string> = {
    Cobalt: '#3346d3',
    Teal: '#0e8a82',
    Berry: '#b8336f',
    Violet: '#6b3fd4',
    Graphite: '#3a4150',
}

const defaults = {
    textFont: 'Inter',
    textSize: 15,
    lineHeight: 1.5,
    headingFont: 'Same as text',
    headingWeight: 700,
    codeFont: 'JetBrains Mono',
    accent: 'Cobalt',
    customAccent: '#3346d3',
    radius: 10,
    density: 'theme',
    panelTheme: 'auto' as PanelTheme,
    scheme: 'auto' as Scheme,
    heroFigure: true,
}
type Design = typeof defaults

function load(): Design {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
        return {...defaults, ...(stored && typeof stored === 'object' ? stored : {})}
    } catch {
        return {...defaults}
    }
}

/** The CSS custom properties for a design. */
function variables(d: Design): Record<string, string> {
    return {
        '--font-text': textFonts[d.textFont] ?? textFonts.Inter,
        '--font-heading': headingFonts[d.headingFont] ?? 'var(--font-text)',
        '--font-code': codeFonts[d.codeFont] ?? codeFonts['JetBrains Mono'],
        '--text-size': `${d.textSize}px`,
        '--line-height': String(d.lineHeight),
        '--heading-weight': String(d.headingWeight),
        '--accent-base': d.accent === 'Custom' ? d.customAccent : accents[d.accent] ?? accents.Cobalt,
        '--radius': `${d.radius}px`,
    }
}

function apply(d: Design, save: boolean) {
    const root = document.documentElement
    for (const [k, v] of Object.entries(variables(d))) root.style.setProperty(k, v)
    if (d.density === 'theme') delete root.dataset.density
    else root.dataset.density = d.density
    root.dataset.heroFigure = d.heroFigure ? 'on' : 'off'
    setScheme(d.scheme)
    setPanelTheme(d.panelTheme)
    if (!save) return
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(d))
    } catch { /* storage disabled */ }
}

/** Applies the saved choices of an earlier visit, without opening the panel. */
export function applyStoredDesign() {
    apply(load(), false)
}

function cssText(d: Design) {
    const lines = Object.entries(variables(d)).map(([k, v]) => `    ${k}: ${v};`)
    return [':root {', ...lines, '}',
        `/* color scheme: ${d.scheme}, panel density: ${d.density}, Tweakpane theme: ${d.panelTheme}, hero figure: ${d.heroFigure ? 'on' : 'off'} */`].join('\n')
}

const options = (list: Record<string, string> | string[]) =>
    (Array.isArray(list) ? list : Object.keys(list)).map(label => ({label, value: label}))

let host: HTMLElement | undefined
let renderer: UI | undefined
let toggle: HTMLButtonElement | null = null

function createPanel() {
    const d = load()
    apply(d, false)

    let copyLabel = 'Copy CSS'
    let lastAccent = d.accent
    const config: UiObjectConfig = {
        type: 'folder',
        label: 'Tweak this page',
        expanded: true,
        children: [
            {type: 'dropdown', label: 'Text font', property: [d, 'textFont'], children: options(textFonts)},
            {type: 'slider', label: 'Text size', bounds: [14, 17], stepSize: 0.5, property: [d, 'textSize']},
            {type: 'slider', label: 'Line height', bounds: [1.4, 1.7], stepSize: 0.05, property: [d, 'lineHeight']},
            {type: 'dropdown', label: 'Heading font', property: [d, 'headingFont'], children: options(headingFonts)},
            {type: 'slider', label: 'Heading weight', bounds: [400, 800], stepSize: 50, property: [d, 'headingWeight']},
            {type: 'dropdown', label: 'Code font', property: [d, 'codeFont'], children: options(codeFonts)},
            {type: 'dropdown', label: 'Accent', property: [d, 'accent'], children: options([...Object.keys(accents), 'Custom'])},
            {type: 'color', label: 'Custom accent', property: [d, 'customAccent'], hidden: () => d.accent !== 'Custom'},
            {type: 'slider', label: 'Corner radius', bounds: [0, 16], stepSize: 1, property: [d, 'radius']},
            {type: 'dropdown', label: 'Panel density', property: [d, 'density'], children: options(['theme', 'compact', 'comfortable'])},
            {type: 'dropdown', label: 'Tweakpane theme', property: [d, 'panelTheme'], children: options(['auto', 'plain', 'light', 'dark', 'blue', 'white', 'black'])},
            {type: 'dropdown', label: 'Color scheme', property: [d, 'scheme'], children: options(['auto', 'light', 'dark'])},
            {type: 'checkbox', label: 'Hero figure', property: [d, 'heroFigure']},
            {
                type: 'button',
                label: 'Reset',
                onClick: () => {
                    Object.assign(d, defaults)
                    apply(d, false)
                    try {
                        localStorage.removeItem(STORAGE_KEY)
                    } catch { /* storage disabled */ }
                    config.uiRefresh?.(true)
                },
            },
            {
                type: 'button',
                label: () => copyLabel,
                onClick: async () => {
                    try {
                        await navigator.clipboard.writeText(cssText(d))
                        copyLabel = 'Copied'
                    } catch {
                        console.log(cssText(d))
                        copyLabel = 'Copy failed: see the console'
                    }
                    config.uiRefresh?.(true)
                    setTimeout(() => {
                        copyLabel = 'Copy CSS'
                        config.uiRefresh?.(true)
                    }, 1600)
                },
            },
        ],
        onChange: () => {
            apply(d, true)
            if (d.accent !== lastAccent) config.uiRefresh?.(true) // the custom accent shows only for 'Custom'
            lastAccent = d.accent
        },
    }

    host = document.createElement('div')
    host.id = 'design-panel'
    host.className = 'design-panel'
    host.setAttribute('role', 'dialog')
    host.setAttribute('aria-label', 'Tweak this page')
    host.addEventListener('keydown', ev => {
        if (ev.key === 'Escape') closeDesignPanel(true)
    })
    document.body.append(host)
    const ui = new UI(host, {expanded: true}, false)
    ui.THREE = THREE
    ui.setTheme(isDark() ? 'dark' : 'light')
    addEventListener('schemechange', () => ui.setTheme(isDark() ? 'dark' : 'light'))
    ui.appendChild(config)
    renderer = ui
}

export const isDesignPanelOpen = () => !!host && !host.hidden

export function openDesignPanel(button: HTMLButtonElement | null) {
    toggle = button
    if (!host) createPanel()
    host!.hidden = false
    renderer?.start()
    toggle?.setAttribute('aria-expanded', 'true')
    // move the focus into the panel: its first control
    host!.querySelector<HTMLElement>('select, input, button')?.focus()
}

export function closeDesignPanel(focusButton = false) {
    if (!host) return
    host.hidden = true
    renderer?.stop()
    toggle?.setAttribute('aria-expanded', 'false')
    if (focusButton) toggle?.focus()
}

export function toggleDesignPanel(button: HTMLButtonElement | null) {
    if (isDesignPanelOpen()) closeDesignPanel()
    else openDesignPanel(button)
}
