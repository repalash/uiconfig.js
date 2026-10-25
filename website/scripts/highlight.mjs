// Build-time syntax highlighting (used by vite.config.js): the code samples reach the page as HTML,
// so the page ships no highlighter. JavaScript and TypeScript go through the Lezer grammar and the
// highlighter that the playground editor uses (src/code-style.js); shell and HTML snippets are simple
// enough for a few rules.
import {readFileSync} from 'node:fs'
import {parser} from '@lezer/javascript'
import {highlightCode} from '@lezer/highlight'
import {decoratorTags, tokenHighlighter} from '../src/code-style.js'

const escapeHtml = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const unescapeHtml = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')

const parsers = {
    js: parser.configure({props: [decoratorTags]}),
    ts: parser.configure({props: [decoratorTags], dialect: 'ts'}),
}

function highlightJs(code, lang = 'js') {
    let html = ''
    highlightCode(code, parsers[lang].parse(code), tokenHighlighter,
        (text, classes) => { html += classes ? `<span class="${classes}">${escapeHtml(text)}</span>` : escapeHtml(text) },
        () => { html += '\n' })
    return html
}

function highlightSh(code) {
    return code.split('\n').map(line => {
        const i = line.indexOf('#')
        const cmd = escapeHtml(i < 0 ? line : line.slice(0, i))
            .replace(/^(\s*)(npm|npx|node)\b/, '$1<span class="tk-call">$2</span>')
        return i < 0 ? cmd : cmd + `<span class="tk-comment">${escapeHtml(line.slice(i))}</span>`
    }).join('\n')
}

function highlightHtml(code) {
    // tags and attributes; the body of a <script> element is JavaScript
    return code.split(/(<script[^>]*>)([\s\S]*?)(?=<\/script>)/).map((part, i) => {
        if (i % 3 === 2) return highlightJs(part)
        return escapeHtml(part).replace(/(&lt;\/?)([a-z][\w-]*)((?:\s+[a-z-]+(?:="[^"]*")?)*)(\s*\/?&gt;)/g,
            (_, open, name, attrs, close) => `<span class="tk-punct">${open}</span><span class="tk-keyword">${name}</span>` +
                attrs.replace(/([a-z-]+)(="[^"]*")?/g, (_a, n, v) => `<span class="tk-property">${n}</span>${v ? `<span class="tk-punct">=</span><span class="tk-string">${v.slice(1)}</span>` : ''}`) +
                `<span class="tk-punct">${close}</span>`)
    }).join('')
}

export function highlight(code, lang) {
    if (lang === 'sh') return highlightSh(code)
    if (lang === 'html') return highlightHtml(code)
    return highlightJs(code, lang === 'ts' ? 'ts' : 'js')
}

/**
 * The part of a sample file that the page shows: the lines between `// #region` and `// #endregion` (each region
 * de-indented, several regions joined with an empty line) if the file has them, otherwise the file without its
 * `export {…}` line.
 */
export function sampleSource(raw) {
    const regions = [...raw.matchAll(/\/\/ #region\n([\s\S]*?)\n\s*\/\/ #endregion/g)]
    if (regions.length) {
        return regions.map(region => {
            const lines = region[1].split('\n')
            const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length))
            return lines.map(l => l.slice(indent)).join('\n')
        }).join('\n\n')
    }
    return raw.replace(/^export \{[^}]*\}\n?/m, '').trimEnd()
}

/** Highlighted HTML of a sample file (see sampleSource). */
export function highlightFile(file) {
    return highlight(sampleSource(readFileSync(file, 'utf8')), file.endsWith('.ts') ? 'ts' : 'js')
}

/** Highlights the text of every <pre data-code="js|ts|sh|html"><code>…</code></pre> in an HTML page. */
export function highlightHtmlPage(page) {
    return page.replace(/(<pre\b[^>]*\bdata-code="(\w+)"[^>]*>\s*<code[^>]*>)([\s\S]*?)(<\/code>)/g,
        (_, open, lang, body, close) => open + highlight(unescapeHtml(body), lang) + close)
}
