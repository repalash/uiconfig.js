// Source text of the code samples, as shown on the page.

/**
 * The part of a sample file that the page shows: the lines between `// #region` and `// #endregion`
 * (de-indented) if the file has them, otherwise the file without its `export {…}` line.
 */
export function sampleSource(raw: string): string {
    const region = raw.match(/\/\/ #region\n([\s\S]*?)\n\s*\/\/ #endregion/)
    if (region) {
        const lines = region[1].split('\n')
        const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)![0].length))
        return lines.map(l => l.slice(indent)).join('\n')
    }
    return raw.replace(/^export \{[^}]*\}\n?/m, '').trimEnd()
}
