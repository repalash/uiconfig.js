// Assembles the GitHub Pages site in website/_site from the outputs that `npm run pages` builds:
//
//   /                  landing page (website/dist)
//   /examples/         example pages (website/dist: index.html and <slug>.html, see src/examples/registry.js)
//   /docs/             API docs of uiconfig.js, uiconfig-tweakpane and uiconfig-blueprint in one TypeDoc site
//                      (website/dist-docs: modules/<package>.html, <kind>/<package>.<Name>.html)
//   /dist/             the built uiconfig.js package
//   /README.md, /LICENSE of uiconfig.js
//
// Older URLs get small redirect pages to the page that replaced them:
// - the uiconfig.js TypeDoc at the root of the site (/classes/X.html, /modules.html, …), and later in /docs/
//   (/docs/classes/X.html), to /docs/classes/uiconfig.js.X.html;
// - the TypeDoc sites of the renderers (/docs/uiconfig-tweakpane/classes/UI.html, …) to
//   /docs/classes/uiconfig-tweakpane.UI.html, their index and modules pages to /docs/modules/<package>.html;
// - the example pages of the three packages (/examples/html/*.html, /examples/examples/*.html,
//   /examples/uiconfig-tweakpane/…, /examples/uiconfig-blueprint/…) to the example that covers them.
// The old docs' CHANGELOG and LICENSE files are copied to their old paths.
//
// For search engines and AI agents: sitemap.xml (every page, not the redirect pages), robots.txt, and the Markdown of
// scripts/llms.mjs: /llms.txt, /llms-full.txt, /md/ (guide, renderer READMEs, API reference) and examples/<slug>.md.
// Their absolute URLs come from SITE_URL (scripts/site.mjs); every link on the pages stays relative.
import {cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import {agentDocs} from './llms.mjs'
import {absoluteUrl, siteUrl} from './site.mjs'

const website = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repo = path.resolve(website, '..')
const out = path.join(website, '_site')
const core = path.join(repo, 'packages/uiconfig.js')
const tweakpane = path.join(repo, 'packages/uiconfig-tweakpane')
const blueprint = path.join(repo, 'packages/uiconfig-blueprint')
const docs = path.join(website, 'dist-docs')
const docsMarkdown = path.join(website, 'dist-docs-md')
const packages = ['uiconfig.js', 'uiconfig-tweakpane', 'uiconfig-blueprint']

// [source, destination in _site, command that builds the source]
const parts = [
    [path.join(website, 'dist'), '.', 'npm run build -w uiconfig-website'],
    [docs, 'docs', 'npm run docs -w uiconfig-website'],
    [path.join(core, 'dist'), 'dist', 'npm run build -w uiconfig.js'],
    [path.join(core, 'README.md'), 'README.md', ''],
    [path.join(core, 'LICENSE'), 'LICENSE', ''],
    // files of the old docs sites, at their old paths
    [path.join(core, 'CHANGELOG.md'), 'media/CHANGELOG.md', ''],
    [path.join(core, 'LICENSE'), 'docs/LICENSE', ''],
    [path.join(tweakpane, 'LICENSE'), 'docs/uiconfig-tweakpane/LICENSE', ''],
    [path.join(blueprint, 'LICENSE'), 'docs/uiconfig-blueprint/LICENSE', ''],
]

// dist-docs-md: the API reference in Markdown, for the agent docs (not copied as a whole)
const missing = [...parts, [docsMarkdown, null, 'npm run docs -w uiconfig-website']].filter(([src]) => !existsSync(src))
if (missing.length) {
    for (const [src, , cmd] of missing) console.error(`missing ${path.relative(repo, src)}${cmd ? ` (build it with: ${cmd})` : ''}`)
    process.exit(1)
}

rmSync(out, {recursive: true, force: true})
mkdirSync(out, {recursive: true})

/** Copies src to dest and refuses to overwrite: the parts of the layout must not overlap. */
function copy(src, dest) {
    if (statSync(src).isDirectory()) {
        mkdirSync(dest, {recursive: true})
        for (const name of readdirSync(src)) copy(path.join(src, name), path.join(dest, name))
        return
    }
    if (existsSync(dest)) throw new Error(`${path.relative(out, dest)} exists already, from another part of the site`)
    mkdirSync(path.dirname(dest), {recursive: true})
    cpSync(src, dest)
}

for (const [src, dest] of parts) copy(src, path.join(out, dest))
// the old docs had the changelog in docs/media as well; the new docs have it there only if a README links it
if (!existsSync(path.join(out, 'docs/media/CHANGELOG.md'))) copy(path.join(core, 'CHANGELOG.md'), path.join(out, 'docs/media/CHANGELOG.md'))

// ---------------------------------------------------------------- redirect pages

const escapeHtml = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
// the visitor's query and hash go along; a target with a query of its own gets the visitor's appended
const redirectPage = target => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved to ${escapeHtml(target)}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${escapeHtml(target)}">
<meta http-equiv="refresh" content="0; url=${escapeHtml(target)}">
<script>location.replace(${JSON.stringify(target)} + (location.search ? (${JSON.stringify(target.includes('?') ? '&' : '?')} + location.search.slice(1)) : '') + location.hash)</script>
</head>
<body>
<p>This page moved to <a href="${escapeHtml(target)}">${escapeHtml(target)}</a>.</p>
</body>
</html>
`

const redirects = new Map() // old path -> new path (with an optional query), both relative to _site
function redirect(from, to) {
    if (redirects.has(from) && redirects.get(from) !== to) throw new Error(`two redirects from ${from}`)
    redirects.set(from, to)
}

// API docs: every page of a package in the new docs, at its old paths
const kinds = readdirSync(docs).filter(d => statSync(path.join(docs, d)).isDirectory() && !['assets', 'media', 'modules'].includes(d))
for (const kind of kinds) {
    for (const file of readdirSync(path.join(docs, kind))) {
        const pkg = packages.slice().sort((a, b) => b.length - a.length).find(p => file.startsWith(p + '.'))
        if (!pkg) throw new Error(`dist-docs/${kind}/${file}: no package prefix`)
        const name = file.slice(pkg.length + 1)
        const to = `docs/${kind}/${file}`
        if (pkg === 'uiconfig.js') {
            redirect(`${kind}/${name}`, to)
            redirect(`docs/${kind}/${name}`, to)
        } else {
            redirect(`docs/${pkg}/${kind}/${name}`, to)
        }
    }
}
redirect('modules.html', 'docs/modules/uiconfig.js.html')
redirect('hierarchy.html', 'docs/hierarchy.html')
for (const pkg of packages.slice(1)) {
    redirect(`docs/${pkg}/index.html`, `docs/modules/${pkg}.html`)
    redirect(`docs/${pkg}/modules.html`, `docs/modules/${pkg}.html`)
    redirect(`docs/${pkg}/hierarchy.html`, 'docs/hierarchy.html')
}

// example pages: [old page names, new example, renderer of the old page]
const oldExamples = {
    object_syntax_js: ['object-syntax', 'tweakpane'],
    object_syntax_ts: ['object-syntax', 'tweakpane'],
    class_syntax_js: ['class-syntax', 'tweakpane'],
    class_syntax_ts: ['class-syntax', 'tweakpane'],
    class_decorator_syntax_ts: ['decorators', 'blueprint'],
    path_syntax: ['path-binding', 'blueprint'],
    threepipe_basic: ['threepipe', 'blueprint'],
}
const target = (slug, renderer) => `examples/${slug}.html${renderer ? `?renderer=${renderer}` : ''}`
for (const [old, [slug, renderer]] of Object.entries(oldExamples)) {
    // uiconfig.js: examples/html/ (and examples/examples/ in an older layout)
    redirect(`examples/html/${old}.html`, target(slug, renderer))
    redirect(`examples/examples/${old}.html`, target(slug, renderer))
    // uiconfig-blueprint: the same pages, in Blueprint
    redirect(`examples/uiconfig-blueprint/examples/${old}.html`, target(slug, 'blueprint'))
}
const oldTweakpaneExamples = {
    'path-syntax': 'path-binding',
    'dynamic-children': 'dynamic-children',
    'threepipe': 'threepipe',
    'threepipe-pick': 'threepipe-picking',
}
for (const [old, slug] of Object.entries(oldTweakpaneExamples)) redirect(`examples/uiconfig-tweakpane/examples/${old}.html`, target(slug, 'tweakpane'))
redirect('examples/uiconfig-tweakpane/index.html', 'examples/index.html')
redirect('examples/uiconfig-blueprint/index.html', 'examples/index.html')

for (const [from, to] of redirects) {
    const dest = path.join(out, from)
    if (existsSync(dest)) throw new Error(`old path ${from} is taken by the new site`)
    if (!existsSync(path.join(out, to.split('?')[0]))) throw new Error(`redirect from ${from} to ${to}: no such page`)
    mkdirSync(path.dirname(dest), {recursive: true})
    writeFileSync(dest, redirectPage(path.posix.relative(path.posix.dirname(from), to)))
}

// ---------------------------------------------------------------- agent docs, sitemap, robots.txt

const read = file => readFileSync(file, 'utf8')
const agentFiles = agentDocs({
    guide: read(path.join(core, 'README.md')),
    readmes: {'uiconfig-tweakpane': read(path.join(tweakpane, 'README.md')), 'uiconfig-blueprint': read(path.join(blueprint, 'README.md'))},
    api: Object.fromEntries(packages.map(p => [p, read(path.join(docsMarkdown, `${p}.md`))])),
})
for (const [rel, text] of Object.entries(agentFiles)) {
    const dest = path.join(out, rel)
    if (existsSync(dest)) throw new Error(`${rel} exists already`)
    mkdirSync(path.dirname(dest), {recursive: true})
    writeFileSync(dest, text)
}

// every HTML page except the redirect pages
const pages = []
function walkPages(dir) {
    for (const name of readdirSync(dir).sort()) {
        const file = path.join(dir, name)
        const rel = path.relative(out, file).split(path.sep).join('/')
        if (statSync(file).isDirectory()) {
            if (!['assets', 'dist'].includes(rel) && rel !== 'docs/assets') walkPages(file)
        } else if (name.endsWith('.html') && !redirects.has(rel)) {
            pages.push(rel.replace(/(^|\/)index\.html$/, '$1'))
        }
    }
}
walkPages(out)
// the landing page first, then the examples, then the docs
const rank = p => p === '' ? 0 : p.startsWith('examples/') ? 1 : 2
pages.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `<url><loc>${absoluteUrl(p)}</loc></url>`).join('\n')}
</urlset>
`)
// read by crawlers only at the root of a host: at ${siteUrl} it counts when the site has a domain of its own
writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('sitemap.xml')}\n`)

console.log(`website/_site for ${siteUrl}: ${parts.length} parts, ${redirects.size} redirect pages, ${pages.length} pages in sitemap.xml, ${Object.keys(agentFiles).length} Markdown files for llms.txt`)
