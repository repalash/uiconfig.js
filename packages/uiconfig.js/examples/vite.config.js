import {defineConfig} from 'vite'
import {readdirSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const pages = readdirSync(path.join(root, 'html')).filter(f => f.endsWith('.html'))

// The example pages import the workspace packages by name (uiconfig.js, uiconfig-tweakpane, uiconfig-blueprint).
// npm workspaces link them into node_modules, so the pages get their built dist/index.mjs, the files that npm
// publishes; build those packages first (see "Examples" in ../README.md).
// Output: dist/index.html and dist/html/<page>.html, which the Pages workflow publishes as /examples/.
export default defineConfig({
    root,
    base: './',
    resolve: {
        // one copy of each in every page
        dedupe: ['uiconfig.js', 'ts-browser-helpers', 'react', 'react-dom'],
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        // the uiconfig-blueprint bundle carries its stylesheet as a string of about 3 MB
        chunkSizeWarningLimit: 4000,
        rollupOptions: {
            input: {
                index: path.join(root, 'index.html'),
                ...Object.fromEntries(pages.map(f => ['html/' + f.replace(/\.html$/, ''), path.join(root, 'html', f)])),
            },
        },
    },
})
