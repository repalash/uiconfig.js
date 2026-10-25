// "One config, any renderer": one data object, a Tweakpane panel and a Blueprint panel.
// Each renderer gets its own config object from the same function, because a renderer stores its
// state (uiRef, uiRefresh) in the config. After a change in one panel, uiRefresh updates the other.
import type {UiObjectConfig} from 'uiconfig.js'
import {afterLoad, createBlueprint, createTweakpane, whenNear} from '../renderers'
import {highlight} from '../highlight'
import {sampleSource} from '../sample-source'
import {createLight, createLightConfig} from './light-config.js'
import lightSource from './light-config.js?raw'
import {showPanelError} from './panel-error'

const round = (n: number) => Math.round(n * 1000) / 1000

function formatValue(v: unknown): string {
    if (typeof v === 'string') return `'${v}'`
    if (typeof v === 'number') return String(round(v))
    if (v && typeof v === 'object') return `{${Object.entries(v).map(([k, x]) => `${k}: ${formatValue(x)}`).join(', ')}}`
    return String(v)
}

export function setupDual() {
    const section = document.getElementById('renderers')!
    const tpHost = document.getElementById('dual-tweakpane')!
    const bpHost = document.getElementById('dual-blueprint')!
    const dataView = document.getElementById('dual-data')!

    const light = createLight()
    const configs = {tweakpane: createLightConfig(light) as UiObjectConfig, blueprint: createLightConfig(light) as UiObjectConfig}

    const lines = new Map<string, HTMLElement>()
    const renderData = (changed: string[] = []) => {
        if (!lines.size) {
            dataView.innerHTML = ''
            dataView.append(Object.assign(document.createElement('span'), {className: 'data-brace', textContent: 'const light = {'}))
            for (const key of Object.keys(light)) {
                const line = document.createElement('span')
                line.className = 'data-line'
                lines.set(key, line)
                dataView.append(line)
            }
            dataView.append(Object.assign(document.createElement('span'), {className: 'data-brace', textContent: '}'}))
        }
        for (const [key, line] of lines) {
            line.innerHTML = highlight(`  ${key}: ${formatValue((light as Record<string, unknown>)[key])},`)
            if (changed.includes(key)) {
                line.classList.remove('is-changed')
                void line.offsetWidth // restart the highlight animation
                line.classList.add('is-changed')
            }
        }
    }
    renderData()

    let snapshot = JSON.stringify(light)
    const syncTo = (other: UiObjectConfig) => () => {
        const next = JSON.stringify(light)
        if (next === snapshot) return
        const before = JSON.parse(snapshot)
        snapshot = next
        const changed = Object.keys(light).filter(k => JSON.stringify(before[k]) !== JSON.stringify((light as Record<string, unknown>)[k]))
        other.uiRefresh?.(true)
        renderData(changed)
    }
    configs.tweakpane.onChange = syncTo(configs.blueprint)
    configs.blueprint.onChange = syncTo(configs.tweakpane)

    createTweakpane(tpHost).appendChild(configs.tweakpane)
    whenNear(section, () => afterLoad(() => {
        createBlueprint(bpHost)
            .then(ui => ui.appendChild(configs.blueprint))
            .catch(e => showPanelError(bpHost, 'The Blueprint panel did not load', e))
    }))

    const code = document.getElementById('dual-code')
    if (code) code.innerHTML = highlight(sampleSource(lightSource))

    // narrow screens show one panel at a time
    const switcher = section.querySelector<HTMLElement>('.panel-switch')!
    switcher.addEventListener('click', ev => {
        const button = (ev.target as HTMLElement).closest<HTMLButtonElement>('button[data-show]')
        if (!button) return
        section.dataset.show = button.dataset.show
        for (const b of switcher.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b === button))
    })
}
