// Makes website/public/og.png, the 1200×630 card that links to the site show on social sites and in chats
// (og:image, see scripts/site.mjs). Run it after a change of the design and commit the image: the Pages build does
// not render it.
//
//   npm run og-image -w uiconfig-website          # needs Chromium; CHROME_PATH=/path/to/chrome to pick one
//
// CHROME_ARGS adds flags, for example CHROME_ARGS=--no-sandbox in a container without a usable sandbox (the page
// is the local template above, nothing from the network).
//
// The card is an HTML page in the site's style (fonts.css, tokens.css, site.css and the hero figure of
// src/figures), screenshotted by headless Chromium.
import {execFileSync} from 'node:child_process'
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import os from 'node:os'
import path from 'node:path'
import {fileURLToPath, pathToFileURL} from 'node:url'
import {heroFigure} from '../src/figures/hero-figure.js'
import {ogImage, siteUrl} from './site.mjs'

const website = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(path.join(website, 'package.json'))
const read = rel => readFileSync(path.join(website, rel), 'utf8')
// font files from node_modules, as file URLs
const fonts = read('src/styles/fonts.css').replace(/url\('([^']+)'\)/g, (_, spec) => `url('${pathToFileURL(require.resolve(spec)).href}')`)

const html = `<!DOCTYPE html>
<html lang="en" data-scheme="light">
<head>
<meta charset="utf-8">
<style>
${fonts}
${read('src/styles/tokens.css')}
${read('src/styles/site.css')}
html, html body { margin: 0; width: ${ogImage.width}px; height: ${ogImage.height}px; overflow: hidden; }
.card {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: 64px 72px;
    display: grid;
    grid-template-columns: 1fr 470px;
    gap: 48px;
    align-items: center;
    background: var(--paper);
    border-top: 10px solid var(--accent);
}
.wordmark { font-size: 108px; margin: 0 0 22px; }
.pitch { margin: 0 0 18px; font-size: 38px; line-height: 1.15; font-weight: 650; letter-spacing: -0.02em; color: var(--ink); }
.sub { margin: 0 0 30px; font-size: 22px; line-height: 1.4; color: var(--ink-2); max-width: 30ch; }
.legend { gap: 10px 26px; font-size: 19px; color: var(--ink-2); }
.iso-card { font-size: 15px; padding: 14px 18px 16px; }
.iso-card .fig-hero { margin: 6px 0; }
</style>
</head>
<body>
<div class="card">
    <div>
        <h1 class="wordmark">uiconfig.js</h1>
        <p class="pitch">UI panels from config objects</p>
        <p class="sub">Bind plain objects or TypeScript decorators to your data, and render them with Tweakpane, Blueprint or your own renderer.</p>
        <ul class="legend">
            <li class="key" style="--h: var(--c-data)">data</li>
            <li class="key" style="--h: var(--c-config)">config</li>
            <li class="key" style="--h: var(--c-tweakpane)">Tweakpane</li>
            <li class="key" style="--h: var(--c-blueprint)">Blueprint</li>
        </ul>
    </div>
    <figure class="iso-card">
        <div class="iso-card-top"><span>${new URL(siteUrl).host + new URL(siteUrl).pathname.replace(/\/$/, '')}</span><span>MIT</span></div>
        ${heroFigure()}
        <div class="iso-card-bottom"><span>npm install uiconfig-tweakpane</span><span></span></div>
    </figure>
</div>
</body>
</html>
`

const dir = mkdtempSync(path.join(os.tmpdir(), 'uiconfig-og-'))
try {
    const page = path.join(dir, 'og.html')
    writeFileSync(page, html)
    const out = path.join(website, 'public', ogImage.path)
    execFileSync(process.env.CHROME_PATH || 'chromium', [
        '--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1', `--user-data-dir=${path.join(dir, 'profile')}`,
        `--window-size=${ogImage.width},${ogImage.height}`, `--screenshot=${out}`, '--virtual-time-budget=2000',
        ...(process.env.CHROME_ARGS ? process.env.CHROME_ARGS.split(' ') : []),
        pathToFileURL(page).href,
    ], {stdio: 'inherit'})
    console.log(`website/public/${ogImage.path}: ${ogImage.width}×${ogImage.height}`)
} finally {
    rmSync(dir, {recursive: true, force: true})
}
