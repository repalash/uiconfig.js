import {defineConfig} from 'vite'
import {readdirSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const pages = readdirSync(path.join(root, 'examples')).filter(f => f.endsWith('.html'))

// Static build of the example pages (index.html and examples/*.html) in dist-examples. The pages import the
// renderer from ../src, like the dev server (`npm run examples:dev`); the dependencies come from node_modules.
// The GitHub Pages workflow publishes dist-examples as /examples/uiconfig-tweakpane/.
export default defineConfig({
    root,
    base: './',
    resolve: {
        // one copy of each in every page
        dedupe: ['uiconfig.js', 'ts-browser-helpers', 'tweakpane'],
    },
    build: {
        outDir: 'dist-examples',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index: path.join(root, 'index.html'),
                ...Object.fromEntries(pages.map(f => ['examples/' + f.replace(/\.html$/, ''), path.join(root, 'examples', f)])),
            },
        },
    },
})
