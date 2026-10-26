// The site's public URL and the tags that use it. SITE_URL (environment) is the address where the site is
// published; it only makes the absolute URLs (canonical links, Open Graph, sitemap.xml, robots.txt, llms.txt).
// Every link and asset on the pages stays relative, so the site moves to another address by setting SITE_URL.
export const siteUrl = (process.env.SITE_URL || 'https://repalash.com/uiconfig.js/').replace(/\/?$/, '/')

/** Absolute URL of a path relative to the site root ('' is the root, 'examples/' the examples index). */
export const absoluteUrl = rel => new URL(rel, siteUrl).href

export const siteName = 'uiconfig.js'

/** The social card: website/public/og.png, made by scripts/og-image.mjs (npm run og-image -w uiconfig-website). */
export const ogImage = {
    path: 'og.png',
    width: 1200,
    height: 630,
    alt: 'uiconfig.js: UI panels from config objects. A config bound to data, rendered by Tweakpane and Blueprint.',
}

const escapeAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/**
 * Canonical link, Open Graph and Twitter card tags for a page.
 * @param {{title: string, description: string, path: string, type?: string}} page - path relative to the site root
 */
export function socialTags({title, description, path, type = 'website'}) {
    const url = absoluteUrl(path)
    const tags = [
        `<link rel="canonical" href="${escapeAttr(url)}">`,
        `<meta property="og:site_name" content="${siteName}">`,
        `<meta property="og:type" content="${type}">`,
        `<meta property="og:title" content="${escapeAttr(title)}">`,
        `<meta property="og:description" content="${escapeAttr(description)}">`,
        `<meta property="og:url" content="${escapeAttr(url)}">`,
        `<meta property="og:image" content="${escapeAttr(absoluteUrl(ogImage.path))}">`,
        `<meta property="og:image:width" content="${ogImage.width}">`,
        `<meta property="og:image:height" content="${ogImage.height}">`,
        `<meta property="og:image:alt" content="${escapeAttr(ogImage.alt)}">`,
        `<meta name="twitter:card" content="summary_large_image">`,
    ]
    return tags.join('\n    ')
}

const unescapeHtml = s => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')

/** The <title> and the meta description of an HTML page, as text. */
export function pageMeta(html) {
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1]
    const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1]
    if (!title || !description) throw new Error('page without <title> or <meta name="description">')
    return {title: unescapeHtml(title), description: unescapeHtml(description)}
}
