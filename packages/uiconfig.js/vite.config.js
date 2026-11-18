import {defineConfig} from 'vite'
import json from '@rollup/plugin-json';
import dts from 'vite-plugin-dts'
import packageJson from './package.json';
import license from 'rollup-plugin-license';
import replace from '@rollup/plugin-replace';
import path from 'node:path';
import {fixDtsImports} from 'dts-js-extensions';
import {externalDeps} from '../../scripts/external-deps.mjs';

const isProd = process.env.NODE_ENV === 'production'
const { name, version, author } = packageJson
const {main, module, browser} = packageJson

// `vite build`: the ESM bundles (dist/index.mjs, and dist/dom.mjs for `uiconfig.js/dom`) with the dependencies external,
// and the declarations.
// `vite build --mode umd`: the self-contained bundles, added to dist: UMD (dist/index.js) for script tags and CDN links,
// CommonJS (dist/index.cjs) for require(). A .js file in this "type": "module" package loads as ESM in Node and
// bundlers, where the UMD wrapper finds no `module` and returns nothing.
export default defineConfig(({mode}) => {
    const umd = mode === 'umd'
    return {
        optimizeDeps: {
            exclude: [],
        },
        // define: {
        //     'process.env': process.env
        // },
        build: {
            sourcemap: true,
            minify: isProd,
            cssMinify: isProd,
            cssCodeSplit: false,
            watch: !isProd ? {
                buildDelay: 1000,
            } : null,
            lib: {
                // the ES modules: the core (dist/index.mjs) and the plain-DOM form `uiconfig.js/dom` (dist/dom.mjs, which
                // imports the core from ./index.mjs). The UMD and CommonJS bundles are the core only.
                entry: umd ? 'src/index.ts' : {index: 'src/index.ts', dom: 'src/dom/index.ts'},
                formats: umd ? ['umd', 'cjs'] : ['es'],
                name: name,
                fileName: (format, entryName) => umd ?
                    ({umd: browser, cjs: main}[format] ?? module).replace('dist/', '') :
                    entryName === 'index' ? module.replace('dist/', '') : `${entryName}.mjs`,
            },
            outDir: 'dist',
            emptyOutDir: isProd && !umd,
            commonjsOptions: {
                exclude: [],
            },
            rollupOptions: {
                output: {
                    // inlineDynamicImports: false,
                    // the code that both ES entries use (index.mjs and dom.mjs import it): one file with a stable name
                    chunkFileNames: 'core.mjs',
                },
                external: umd ? [] : externalDeps(packageJson),
            },
        },
        plugins: [
            isProd && !umd ? dts({tsconfigPath: './tsconfig.json', afterBuild: fixDtsImports}) : null,
            replace({
                'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
                preventAssignment: true,
            }),
            json(),
            license({
                banner: `
        @license
        ${name} v${version}
        Copyright 2022<%= moment().format('YYYY') > 2022 ? '-' + moment().format('YYYY') : null %> ${author}
        ${packageJson.license} License
        See ./dependencies.txt for bundled third-party dependencies and licenses.
      `,
                thirdParty: {
                    output: path.join(__dirname, 'dist', 'dependencies.txt'),
                    includePrivate: true, // Default is false.
                },
            }),
        ],
    }
})
