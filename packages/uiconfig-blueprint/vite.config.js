import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import json from "@rollup/plugin-json";
import dts from 'vite-plugin-dts'
import packageJson from "./package.json";
import license from 'rollup-plugin-license';
import replace from '@rollup/plugin-replace';
import {fixDtsImports} from '../../scripts/fix-dts-imports.mjs';
import {externalDeps} from '../../scripts/external-deps.mjs';

const { name, version, author } = packageJson

// `vite build`: the ESM bundle (dist/index.mjs) with the dependencies external, and the declarations.
// `vite build --mode umd`: the self-contained UMD bundle (dist/index.js), added to dist.
export default defineConfig(({mode}) => {
    const umd = mode === 'umd'
    return {
        optimizeDeps: {
            exclude: ['uiconfig.js'],
        },
        // define: {
        //     'process.env': process.env
        // },
        build: {
            sourcemap: true,
            lib: {
                entry: 'src/index.ts',
                formats: umd ? ['umd'] : ['es'],
                name: packageJson["name:umd"],
                fileName: (format) => (format === 'umd' ? packageJson["clean-package"].replace.main : packageJson["clean-package"].replace.module).replace('dist/', ''),
            },
            outDir: 'dist',
            emptyOutDir: !umd,
            commonjsOptions: {
                exclude: [/[\\/]uiconfig\.js[\\/](dist|src)[\\/]/],
            },
            rollupOptions: {
                // Deep imports into @blueprintjs/core stay bundled: its package.json has no exports map, so
                // `@blueprintjs/core/lib/esm/...` without a file extension does not resolve as an ESM import
                // (Node, webpack for .mjs files), and `@blueprintjs/core/src/...` is TypeScript source.
                external: umd ? [] : externalDeps(packageJson, {bundle: [/^@blueprintjs\/core\//]}),
                output: {
                    // globals: {
                    //     react: 'React',
                    // },
                    // inlineDynamicImports: false,
                },
                // input: {
                //     main: 'index.html',
                //     ...Object.fromEntries(readdirSync('examples')
                //         .filter(f=>f.endsWith('.html'))
                //         .map((file) => [file.replace('.html', ''), `examples/${file}`])),
                // },
            }
        },
        resolve: {
            alias: [
                {
                    // this is required for the SCSS modules
                    find: /^~(.*)$/,
                    replacement: '$1',
                },
            ],
        },
        css: {
            postcss: {
                plugins: [
                    {
                        postcssPlugin: 'modify-css-content', // todo: this should run when doing compile:css also
                        Once(root) {
                            // Modify to fix :root.bpx-flat :root twice when imported in renderer.scss
                            root.walkRules(rule => {
                                rule.selector = rule.selector.replace(/:root.bpx-(.*) :root/g, ':root.bpx-$1');
                            });
                        },
                    },
                    // autoprefixer,
                ],
            }
        },
        plugins: [
            umd ? null : dts({afterBuild: fixDtsImports}),
            react(),
            // del({
            //     targets: 'dist/*',
            //     runOnce: true
            // }),
            replace({
                'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
                preventAssignment: true
            }),
            json(),
            // postcss({
            //     extensions: ['.sass', '.scss', '.css'],
            //     sourceMap: true,
            //     plugins: [
            //         autoprefixer
            //     ],
            //     use: [
            //         [
            //             'sass', {
            //             includePaths: [path.resolve('node_modules')]
            //         }
            //         ]
            //     ]
            // }),
            // resolve({
            // }),
            // typescript({
            //     compilerOptions: {
            //         "sourceRoot": "../src",
            //         "declarationDir": "dist",
            //         "declarationMap": true,
            //     }
            // }),
            // commonjs({
            //     include: 'node_modules/**',
            //     extensions: [ '.js' ],
            //     ignoreGlobal: false,
            //     sourceMap: false
            // }),
            license({
                banner: `
        @license
        ${name} v${version}
        Copyright 2022<%= moment().format('YYYY') > 2022 ? '-' + moment().format('YYYY') : null %> ${author}
        ${packageJson.license} License
      `
            })
        ]
    }
})
