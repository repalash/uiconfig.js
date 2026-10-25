// Script of the example pages (examples/index.html and examples/<slug>.html, made by scripts/examples-pages.mjs).
// On an example page it runs the example's file in each renderer that the visitor picks: every renderer gets its
// own run of the example, because a renderer keeps its state in the config objects.
import '../styles/fonts.css'
import '../styles/tokens.css'
import '../styles/site.css'
import '../styles/examples.css'
import type {UiConfigRenderer} from 'uiconfig.js'
import {DESIGN_STORAGE_KEY} from '../design/storage'
import {createRenderer, type RendererName, themeMode} from '../renderers'
import {showPanelError} from '../sections/panel-error'

/** What an example gets besides the renderer: `log` prints under the panel, `view` is the element for a canvas. */
export interface ExampleContext {
    log: (...args: unknown[]) => void
    view?: HTMLElement
}
type Example = (ui: UiConfigRenderer, context: ExampleContext) => void | Promise<void>

// the code of every example, each in its own chunk
const modules = import.meta.glob<{default: Example}>('./code/*.{js,ts}')

// copy buttons: <button data-copy="text">
document.addEventListener('click', ev => {
    const button = (ev.target as HTMLElement).closest<HTMLButtonElement>('button[data-copy]')
    if (!button) return
    const label = button.textContent
    navigator.clipboard.writeText(button.dataset.copy!).then(
        () => { button.textContent = 'Copied' },
        () => { button.textContent = 'Copy failed' },
    ).finally(() => setTimeout(() => { button.textContent = label }, 1500))
})

// the visitor's choices from "Tweak this page" on the landing page (fonts, accent, color scheme, panel theme)
try {
    if (localStorage.getItem(DESIGN_STORAGE_KEY)) import('../design/design').then(m => m.applyStoredDesign()).catch(e => console.error(e))
} catch { /* storage disabled */ }

const RENDERER_KEY = 'uiconfig-site:examples-renderer'

function setupExample(main: HTMLElement) {
    const slug = main.dataset.example!
    const supported = main.dataset.renderers!.split(' ') as RendererName[]
    const load = modules[`./code/${slug}.js`] ?? modules[`./code/${slug}.ts`]
    if (!load) throw new Error(`no code for the example ${slug}`)

    const logList = document.getElementById('ex-log')
    const log = (...args: unknown[]) => {
        if (!logList) return console.log(...args)
        const li = document.createElement('li')
        li.textContent = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ')
        logList.append(li)
        while (logList.children.length > 50) logList.firstElementChild!.remove()
        logList.scrollTop = logList.scrollHeight
    }
    const view = document.getElementById('ex-view') ?? undefined

    // the setup code shows the Tweakpane theme mode that the page uses
    const showThemeMode = () => {
        const mode = themeMode()
        for (const el of document.querySelectorAll<HTMLElement>('[data-theme-mode]')) el.textContent = mode ? `'${mode}'` : 'null'
    }
    showThemeMode()
    addEventListener('paneltheme', showThemeMode)

    const renderers: Partial<Record<RendererName, Promise<UiConfigRenderer>>> = {}
    let current: RendererName | undefined // the renderer that is shown
    const run = (name: RendererName) => {
        const host = document.getElementById(`ex-panel-${name}`)!
        renderers[name] = (async () => {
            if (name === 'blueprint') host.innerHTML = '<p class="panel-loading">Loading Blueprint and React…</p>'
            const [ui, module] = await Promise.all([
                createRenderer(name, host, {undo: true, theme: main.dataset.theme !== 'off'}),
                load(),
            ])
            // the examples with a view (three.js, threepipe) get an element in it for each renderer
            let ownView: HTMLElement | undefined
            if (view) {
                view.querySelector('.panel-loading')?.remove()
                ownView = Object.assign(document.createElement('div'), {className: 'ex-view-part'})
                ownView.dataset.renderer = name
                // the visitor can switch renderers while this one loads: show its view only if it is still selected
                ownView.hidden = name !== current
                view.append(ownView)
            }
            await module.default(ui, {log, view: ownView})
            return ui
        })()
        renderers[name].catch(e => {
            console.error(e)
            showPanelError(host, `The example did not run in ${name}`, e)
        })
    }

    const show = (name: RendererName) => {
        current = name
        for (const el of document.querySelectorAll<HTMLElement>('[data-renderer]')) {
            if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', String(el.dataset.renderer === name))
            else el.hidden = el.dataset.renderer !== name
        }
        // a renderer that is not shown records no edits, so Ctrl+Z undoes only in the visible panel
        for (const [n, p] of Object.entries(renderers)) {
            p?.then(ui => { if (ui.undoManager) ui.undoManager.enabled = n === name }).catch(() => {})
        }
        if (!renderers[name]) run(name)
    }

    document.getElementById('ex-switch')?.addEventListener('click', ev => {
        const button = (ev.target as HTMLElement).closest<HTMLButtonElement>('button[data-renderer]')
        if (!button || button.getAttribute('aria-pressed') === 'true') return
        const name = button.dataset.renderer as RendererName
        show(name)
        try { localStorage.setItem(RENDERER_KEY, name) } catch { /* storage disabled */ }
        const url = new URL(location.href)
        url.searchParams.set('renderer', name)
        history.replaceState(null, '', url)
    })

    // ?renderer=blueprint in the URL, else the visitor's last choice, else the first renderer of the example
    let stored: string | null = null
    try { stored = localStorage.getItem(RENDERER_KEY) } catch { /* storage disabled */ }
    const asked = new URLSearchParams(location.search).get('renderer')
    const first = [asked, stored].find(r => supported.includes(r as RendererName)) as RendererName | undefined
    show(first ?? supported[0])
}

const main = document.querySelector<HTMLElement>('main[data-example]')
if (main) {
    try {
        setupExample(main)
    } catch (e) {
        console.error(e)
        const host = main.querySelector<HTMLElement>('.panel-host:not([hidden])')
        if (host) showPanelError(host, 'The example did not run', e)
    }
}
