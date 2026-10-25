// Rollup `external` for the ESM build (`dist/index.mjs`) of a package: each package in its
// `dependencies` and `peerDependencies`, and subpaths of it (`react-dom/client`), stays an import, so
// the bundler of the app resolves it and keeps one copy. The UMD build (`dist/index.js`) does not use
// this: it bundles everything to work alone in a script tag.
// `bundle`: regular expressions for import ids that stay bundled although their package is a dependency.

/**
 * @param {{dependencies?: Record<string, string>, peerDependencies?: Record<string, string>}} packageJson
 * @param {{bundle?: RegExp[]}} [options]
 * @returns {(id: string) => boolean}
 */
export function externalDeps (packageJson, {bundle = []} = {}) {
    const deps = [...Object.keys(packageJson.dependencies ?? {}), ...Object.keys(packageJson.peerDependencies ?? {})]
    return id => !bundle.some(re => re.test(id)) && deps.some(dep => id === dep || id.startsWith(dep + '/'))
}
