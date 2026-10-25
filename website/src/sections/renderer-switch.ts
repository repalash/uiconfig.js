import type {RendererName} from '../renderers'

/** A pair of toggle buttons (`button[data-renderer]` in `el`) that picks a renderer. */
export function setupRendererSwitch(el: HTMLElement, onChange: (name: RendererName) => void) {
    el.addEventListener('click', ev => {
        const button = (ev.target as HTMLElement).closest<HTMLButtonElement>('button[data-renderer]')
        if (!button || button.getAttribute('aria-pressed') === 'true') return
        for (const b of el.querySelectorAll('button[data-renderer]')) b.setAttribute('aria-pressed', String(b === button))
        onChange(button.dataset.renderer as RendererName)
    })
}
