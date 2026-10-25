// "Three ways to write it": the same Person panel from a plain object, a class and TypeScript decorators.
// The code on each tab is the source of the file in src/samples that renders next to it.
import type {UiObjectConfig} from 'uiconfig.js'
import {createTweakpane} from '../renderers'
import {highlight} from '../highlight'
import {sampleSource} from '../sample-source'
import {data as objectData} from '../samples/object.js'
import objectSource from '../samples/object.js?raw'
import {data as classData} from '../samples/class.js'
import classSource from '../samples/class.js?raw'
import {data as decoratorData} from '../samples/decorators'
import decoratorSource from '../samples/decorators.ts?raw'

// object.js adds uiConfig after the object literal, which the inferred type does not see
type WithConfig = {uiConfig: UiObjectConfig}

const samples: Record<string, {config: UiObjectConfig, source: string}> = {
    object: {config: (objectData as unknown as WithConfig).uiConfig, source: objectSource},
    class: {config: (classData as unknown as WithConfig).uiConfig, source: classSource},
    decorators: {config: decoratorData.uiConfig, source: decoratorSource},
}

export function setupSyntax() {
    const tablist = document.querySelector<HTMLElement>('#syntax [role="tablist"]')!
    const tabs = [...tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
    const code = document.getElementById('syntax-code')!
    const ui = createTweakpane(document.getElementById('syntax-panel')!)
    let current: UiObjectConfig | undefined

    const select = (tab: HTMLButtonElement, focus = false) => {
        for (const t of tabs) {
            const selected = t === tab
            t.setAttribute('aria-selected', String(selected))
            t.tabIndex = selected ? 0 : -1
        }
        if (focus) tab.focus()
        document.getElementById('syntax-tabpanel')!.setAttribute('aria-labelledby', tab.id)
        const sample = samples[tab.dataset.sample!]
        code.innerHTML = highlight(sampleSource(sample.source))
        if (current) ui.removeChild(current)
        current = sample.config
        ui.appendChild(current)
    }

    tablist.addEventListener('click', ev => {
        const tab = (ev.target as HTMLElement).closest<HTMLButtonElement>('[role="tab"]')
        if (tab) select(tab)
    })
    tablist.addEventListener('keydown', ev => {
        const i = tabs.indexOf(document.activeElement as HTMLButtonElement)
        if (i < 0) return
        const next = {ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1}[ev.key]
        if (next === undefined) return
        ev.preventDefault()
        select(tabs[(next + tabs.length) % tabs.length], true)
    })
    select(tabs[0])
}
