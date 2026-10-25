// The HTML of the example pages, made from src/examples/registry.js (used by vite.config.js, which serves these
// pages in the dev server and builds them as examples/index.html and examples/<slug>.html). The code on a page is
// highlighted here, from the same file that the page runs (src/examples/code/<slug>.js or .ts).
import {existsSync, readFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {examples, topics} from '../src/examples/registry.js'
import {highlight, sampleSource} from './highlight.mjs'

const website = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const codeDir = path.join(website, 'src/examples/code')
const repoUrl = 'https://github.com/repalash/uiconfig.js'
const sourceUrl = `${repoUrl}/blob/master/website/src/examples/code/`

export const rendererNames = {tweakpane: 'Tweakpane', blueprint: 'Blueprint'}

const escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
/** Text with `code` spans, as HTML. */
const inline = s => escapeHtml(s).replace(/`([^`]+)`/g, '<code>$1</code>')
/** The first sentence of a summary, for the cards. */
const firstSentence = s => s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s

/** The file of an example: code/<slug>.js or code/<slug>.ts. */
export function exampleFile(slug) {
    for (const ext of ['js', 'ts']) {
        const file = path.join(codeDir, `${slug}.${ext}`)
        if (existsSync(file)) return file
    }
    throw new Error(`src/examples/registry.js: no file code/${slug}.js or .ts`)
}

/** Paths of the pages, relative to website/. */
export const examplePagePaths = ['examples/index.html', ...examples.map(e => `examples/${e.slug}.html`)]

/**
 * The setup code above an example: the renderer, its container and what the example gets (log, view).
 * The Tweakpane theme mode is a placeholder that the page replaces with the mode it uses.
 */
export function setupCode(example, renderer) {
    const lines = [`import {UI} from 'uiconfig-${renderer}'`]
    if (renderer === 'tweakpane') lines.push(`import 'uiconfig-tweakpane/theme.css'`)
    if (example.three) lines.push(`import {Color, Vector2, Vector3, Vector4} from 'three'`)
    lines.push('', '// the panel goes into this element (without one, it floats at the top right)')
    lines.push(`const ui = new UI(document.getElementById('panel'))`)
    if (renderer === 'tweakpane' && example.theme !== false) lines.push(`ui.setTheme('light') // a mode of theme.css`)
    if (example.three) lines.push('ui.THREE = {Color, Vector2, Vector3, Vector4}')
    if (example.log) lines.push('', '// this page prints the log under the panel', 'const log = console.log')
    if (example.view) lines.push('', '// the element for the canvas', `const view = document.getElementById('view')`)
    return lines.join('\n')
}

const themeModeSpan = html => html.replace(`<span class="tk-string">'light'</span>`, `<span class="tk-string" data-theme-mode>'light'</span>`)

function head(title, description) {
    return `<meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="color-scheme" content="light dark">
    <link rel="icon" href="../favicon.svg" type="image/svg+xml">
    <script>
        // color scheme before the first paint: the visitor's choice in "Tweak this page", else the system setting
        (function () {
            var scheme = 'auto'
            try { scheme = JSON.parse(localStorage.getItem('uiconfig-site:design') || '{}').scheme || 'auto' } catch (e) {}
            var dark = scheme === 'auto' ? matchMedia('(prefers-color-scheme: dark)').matches : scheme === 'dark'
            document.documentElement.dataset.scheme = dark ? 'dark' : 'light'
        })()
    </script>
    <script type="module" src="../src/examples/main.ts"></script>`
}

const topbar = (examplesHref) => `<a class="skip-link" href="#main">Skip to content</a>
<header class="topbar">
    <div class="wrap topbar-inner">
        <a class="brand" href="../" aria-label="uiconfig.js home">uiconfig<span class="brand-dot">.js</span></a>
        <nav aria-label="Site">
            <ul class="nav-list">
                <li><a href="../#playground">Playground</a></li>
                <li><a href="../docs/">API docs</a></li>
                <li><a href="${examplesHref}" aria-current="page">Examples</a></li>
                <li><a href="${repoUrl}">GitHub</a></li>
            </ul>
        </nav>
    </div>
</header>`

const footer = `<footer class="footer">
    <div class="wrap footer-inner">
        <p>uiconfig.js is <a href="${repoUrl}/blob/master/LICENSE">MIT licensed</a>. Made by <a href="https://repalash.com">repalash</a>.</p>
        <p><a href="${repoUrl}/issues">Report an issue</a></p>
    </div>
</footer>`

const page = (title, description, body) => `<!DOCTYPE html>
<html lang="en">
<head>
    ${head(title, description)}
</head>
<body>
${body}
${footer}
</body>
</html>
`

/** A small drawing of a panel with the given component types, for the cards. */
function miniPanel(types) {
    const rows = types.map(t => `<span class="mini-row" data-type="${escapeHtml(t)}"><span class="mini-label"></span><span class="mini-control"></span></span>`).join('')
    return `<span class="mini" aria-hidden="true"><span class="mini-title"></span>${rows}</span>`
}

const rendererKeys = renderers => `<span class="ex-renderers">${renderers.map(r =>
    `<span class="key" style="--h: var(--c-${r})">${rendererNames[r]}</span>`).join('')}</span>`

