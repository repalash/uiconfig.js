import path from 'node:path'
import fs from 'node:fs'
import {execFileSync} from 'node:child_process'

export const repoRoot = path.resolve(import.meta.dirname, '../..')

/**
 * The workspace packages (root package.json `workspaces`), sorted so that a package comes after
 * the workspace packages it depends on: uiconfig.js before uiconfig-tweakpane, and so on.
 * @returns {{name: string, version: string, dir: string, private: boolean, pkg: object, internalDeps: string[]}[]}
 */
export function workspacePackages () {
    const root = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'))
    const dirs = root.workspaces.flatMap(w => {
        if (!w.endsWith('/*')) return [w]
        const parent = w.slice(0, -2)
        return fs.readdirSync(path.join(repoRoot, parent), {withFileTypes: true})
            .filter(e => e.isDirectory() && fs.existsSync(path.join(repoRoot, parent, e.name, 'package.json')))
            .map(e => `${parent}/${e.name}`)
    })
    const list = dirs.map(dir => {
        const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, dir, 'package.json'), 'utf8'))
        return {name: pkg.name, version: pkg.version, dir, private: !!pkg.private, pkg}
    })
    const names = new Set(list.map(p => p.name))
    for (const p of list) {
        const deps = {...p.pkg.dependencies, ...p.pkg.peerDependencies, ...p.pkg.devDependencies}
        p.internalDeps = Object.keys(deps).filter(d => names.has(d) && d !== p.name)
    }
    const sorted = []
    const visit = (p, stack = []) => {
        if (sorted.includes(p)) return
        if (stack.includes(p)) throw new Error('Dependency cycle: ' + [...stack, p].map(x => x.name).join(' -> '))
        for (const d of p.internalDeps) visit(list.find(x => x.name === d), [...stack, p])
        sorted.push(p)
    }
    for (const p of list) visit(p)
    return sorted
}

/** True when this exact version of the package is on the npm registry. */
export function isPublished (name, version) {
    try {
        return execFileSync('npm', ['view', `${name}@${version}`, 'version'], {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim() === version
    } catch (e) {
        if (/E404|404 Not Found/.test(String(e.stderr))) return false // package never published
        throw e
    }
}

/**
 * The CHANGELOG.md section of a version: `## [1.2.3]`, `## v1.2.3` or `## 1.2.3`, with an optional
 * date after it. Returns null when the file or the section is missing or empty.
 */
export function changelogEntry (dir, version) {
    const file = path.join(repoRoot, dir, 'CHANGELOG.md')
    if (!fs.existsSync(file)) return null
    const text = fs.readFileSync(file, 'utf8')
    const v = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const m = text.match(new RegExp(`^## \\[?v?${v}\\]?(?:[ \\t][^\\n]*)?\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, 'm'))
    return m && m[1].trim() ? m[1].trim() : null
}
