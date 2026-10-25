/** Highlighted HTML of a sample file, made at build time (see vite.config.js). */
declare module '*?highlight' {
    const html: string
    export default html
}

/** Plain text of a sample file: the part between `// #region` and `// #endregion` (see vite.config.js). */
declare module '*?sample' {
    const code: string
    export default code
}
