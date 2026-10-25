// A small syntax highlighter for the JavaScript, TypeScript, HTML and shell snippets on the page.
// It splits the source into tokens with one regular expression and wraps the interesting ones in
// <span class="tk-…">. It does not parse: it only has to color short, well-formed samples.

const KEYWORDS = new Set([
    'const', 'let', 'var', 'function', 'return', 'class', 'new', 'this', 'import', 'from', 'export', 'default',
    'if', 'else', 'for', 'of', 'in', 'while', 'true', 'false', 'null', 'undefined', 'implements', 'extends',
    'declare', 'async', 'await', 'typeof', 'type', 'interface', 'as', 'void',
])

const TOKEN = new RegExp([
    /(?<comment>\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)/.source,
    /(?<string>'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"|`(?:\\.|[^`\\])*`)/.source,
    /(?<decorator>@[A-Za-z_$][\w$]*)/.source,
    /(?<tag><\/?[a-zA-Z][\w-]*|\/?>)/.source,
    /(?<number>\b\d+(?:\.\d+)?\b)/.source,
    /(?<word>[A-Za-z_$][\w$-]*)/.source,
].join('|'), 'g')

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export function highlight(source: string, lang: 'js' | 'html' | 'sh' = 'js'): string {
    if (lang === 'html') {
        // the body of a <script> element is JavaScript
        return source.split(/(<script[^>]*>)([\s\S]*?)(?=<\/script>)/).map((part, i) =>
            highlightTokens(part, i % 3 === 2 ? 'js' : 'html')).join('')
    }
    if (lang === 'sh') {
        return source.split('\n').map(line => {
            const i = line.indexOf('#')
            return i < 0 ? escapeHtml(line) : escapeHtml(line.slice(0, i)) + `<span class="tk-comment">${escapeHtml(line.slice(i))}</span>`
        }).join('\n')
    }
    return highlightTokens(source, 'js')
}

function highlightTokens(source: string, lang: 'js' | 'html'): string {
    let out = ''
    let last = 0
    for (const m of source.matchAll(TOKEN)) {
        const g = m.groups!
        const text = m[0]
        out += escapeHtml(source.slice(last, m.index))
        last = m.index! + text.length
        let cls = ''
        if (g.comment) cls = 'comment'
        else if (g.string) cls = 'string'
        else if (g.decorator) cls = 'decorator'
        else if (g.tag) cls = lang === 'html' ? 'keyword' : ''
        else if (g.number) cls = 'number'
        else if (g.word) {
            const next = source.slice(last).match(/^\s*(.)/)?.[1]
            if (lang === 'js' && !text.includes('-') && KEYWORDS.has(text)) cls = 'keyword'
            else if (next === ':' && lang === 'js') cls = 'property'
            else if (next === '=' && lang === 'html') cls = 'property'
            else if (next === '(') cls = 'call'
            else if (/^[A-Z]/.test(text)) cls = 'type'
        }
        out += cls ? `<span class="tk-${cls}">${escapeHtml(text)}</span>` : escapeHtml(text)
    }
    return out + escapeHtml(source.slice(last))
}

/** Fills every `<pre data-code="lang">` that holds plain text with highlighted markup. */
export function highlightStatic(root: ParentNode = document) {
    for (const pre of root.querySelectorAll<HTMLElement>('pre[data-code]')) {
        // code blocks can scroll sideways: keyboard users reach them with Tab
        if (!pre.hasAttribute('tabindex')) pre.tabIndex = 0
        const code = pre.querySelector('code') ?? pre
        code.innerHTML = highlight(code.textContent ?? '', (pre.dataset.code || 'js') as 'js' | 'html' | 'sh')
    }
}
