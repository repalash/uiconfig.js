import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import json from "@rollup/plugin-json";
import dts from 'vite-plugin-dts'
import packageJson from "./package.json";
import license from 'rollup-plugin-license';
import replace from '@rollup/plugin-replace';
import path from 'node:path';
import {fixDtsImports} from 'dts-js-extensions';
import {externalDeps} from '../../scripts/external-deps.mjs';

const { name, version, author } = packageJson

// `vite build`: the ESM bundle (dist/index.mjs) with the dependencies external, and the declarations.
// `vite build --mode umd`: the self-contained bundles, added to dist: UMD (dist/index.js) for script tags and CDN links,
// CommonJS (dist/index.cjs) for require(). A .js file in this "type": "module" package loads as ESM in Node and
// bundlers, where the UMD wrapper finds no `module` and returns nothing.
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
                formats: umd ? ['umd', 'cjs'] : ['es'],
                name: packageJson["name:umd"],
                fileName: (format) => ({umd: packageJson.browser, cjs: packageJson.main}[format] ?? packageJson.module).replace('dist/', ''),
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
                    // the CommonJS bundle is one file, as the UMD bundle (rollup inlines dynamic imports for UMD itself)
                    inlineDynamicImports: umd,
                },
                // input: {
                //     main: 'index.html',
                //     ...Object.fromEntries(readdirSync('examples')
                //         .filter(f=>f.endsWith('.html'))
                //         .map((file) => [file.replace('.html', ''), `examples/${file}`])),
                // },
            }
        },
        // Vite 7 sets esbuild legalComments to 'none' by default, which drops the license banner and the license
        // comments of the bundled code (React, normalize.css); 'inline' keeps them, as the Vite 5 build did
        esbuild: {
            legalComments: 'inline',
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
        See ./dependencies.txt for bundled third-party dependencies and licenses.
      `,
                thirdParty: {
                    output: path.join(__dirname, 'dist', 'dependencies.txt'),
                    includePrivate: true, // Default is false.
                },
            })
        ]
    }
})
