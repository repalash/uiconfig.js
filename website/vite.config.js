import {defineConfig} from 'vite'
import {readFileSync} from 'node:fs'
import {highlightFile, highlightHtmlPage, sampleSource} from './scripts/highlight.mjs'
import {bindingFigure, icons} from './src/figures/figures.js'

// Build-time work on the page, so that it ships neither a highlighter nor the figure geometry:
// - `import html from './file.js?highlight'` gives the highlighted HTML of a sample file, `?sample` its text
//   (the part between `// #region` and `// #endregion`, or the file without its `export {…}` line);
// - <pre data-code="js|ts|sh|html"> blocks in index.html are highlighted;
// - <svg data-figure="name"></svg> placeholders in index.html become the figures of src/figures.
function site() {
    const figures = {binding: bindingFigure, ...icons}
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
        transformIndexHtml(html) {
            html = html.replace(/<svg data-figure="([\w-]+)"><\/svg>/g, (m, name) => {
                if (!figures[name]) throw new Error(`index.html: no figure named ${name}`)
                return figures[name]()
            })
            return highlightHtmlPage(html)
        },
    }
}

// The landing page. base './' keeps every URL relative, so the same build works under
// https://repalash.com/uiconfig.js/ and at the root of a domain.
// uiconfig.js, uiconfig-tweakpane and uiconfig-blueprint resolve to the workspace packages (their built dist).
export default defineConfig({
    base: './',
    plugins: [site()],
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
    },
})
