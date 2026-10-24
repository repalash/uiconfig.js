// Copied from threepipe scripts/vite-utils.mjs (https://github.com/repalash/threepipe/pull/60).
import path from 'node:path'
import {existsSync} from 'node:fs'
import {readFile, writeFile} from 'node:fs/promises'

// `from '…'`, `import('…')`, side-effect `import '…'` and `declare module '…'`
const dtsSpecifierRE = /(\bfrom\s+|\bimport\s*\(\s*|\bimport\s+(?=['"])|\bdeclare\s+module\s+)(['"])([^'"\n]+)\2/g
const dtsExtRE = /\.(d\.ts|tsx?|js)$/

/**
 * `afterBuild` hook for vite-plugin-dts: `dts({tsconfigPath, afterBuild: fixDtsImports})`.
 *
 * tsc copies import specifiers into the .d.ts files as they are written in the source, so
 * `from './types'` reaches the published package unchanged. This package is `"type": "module"`,
 * and TypeScript with `moduleResolution: node16 | nodenext` does not resolve extensionless relative
 * imports in ESM declaration files: every export of the package goes missing for those consumers,
 * and `declare module '../IObject'` augmentations stop applying.
 * This rewrites each relative specifier to the explicit `.js` form (`./core/index.js`, `./Foo.js`),
 * which node10, node16, nodenext and bundler resolution all accept.
 *
 * It throws when a relative specifier matches no emitted declaration, and when a declaration
 * imports a `three/...` subpath without `.js` (`three/src/math/MathUtils`): only node10 resolves
 * those, because it ignores the `exports` map of `@types/three`.
 */
export async function fixDtsImports (emittedFiles) {
    const files = [...emittedFiles.keys()].filter(f => f.endsWith('.d.ts'))
    const emitted = new Set(files.map(f => path.resolve(f)))
    const has = f => emitted.has(f) || existsSync(f)
    const errors = []
    for (const file of files) {
        const text = await readFile(file, 'utf8')
        const out = text.replace(dtsSpecifierRE, (match, head, quote, spec, offset) => {
            const line = text.slice(text.lastIndexOf('\n', offset) + 1, offset)
            if (/^\s*(\*|\/\/)/.test(line)) return match // example code in a doc comment
            let fixed = spec
            if (spec === '.' || spec === '..' || spec.startsWith('./') || spec.startsWith('../')) {
                const bare = spec.replace(dtsExtRE, '').replace(/\/$/, '')
                const base = path.resolve(path.dirname(file), bare)
                if (has(base + '.d.ts')) fixed = bare + '.js'
                else if (has(path.join(base, 'index.d.ts'))) fixed = bare + '/index.js'
                else errors.push(`${file}: '${spec}' matches no emitted declaration file`)
            } else if (/^three\/./.test(spec) && !/^three\/(addons|webgpu|tsl)$/.test(spec) && !spec.endsWith('.js')) {
                errors.push(`${file}: '${spec}' needs a .js extension (only node10 resolves it without one); import from 'three' if it is exported there`)
            }
            return head + quote + fixed + quote
        })
        if (out !== text) await writeFile(file, out)
    }
    if (errors.length) throw new Error('Declaration imports that consumers cannot resolve:\n' + errors.join('\n'))
}
