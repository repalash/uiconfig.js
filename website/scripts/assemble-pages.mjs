// Assembles the GitHub Pages site in website/_site from the outputs that `npm run pages` builds:
//
//   /                              landing page (website/dist)
//   /docs/                         TypeDoc of uiconfig.js
//   /docs/uiconfig-tweakpane/      TypeDoc of uiconfig-tweakpane
//   /docs/uiconfig-blueprint/      TypeDoc of uiconfig-blueprint
//   /examples/                     example pages of uiconfig.js
//   /examples/uiconfig-tweakpane/  example pages of uiconfig-tweakpane
//   /examples/uiconfig-blueprint/  example pages of uiconfig-blueprint
//   /dist/                         the built uiconfig.js package
//   /README.md, /LICENSE           of uiconfig.js (and a LICENSE in each docs folder)
//
// The uiconfig.js TypeDoc was at the root of the site before. Its old page URLs (/classes/X.html,
// /modules.html, …) get small redirect pages to docs/<same path>, generated from the TypeDoc output, and
// its other files outside assets/ (media/CHANGELOG.md) are copied to their old paths as well.
// Every path is relative, so the site works under any base path.
import {cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync} from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const website = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const repo = path.resolve(website, '..')
const out = path.join(website, '_site')
const core = path.join(repo, 'packages/uiconfig.js')
const tweakpane = path.join(repo, 'packages/uiconfig-tweakpane')
const blueprint = path.join(repo, 'packages/uiconfig-blueprint')

// [source, destination in _site, command that builds the source]
const parts = [
    [path.join(website, 'dist'), '.', 'npm run build -w uiconfig-website'],
    [path.join(core, 'docs'), 'docs', 'npm run docs -w uiconfig.js'],
    [path.join(tweakpane, 'docs'), 'docs/uiconfig-tweakpane', 'npm run docs -w uiconfig-tweakpane'],
    [path.join(blueprint, 'docs'), 'docs/uiconfig-blueprint', 'npm run docs -w uiconfig-blueprint'],
    [path.join(core, 'examples/dist'), 'examples', 'npm run examples:build -w uiconfig.js'],
    [path.join(tweakpane, 'dist-examples'), 'examples/uiconfig-tweakpane', 'npm run examples:build -w uiconfig-tweakpane'],
    [path.join(blueprint, 'dist-examples'), 'examples/uiconfig-blueprint', 'npm run build-examples -w uiconfig-blueprint'],
    [path.join(core, 'dist'), 'dist', 'npm run build -w uiconfig.js'],
    [path.join(core, 'README.md'), 'README.md', ''],
    [path.join(core, 'LICENSE'), 'LICENSE', ''],
    // the READMEs on the TypeDoc index pages link ./LICENSE
    [path.join(core, 'LICENSE'), 'docs/LICENSE', ''],
    [path.join(tweakpane, 'LICENSE'), 'docs/uiconfig-tweakpane/LICENSE', ''],
    [path.join(blueprint, 'LICENSE'), 'docs/uiconfig-blueprint/LICENSE', ''],
]

const missing = parts.filter(([src]) => !existsSync(src))
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

// redirects from the old uiconfig.js TypeDoc paths at the root to docs/
const escapeHtml = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const redirectPage = target => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved to ${escapeHtml(target)}</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${escapeHtml(target)}">
<meta http-equiv="refresh" content="0; url=${escapeHtml(target)}">
<script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script>
</head>
<body>
<p>This page moved to <a href="${escapeHtml(target)}">${escapeHtml(target)}</a>.</p>
</body>
</html>
`

const coreDocs = path.join(core, 'docs')
let redirects = 0
let copies = 0
function walkOldDocs(dir) {
    for (const name of readdirSync(dir)) {
        const file = path.join(dir, name)
        const rel = path.relative(coreDocs, file).split(path.sep).join('/')
        if (rel === 'assets' || rel === 'index.html' || name === '.nojekyll') continue // the landing page is the new root
        if (statSync(file).isDirectory()) {
            walkOldDocs(file)
            continue
        }
        const dest = path.join(out, rel)
        if (existsSync(dest)) throw new Error(`old docs path ${rel} is taken by the new site`)
        mkdirSync(path.dirname(dest), {recursive: true})
        if (rel.endsWith('.html')) {
            const up = '../'.repeat(rel.split('/').length - 1)
            writeFileSync(dest, redirectPage(`${up}docs/${rel}`))
            redirects++
        } else {
            cpSync(file, dest)
            copies++
        }
    }
}
walkOldDocs(coreDocs)

console.log(`website/_site: ${parts.length} parts, ${redirects} redirect pages and ${copies} copied files at the old docs paths`)
