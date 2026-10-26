// Finishes the API docs that `typedoc` (typedoc.json) writes to dist-docs:
// - dist-docs/assets/custom.css becomes the site's font faces (Inter and JetBrains Mono from src/styles/fonts.css,
//   with their files copied to assets/fonts), src/styles/tokens.css and src/docs/docs.css. TypeDoc links custom.css
//   from every page (the customCss option) but copies only that one file, so the fonts and tokens are added here.
// - on the module pages, the package README sits under the page's h1: its headings move one level down;
// - every page gets a description of its own (TypeDoc writes "Documentation for …" on all of them), its canonical
//   link and the Open Graph tags (scripts/site.mjs).
import {copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {socialTags} from './site.mjs'

const website = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const docs = path.join(website, 'dist-docs')
const assets = path.join(docs, 'assets')
if (!existsSync(path.join(assets, 'custom.css'))) {
    console.error('dist-docs/assets/custom.css is missing: run typedoc first (npm run docs -w uiconfig-website)')
    process.exit(1)
}
const require = createRequire(path.join(website, 'package.json'))
const read = rel => readFileSync(path.join(website, rel), 'utf8')

// ---- theme
mkdirSync(path.join(assets, 'fonts'), {recursive: true})
const faces = read('src/styles/fonts.css').match(/@font-face \{[\s\S]*?\n\}/g)
    .filter(face => /font-family: '(Inter Variable|JetBrains Mono)'/.test(face))
    .map(face => face.replace(/url\('([^']+)'\)/g, (_, spec) => {
        const name = path.basename(spec)
        copyFileSync(require.resolve(spec), path.join(assets, 'fonts', name))
        return `url('fonts/${name}')`
    }))
writeFileSync(path.join(assets, 'custom.css'), [
    '/* uiconfig site theme for TypeDoc: written by website/scripts/docs-finish.mjs */',
    ...faces, read('src/styles/tokens.css'), read('src/docs/docs.css'),
].join('\n\n'))

// ---- descriptions, canonical links, Open Graph
const packages = {
    'uiconfig.js': 'uiconfig.js holds the config types, the decorators and the renderer base classes for UI panels made from config objects.',
    'uiconfig-tweakpane': 'uiconfig-tweakpane renders uiconfig configs as Tweakpane panels, with optional themes.',
    'uiconfig-blueprint': 'uiconfig-blueprint renders uiconfig configs as Blueprint (React) panels.',
}
// pages whose TypeDoc title is the project name alone
const titles = {
    'index.html': 'uiconfig.js API reference',
    'modules.html': 'Packages | uiconfig.js API',
    'hierarchy.html': 'Hierarchy | uiconfig.js API',
}
const special = {
    'index.html': 'API reference of uiconfig.js, uiconfig-tweakpane and uiconfig-blueprint: config types and decorators for UI panels from config objects, and the Tweakpane and Blueprint renderers.',
    'modules.html': 'The packages of uiconfig.js: uiconfig.js (config types and decorators), uiconfig-tweakpane and uiconfig-blueprint (renderers).',
    'hierarchy.html': 'Class and interface hierarchy of uiconfig.js, uiconfig-tweakpane and uiconfig-blueprint.',
}
const text = html => html.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
const clip = (s, n = 200) => s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n - 1)) + '…'
const escapeAttr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

function describe(rel, html) {
    if (special[rel]) return special[rel]
    const h1 = text(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '')
    const pkg = Object.keys(packages).sort((a, b) => b.length - a.length).find(p => path.basename(rel).startsWith(p + '.'))
    if (rel.startsWith('modules/')) {
        const name = path.basename(rel, '.html')
        return `API reference of ${name}. ${packages[name] ?? ''}`.trim()
    }
    // the page's own comment: right after the title (classes, interfaces), or of the first signature (functions)
    const comment = html.match(/<\/h1><\/div>\s*<section class="tsd-panel tsd-comment">\s*<div class="tsd-comment tsd-typography">([\s\S]*?)<\/div>/) ??
        (rel.startsWith('functions/') ? html.match(/<div class="tsd-description">\s*<div class="tsd-comment tsd-typography">([\s\S]*?)<\/div>/) : null)
    const summary = text(comment?.[1] ?? '')
    return clip(summary ? `${h1} in ${pkg}: ${summary}` : `${h1} in ${pkg}, API reference. ${packages[pkg]}`)
}

let pages = 0
function walk(dir) {
    for (const name of readdirSync(dir)) {
        const file = path.join(dir, name)
        if (statSync(file).isDirectory()) {
            if (name !== 'assets') walk(file)
            continue
        }
        if (!name.endsWith('.html')) continue
        const rel = path.relative(docs, file).split(path.sep).join('/')
        let html = readFileSync(file, 'utf8')
        // the renderers' pages: "UI | uiconfig-tweakpane API" (both renderers have a UI class)
        const renderer = ['uiconfig-tweakpane', 'uiconfig-blueprint'].find(p => path.basename(rel).startsWith(p + '.'))
        if (titles[rel]) html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${titles[rel]}</title>`)
        else if (renderer) html = html.replace(/ \| uiconfig\.js API<\/title>/, ` | ${renderer} API</title>`)
        const title = text(html.match(/<title>([\s\S]*?)<\/title>/)[1])
        const description = describe(rel, html)
        const page = rel === 'index.html' ? 'docs/' : `docs/${rel}`
        if (rel.startsWith('modules/')) {
            html = html.replace(/(<section class="tsd-panel tsd-typography">)([\s\S]*?)(<\/section>)/, (_, open, body, close) =>
                open + body.replace(/<(\/?)h([1-5])\b/g, (__, slash, n) => `<${slash}h${Number(n) + 1}`) + close)
        }
        html = html.replace(/<meta name="description" content="[^"]*"\/?>/, `<meta name="description" content="${escapeAttr(description)}"/>`)
            .replace('</head>', socialTags({title, description, path: page}) + '</head>')
        writeFileSync(file, html)
        pages++
    }
}
walk(docs)
console.log(`dist-docs: custom.css (${faces.length} font faces, tokens.css, docs.css); descriptions and Open Graph tags on ${pages} pages`)
