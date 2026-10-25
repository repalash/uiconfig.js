import {defineConfig} from 'vite'

// The landing page. base './' keeps every URL relative, so the same build works under
// https://repalash.com/uiconfig.js/ and at the root of a domain.
// uiconfig.js, uiconfig-tweakpane and uiconfig-blueprint resolve to the workspace packages (their built dist).
export default defineConfig({
    base: './',
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
