/** Replaces the content of a panel host with a short error message. */
export function showPanelError(host: HTMLElement, message: string, error: unknown) {
    const p = document.createElement('p')
    p.className = 'panel-error'
    p.textContent = `${message}: ${error instanceof Error ? error.message : String(error)}`
    host.replaceChildren(p)
}
