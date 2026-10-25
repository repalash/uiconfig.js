// Playground: the visitor's code returns a config, the chosen renderer shows it.
//
// Security: the code comes only from the presets in this file or from what the visitor typed (kept in
// this origin's localStorage). It is never read from the URL, the hash or another site, because it runs
// with the rights of the page.
import type {UiConfigRenderer, UiObjectConfig} from 'uiconfig.js'
import {afterLoad, createRenderer, type RendererName, whenNear} from '../renderers'
import {setupRendererSwitch} from '../sections/renderer-switch'
import type {CodeEditor} from './editor'
import {presets} from './presets'

const STORAGE_KEY = 'uiconfig-site:playground'
const RUN_DELAY = 400
const MAX_LOG_LINES = 50

interface Stored {code: string, renderer: RendererName}

function readStored(): Stored | undefined {
    try {
        const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
        if (s && typeof s.code === 'string' && (s.renderer === 'tweakpane' || s.renderer === 'blueprint')) return s
    } catch { /* no stored code */ }
    return undefined
}

function formatLogValue(v: unknown): string {
    if (typeof v === 'string') return v
    try {
        return JSON.stringify(v, (_, x) => typeof x === 'number' ? Math.round(x * 1000) / 1000 : x)
    } catch {
        return String(v)
    }
}

/** "line N" for an error thrown by the visitor's code, from the stack of the generated function. */
function errorLine(e: unknown): number | undefined {
    const m = e instanceof Error && e.stack?.match(/<anonymous>:(\d+):\d+/)
    // new Function puts two lines before the body ("function anonymous(log", ") {"), plus our "use strict" line
    return m ? Number(m[1]) - 3 : undefined
}

export function setupPlayground() {
    const section = document.getElementById('playground')!
    const fallback = section.querySelector<HTMLTextAreaElement>('#pg-fallback')!
    const editorHost = section.querySelector<HTMLElement>('.pg-editor')!
    const presetSelect = section.querySelector<HTMLSelectElement>('#pg-preset')!
    const status = section.querySelector<HTMLElement>('#pg-status')!
    const logList = section.querySelector<HTMLOListElement>('#pg-log')!
    const hosts: Record<RendererName, HTMLElement> = {
        tweakpane: section.querySelector('#pg-tweakpane')!,
        blueprint: section.querySelector('#pg-blueprint')!,
    }

    const stored = readStored()
    let rendererName: RendererName = stored?.renderer ?? 'tweakpane'
    let code = stored?.code ?? presets[0].code
    let editor: CodeEditor | undefined

    presetSelect.append(...presets.map((p, i) => new Option(p.name, String(i))))
    if (stored && stored.code !== presets[0].code) presetSelect.prepend(new Option('Your code', 'own', true, true))
    fallback.value = code
    for (const b of section.querySelectorAll<HTMLButtonElement>('#pg-switch button[data-renderer]')) {
        b.setAttribute('aria-pressed', String(b.dataset.renderer === rendererName))
    }

    // renderers are created on first use, one for each kind
    const renderers: Partial<Record<RendererName, Promise<UiConfigRenderer>>> = {}
    const mounted: Partial<Record<RendererName, UiObjectConfig>> = {}
    let broken: RendererName | undefined // set when the renderer threw outside of run()

    const getRenderer = async (name: RendererName) => {
        if (broken === name && renderers[name]) {
            // a renderer that threw during a frame stops its update loop: replace it
            const old = await renderers[name]!
            old.unmount()
            old.stop()
            hosts[name].replaceChildren()
            delete renderers[name]
            delete mounted[name]
        }
        if (broken === name) broken = undefined
        return renderers[name] ??= createRenderer(name, hosts[name])
    }

    const setStatus = (text: string, isError = false) => {
        status.textContent = text
        status.classList.toggle('is-error', isError)
    }

    const log = (...args: unknown[]) => {
        const li = document.createElement('li')
        li.textContent = args.map(formatLogValue).join(' ')
        logList.append(li)
        while (logList.children.length > MAX_LOG_LINES) logList.firstElementChild!.remove()
        logList.scrollTop = logList.scrollHeight
    }

    let runId = 0
    const run = async () => {
        const id = ++runId
        const name = rendererName
        let config: unknown
        try {
            config = new Function('log', `'use strict';\n${code}`)(log)
        } catch (e) {
            const line = errorLine(e)
            setStatus(`${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}${line ? ` (line ${line})` : ''}`, true)
            return
        }
        if (!config || typeof config !== 'object' || typeof (config as UiObjectConfig).type !== 'string') {
            setStatus('The code must return a config: an object with a type, for example return {type: \'folder\', children: []}', true)
            return
        }
        try {
            const ui = await getRenderer(name)
            if (id !== runId) return // a newer edit is on its way
            if (mounted[name]) ui.removeChild(mounted[name]!)
            mounted[name] = config as UiObjectConfig
            ui.appendChild(config as UiObjectConfig)
            setStatus(`Rendered with ${name === 'tweakpane' ? 'uiconfig-tweakpane' : 'uiconfig-blueprint'}`)
        } catch (e) {
            broken = name
            setStatus(`The renderer failed: ${e instanceof Error ? e.message : String(e)}`, true)
        }
    }

    // errors from callbacks (onClick, onChange) and from rendering in a later frame
    let active = false
    const onAsyncError = (message: string) => {
        if (!active) return
        broken = rendererName
        setStatus(`Error: ${message}`, true)
    }
    addEventListener('error', ev => onAsyncError(ev.message))
    addEventListener('unhandledrejection', ev => onAsyncError(ev.reason instanceof Error ? ev.reason.message : String(ev.reason)))

    let timer = 0
    let saveTimer = 0
    const onCode = (next: string) => {
        code = next
        clearTimeout(timer)
        timer = window.setTimeout(run, RUN_DELAY)
        clearTimeout(saveTimer)
        saveTimer = window.setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify({code, renderer: rendererName} satisfies Stored))
            } catch { /* storage full or disabled */ }
        }, 1000)
    }
    fallback.addEventListener('input', () => onCode(fallback.value))

    presetSelect.addEventListener('change', () => {
        const preset = presets[Number(presetSelect.value)]
        if (!preset) return
        presetSelect.querySelector('option[value="own"]')?.remove()
        if (editor) editor.setValue(preset.code)
        else {
            fallback.value = preset.code
            onCode(preset.code)
        }
    })

    setupRendererSwitch(section.querySelector('#pg-switch')!, name => {
        rendererName = name
        for (const [n, host] of Object.entries(hosts)) host.hidden = n !== name
        onCode(code)
    })

    whenNear(section, () => afterLoad(() => {
        active = true
        for (const [n, host] of Object.entries(hosts)) host.hidden = n !== rendererName
        run()
        import('./editor')
            .then(({createEditor}) => {
                editor = createEditor(editorHost, fallback.value, onCode, 'Playground code, JavaScript')
                fallback.remove()
            })
            .catch(() => { /* the plain text area stays */ })
    }))
}
