import {defineConfig} from 'vite'
import dts from 'vite-plugin-dts'
import packageJson from './package.json'
import license from 'rollup-plugin-license'
import replace from '@rollup/plugin-replace'
import path from 'node:path'
import {fixDtsImports} from 'dts-js-extensions'
import {externalDeps} from '../../scripts/external-deps.mjs'

const isProd = process.env.NODE_ENV === 'production'
const {name, version, author, module} = packageJson

// `vite build`: the ES module (dist/index.mjs) and the declarations. Its dependencies (uiconfig.js, ts-browser-helpers)
// stay imports, so the app's bundler keeps one copy of uiconfig.js. No UMD or CommonJS bundle: those are deprecated in
// the other packages of this repository.
export default defineConfig({
    build: {
        sourcemap: true,
        minify: isProd,
        watch: !isProd ? {
            buildDelay: 1000,
        } : null,
        lib: {
            entry: 'src/index.ts',
            formats: ['es'],
            fileName: () => module.replace('dist/', ''),
        },
        outDir: 'dist',
        emptyOutDir: isProd,
        rollupOptions: {
            external: externalDeps(packageJson),
        },
    },
    plugins: [
        isProd ? dts({tsconfigPath: './tsconfig.json', afterBuild: fixDtsImports}) : null,
        replace({
            'process.env.NODE_ENV': JSON.stringify(isProd ? 'production' : 'development'),
            preventAssignment: true,
        }),
        license({
            banner: `
        @license
        ${name} v${version}
        Copyright 2026<%= moment().format('YYYY') > 2026 ? '-' + moment().format('YYYY') : null %> ${author}
        ${packageJson.license} License
        Includes icons from Lucide (ISC License, see NOTICE).
      `,
            thirdParty: {
                output: path.join(__dirname, 'dist', 'dependencies.txt'),
                includePrivate: true,
            },
        }),
    ],
})
