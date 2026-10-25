// Hero: a Tweakpane panel that edits the page heading. "Config of this panel" shows the source of
// hero-config.js, highlighted at build time, so the page shows the code that runs.
import type {UiObjectConfig} from 'uiconfig.js'
import {createTweakpane, getPanelTheme, type PanelTheme, setPanelTheme} from '../renderers'
import {createHeadingConfig} from './hero-config.js'
import heroCode from './hero-config.js?highlight'

type Heading = ReturnType<typeof createHeadingConfig>['heading']

/** A CSS color (also color-mix() and other forms the color input cannot read) as '#rrggbb'. */
function toHex(color: string) {
    const ctx = document.createElement('canvas').getContext('2d', {willReadFrequently: true})
    if (!ctx) return '#3346d3'
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return '#' + [r, g, b].map(n => n.toString(16).padStart(2, '0')).join('')
}

export function setupHero() {
    const title = document.getElementById('wordmark') as HTMLElement
    const host = document.getElementById('hero-panel') as HTMLElement
    const probe = document.createElement('span')
    probe.style.color = 'var(--accent)'
    document.body.append(probe)
    const accent = toHex(getComputedStyle(probe).color)
    probe.remove()

    const apply = (h: Heading) => {
        title.textContent = h.text
        title.style.fontWeight = String(h.weight)
        title.style.letterSpacing = `${h.tracking}em`
        title.style.textTransform = h.case
        title.style.color = h.color
        title.classList.toggle('is-outline', h.outline)
        dispatchEvent(new CustomEvent('heading', {detail: {...h}})) // for the hero figure
    }
    const {heading, config} = createHeadingConfig(accent || '#3346d3', apply)
    apply(heading)

    const ui = createTweakpane(host)
    ui.appendChild(config as UiObjectConfig)

    document.getElementById('hero-code')!.innerHTML = heroCode

    // the theme of the Tweakpane panels on the page
    const switcher = document.getElementById('panel-theme')!
    const buttons = [...switcher.querySelectorAll<HTMLButtonElement>('button[data-theme]')]
    const mark = () => { for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.theme === getPanelTheme())) }
    switcher.addEventListener('click', ev => {
        const b = (ev.target as HTMLElement).closest<HTMLButtonElement>('button[data-theme]')
        if (b) setPanelTheme(b.dataset.theme as PanelTheme)
    })
    addEventListener('paneltheme', mark)
    mark()
}
