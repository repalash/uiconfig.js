// The color scheme of the page: <html data-scheme="light|dark">. index.html sets it before the first paint from
// prefers-color-scheme; this module follows changes of the system setting and lets the design panel force one.
export type Scheme = 'auto' | 'light' | 'dark'

const media = matchMedia('(prefers-color-scheme: dark)')
let chosen: Scheme = 'auto'

export const isDark = () => document.documentElement.dataset.scheme === 'dark'

export function setScheme(scheme: Scheme = chosen) {
    chosen = scheme
    const dark = scheme === 'auto' ? media.matches : scheme === 'dark'
    if (document.documentElement.dataset.scheme === (dark ? 'dark' : 'light')) return
    document.documentElement.dataset.scheme = dark ? 'dark' : 'light'
    dispatchEvent(new Event('schemechange'))
}

media.addEventListener('change', () => setScheme())
