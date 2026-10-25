// Hero: a Tweakpane panel that edits the page heading. The config shown under "Config of this panel"
// is the source of src/sections/hero-config.js, so the page shows the code that runs.
import type {UiObjectConfig} from 'uiconfig.js'
import {createTweakpane} from '../renderers'
import {highlight} from '../highlight'
import {createHeadingConfig} from './hero-config.js'
import heroSource from './hero-config.js?raw'
import {sampleSource} from '../sample-source'

type Heading = ReturnType<typeof createHeadingConfig>['heading']

export function setupHero() {
    const title = document.getElementById('wordmark') as HTMLElement
    const host = document.getElementById('hero-panel') as HTMLElement
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()

    const apply = (h: Heading) => {
        title.textContent = h.text
        title.style.fontWeight = String(h.weight)
        title.style.setProperty('--mono', String(h.mono))
        title.style.textTransform = h.case
        title.style.color = h.color
        title.classList.toggle('is-outline', h.outline)
    }
    const {heading, config} = createHeadingConfig(accent || '#3346d3', apply)
    apply(heading)

    const ui = createTweakpane(host)
    ui.appendChild(config as UiObjectConfig)

    const code = document.getElementById('hero-code')
    if (code) code.innerHTML = highlight(sampleSource(heroSource))
}
