import {defineConfig} from 'vite'
import {readFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {highlightFile, highlightHtmlPage, sampleSource} from './scripts/highlight.mjs'
import {examplePageHtml, examplePagePaths, exampleFile} from './scripts/examples-pages.mjs'
import {absoluteUrl, pageMeta, socialTags} from './scripts/site.mjs'
import {bindingFigure, icons} from './src/figures/figures.js'
import {heroFigure} from './src/figures/hero-figure.js'

// Build-time work on the page, so that it ships neither a highlighter nor the figure geometry:
// - `import html from './file.js?highlight'` gives the highlighted HTML of a sample file, `?sample` its text
//   (the part between `// #region` and `// #endregion`, or the file without its `export {…}` line);
// - <pre data-code="js|ts|sh|html"> blocks in index.html are highlighted;
// - <svg data-figure="name"></svg> placeholders in index.html become the figures of src/figures;
// - every page gets its canonical link and Open Graph tags (scripts/site.mjs: absolute URLs from SITE_URL, made from
//   the page's <title> and description), the landing page its JSON-LD.
// The example pages (examples/index.html, examples/<slug>.html) have no file: examplePages() makes their HTML from
// src/examples/registry.js, for the dev server and for the build.
function site() {
    const figures = {binding: bindingFigure, hero: heroFigure, ...icons}
    const suffix = /\?(highlight|sample)$/
    return {
        name: 'uiconfig-site',
        enforce: 'pre',
        async resolveId(id, importer) {
            const m = id.match(suffix)
            if (!m) return null
            const resolved = await this.resolve(id.slice(0, m.index), importer, {skipSelf: true})
            return resolved && resolved.id + m[0]
        },
        load(id) {
            const m = id.match(suffix)
            if (!m) return null
            const file = id.slice(0, m.index)
            this.addWatchFile(file)
            const text = m[1] === 'highlight' ? highlightFile(file) : sampleSource(readFileSync(file, 'utf8'))
            return `export default ${JSON.stringify(text)}`
        },
        transformIndexHtml(html, ctx) {
            html = addSiteTags(html, path.relative(root, ctx.filename).split(path.sep).join('/'))
            html = html.replace(/<svg data-figure="([\w-]+)"><\/svg>/g, (m, name) => {
                if (!figures[name]) throw new Error(`no figure named ${name}`)
                return figures[name]()
            })
            return highlightHtmlPage(html)
        },
    }
}

const root = path.dirname(fileURLToPath(import.meta.url))

/** Canonical link and Open Graph tags for the page at `rel` (relative to website/), JSON-LD for the landing page. */
function addSiteTags(html, rel) {
    const page = rel === 'index.html' ? '' : rel.replace(/(^|\/)index\.html$/, '$1')
    const {title, description} = pageMeta(html)
    let tags = socialTags({title, description, path: page})
    if (page === '') {
        const data = {
            '@context': 'https://schema.org',
            '@type': 'SoftwareSourceCode',
            name: 'uiconfig.js',
            description,
            url: absoluteUrl(''),
            codeRepository: 'https://github.com/repalash/uiconfig.js',
            programmingLanguage: 'TypeScript',
            license: 'https://opensource.org/licenses/MIT',
            author: {'@type': 'Person', name: 'repalash', url: 'https://repalash.com'},
        }
        tags += `\n    <script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
    }
    return html.replace('</head>', `    ${tags}\n</head>`)
}

function examplePages() {
    const pages = new Map(examplePagePaths.map(rel => [path.join(root, rel), rel]))
    return {
        name: 'uiconfig-example-pages',
        enforce: 'pre',
        resolveId(id) {
            const file = id.startsWith(root) ? id : path.join(root, id)
            return pages.has(file) ? file : null
        },
        load(id) {
            const rel = pages.get(id)
            if (!rel) return null
            // a page shows the code of its example: rebuild it when that file changes
            const slug = path.basename(rel, '.html')
            if (slug !== 'index') this.addWatchFile(exampleFile(slug))
            return examplePageHtml(rel)
        },
        configureServer(server) {
            // the dev server serves an HTML page from its file; these pages have none
            server.middlewares.use(async (req, res, next) => {
                const url = (req.url ?? '').split('?')[0]
                const rel = url.replace(/^\//, '').replace(/\/$/, '/index.html')
                const html = pages.has(path.join(root, rel)) && examplePageHtml(rel)
                if (!html) return next()
                res.setHeader('Content-Type', 'text/html')
                res.end(await server.transformIndexHtml(url, html))
            })
        },
    }
}

// The landing page and the example pages. base './' keeps every URL relative, so the same build works under
// https://repalash.com/uiconfig.js/ and at the root of a domain.
// uiconfig.js, uiconfig-tweakpane and uiconfig-blueprint resolve to the workspace packages (their built dist).
export default defineConfig({
    base: './',
    plugins: [site(), examplePages()],
    resolve: {
        // one copy of each on the page
        dedupe: ['uiconfig.js', 'ts-browser-helpers', 'tweakpane', 'react', 'react-dom', 'three'],
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        target: 'es2022',
        // the uiconfig-blueprint bundle carries its stylesheet as a string of about 3 MB; it is loaded on demand
        chunkSizeWarningLimit: 4000,
        rollupOptions: {
            input: {
                main: path.join(root, 'index.html'),
                ...Object.fromEntries(examplePagePaths.map(rel => [rel.replace(/\.html$/, ''), path.join(root, rel)])),
            },
        },
    },
})