function indexPage() {
    const sections = topics.map(topic => {
        const list = examples.filter(e => e.topic === topic.id)
        const cards = list.map(e => `<li><a class="ex-card" href="./${e.slug}.html">
                    ${miniPanel(e.preview)}
                    <span class="ex-card-text">
                        <span class="ex-card-title">${escapeHtml(e.title)}</span>
                        <span class="ex-card-summary">${inline(firstSentence(e.summary))}</span>
                        ${rendererKeys(e.renderers)}
                    </span>
                </a></li>`).join('\n                ')
        return `<section class="ex-topic" id="${topic.id}" aria-labelledby="${topic.id}-title">
            <div class="section-head"><svg data-figure="${topic.icon}"></svg><h2 id="${topic.id}-title">${escapeHtml(topic.title)}</h2></div>
            <p class="intro">${inline(topic.intro)}</p>
            <ul class="ex-cards">
                ${cards}
            </ul>
        </section>`
    }).join('\n        ')
    const toc = topics.map(t => `<li><a href="#${t.id}">${escapeHtml(t.title)}</a></li>`).join('')
    return page('Examples: uiconfig.js', 'Live examples of uiconfig.js: configs as objects, classes and decorators, bindings, components, dynamic panels, three.js and threepipe, in Tweakpane and Blueprint.', `${topbar('./')}
<main id="main" class="ex-main">
    <div class="wrap">
        <header class="ex-index-head">
            <h1>Examples</h1>
            <p class="lede">Each example is a live panel and the code that makes it. Most run in Tweakpane and in Blueprint: switch the renderer on the page.</p>
            <nav aria-label="Topics"><ul class="ex-toc">${toc}</ul></nav>
        </header>
        ${sections}
    </div>
</main>`)
}

function examplePage(example, i) {
    const topic = topics.find(t => t.id === example.topic)
    if (!topic) throw new Error(`src/examples/registry.js: ${example.slug} has an unknown topic ${example.topic}`)
    for (const r of example.renderers) if (!rendererNames[r]) throw new Error(`src/examples/registry.js: ${example.slug}: unknown renderer ${r}`)
    const file = exampleFile(example.slug)
    const fileName = path.basename(file)
    const source = sampleSource(readFileSync(file, 'utf8'))
    const code = highlight(source, fileName.endsWith('.ts') ? 'ts' : 'js')
    const single = example.renderers.length === 1

    const switcher = single
        ? `<p class="ex-only"><span class="key" style="--h: var(--c-${example.renderers[0]})">${rendererNames[example.renderers[0]]} only</span></p>`
        : `<div class="segmented" id="ex-switch" role="group" aria-label="Renderer">${example.renderers.map((r, j) =>
            `<button type="button" data-renderer="${r}" aria-pressed="${j === 0}">${rendererNames[r]}</button>`).join('')}</div>`
    const hosts = example.renderers.map((r, j) =>
        `<div class="panel-host" id="ex-panel-${r}" data-renderer="${r}"${j ? ' hidden' : ''}></div>`).join('\n                ')
    const setups = example.renderers.map((r, j) => {
        const text = setupCode(example, r)
        return `<div class="ex-setup" data-renderer="${r}"${j ? ' hidden' : ''}>
                    <div class="code-head"><span>Setup, ${rendererNames[r]}</span><button type="button" class="button-quiet" data-copy="${escapeHtml(text)}">Copy</button></div>
                    <pre class="code" tabindex="0"><code>${themeModeSpan(highlight(text, 'js'))}</code></pre>
                </div>`
    }).join('\n                ')
    const prev = examples[i - 1]
    const next = examples[i + 1]
    const pager = `<nav class="ex-pager" aria-label="Other examples">
            ${prev ? `<a class="ex-prev" href="./${prev.slug}.html"><span>Previous</span>${escapeHtml(prev.title)}</a>` : '<span></span>'}
            ${next ? `<a class="ex-next" href="./${next.slug}.html"><span>Next</span>${escapeHtml(next.title)}</a>` : '<span></span>'}
        </nav>`

    const live = `<div class="ex-live">
                ${example.view ? '<div class="ex-view" id="ex-view"><p class="panel-loading">Loading…</p></div>' : ''}
                <div class="ex-panel">
                ${hosts}
                ${example.note ? `<p class="note ex-note">${inline(example.note)}</p>` : ''}
                ${example.log ? `<h2 class="pg-log-title" id="ex-log-title">Log</h2>
                <ol id="ex-log" class="pg-log" aria-labelledby="ex-log-title" aria-live="polite"></ol>` : ''}
                </div>
            </div>`
    const codeBlock = `<div class="ex-code">
                ${setups}
                <div class="ex-source">
                    <div class="code-head"><a href="${sourceUrl}${fileName}">${fileName}</a><button type="button" class="button-quiet" data-copy="${escapeHtml(source)}">Copy</button></div>
                    <pre class="code" tabindex="0"><code>${code}</code></pre>
                </div>
            </div>`

    return page(`${example.title}: uiconfig.js examples`, example.summary.replace(/`/g, ''), `${topbar('./')}
<main id="main" class="ex-main" data-example="${example.slug}" data-renderers="${example.renderers.join(' ')}"${example.theme === false ? ' data-theme="off"' : ''}>
    <div class="wrap">
        <nav class="ex-crumbs" aria-label="Breadcrumb"><a href="./">Examples</a> <span aria-hidden="true">/</span> <a href="./#${topic.id}">${escapeHtml(topic.title)}</a></nav>
        <header class="ex-head">
            <h1>${escapeHtml(example.title)}</h1>
            <p class="ex-summary">${inline(example.summary)}</p>
            ${switcher}
        </header>
        <div class="ex-grid${example.view ? ' has-view' : ''}">
            ${example.view ? live + '\n            ' + codeBlock : codeBlock + '\n            ' + live}
        </div>
        ${pager}
    </div>
</main>`)
}

/** The HTML of the page at `rel` (a path in examplePagePaths), or undefined. */
export function examplePageHtml(rel) {
    if (rel === 'examples/index.html') return indexPage()
    const i = examples.findIndex(e => `examples/${e.slug}.html` === rel)
    return i < 0 ? undefined : examplePage(examples[i], i)
}
