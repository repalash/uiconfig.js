// Hero: a Tweakpane panel that edits the page heading. "Config of this panel" shows the source of
// hero-config.js, highlighted at build time, so the page shows the code that runs.
import type {UiObjectConfig} from 'uiconfig.js'
import {createTweakpane} from '../renderers'
import {createHeadingConfig} from './hero-config.js'
import heroCode from './hero-config.js?highlight'

type Heading = ReturnType<typeof createHeadingConfig>['heading']

export function setupHero() {
    const title = document.getElementById('wordmark') as HTMLElement
    const host = document.getElementById('hero-panel') as HTMLElement
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()

    const apply = (h: Heading) => {
        title.textContent = h.text
        title.style.fontWeight = String(h.weight)
        title.style.letterSpacing = `${h.tracking}em`
        title.style.textTransform = h.case
        title.style.color = h.color
        title.classList.toggle('is-outline', h.outline)
    }
    const {heading, config} = createHeadingConfig(accent || '#3346d3', apply)
    apply(heading)

    const ui = createTweakpane(host)
    ui.appendChild(config as UiObjectConfig)

    document.getElementById('hero-code')!.innerHTML = heroCode
}
