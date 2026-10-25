// Script of the API docs (TypeDoc's customJs): the site's color scheme, brand and links, and a package switcher.
(function () {
    const root = document.documentElement
    // TypeDoc's theme setting: os, light or dark (localStorage tsd-theme); the site tokens need data-scheme
    const media = matchMedia('(prefers-color-scheme: dark)')
    const applyScheme = () => {
        const theme = root.dataset.theme || 'os'
        root.dataset.scheme = theme === 'dark' || (theme === 'os' && media.matches) ? 'dark' : 'light'
    }
    applyScheme()
    media.addEventListener('change', applyScheme)
    new MutationObserver(applyScheme).observe(root, {attributes: true, attributeFilter: ['data-theme']})

    // data-base is the path from this page to the docs root; the site root is one level up
    const base = root.dataset.base || './'
    const site = 'https://repalash.com/uiconfig.js/'

    const packages = [
        {name: 'uiconfig.js', label: 'uiconfig.js', color: 'config'},
        {name: 'uiconfig-tweakpane', label: 'Tweakpane', long: 'uiconfig-', color: 'tweakpane'},
        {name: 'uiconfig-blueprint', label: 'Blueprint', long: 'uiconfig-', color: 'blueprint'},
    ]
    // pages of a package: modules/<package>.html and <kind>/<package>.<Name>.html
    const file = decodeURIComponent(location.pathname.split('/').pop() || '')
    const current = packages.slice().sort((a, b) => b.name.length - a.name.length)
        .find(p => file === p.name + '.html' || file.startsWith(p.name + '.'))

    function setup() {
        // links into the rest of the site stay on the host that serves the docs (a local preview, a fork's Pages)
        for (const a of document.querySelectorAll(`a[href^="${site}"]`)) {
            a.href = base + '../' + a.getAttribute('href').slice(site.length)
        }
        const title = document.querySelector('.tsd-toolbar-contents > .title')
        if (!title) return
        title.innerHTML = 'uiconfig<span class="brand-dot">.js</span><span class="docs-label">API</span>'
        title.setAttribute('aria-label', 'uiconfig.js API docs')
        const nav = document.createElement('nav')
        nav.className = 'pkg-switch'
        nav.setAttribute('aria-label', 'Package')
        nav.innerHTML = packages.map(p => `<a href="${base}modules/${p.name}.html" aria-current="${p === current}" title="${p.name}">` +
            `<span class="key" style="--h: var(--c-${p.color})">${p.long ? `<span class="pkg-long">${p.long}</span>` : ''}${p.long ? p.name.slice(p.long.length) : p.label}</span></a>`).join('')
        title.after(nav)
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup)
    else setup()
})()
