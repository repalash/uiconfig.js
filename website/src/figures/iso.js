// A small isometric drawing kit for the figures: world x and y on the floor, z up. The viewer looks from +x, +y
// and +z, so a solid shows its top, its x-max face (right) and its y-max face (left). Colors come from CSS:
// a solid sets --h, and .iso-t/.iso-r/.iso-l mix it into a top, a right and a left tone, with an outline.
// Used by the build (static parts, scripts in vite.config.js) and by the page (moving parts).

const C = Math.cos(Math.PI / 6)
const r1 = n => Math.round(n * 10) / 10

/** Screen point of a world point. */
export const proj = (x, y, z = 0) => [r1((x - y) * C), r1((x + y) / 2 - z)]

const pts = list => list.map(p => proj(...p).join(',')).join(' ')
const hue = h => h ? ` style="--h:var(--c-${h})"` : ''

export const poly = (list, cls, h) => `<polygon class="${cls}"${hue(h)} points="${pts(list)}"/>`

/** A box with its three visible faces. */
export function box(x, y, z, w, d, h, color, extra = '') {
    const t = z + h
    return `<g class="iso-solid${extra ? ' ' + extra : ''}"${hue(color)}>` +
        poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, t], [x + w, y, t]], 'iso-r') +
        poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, t], [x, y + d, t]], 'iso-l') +
        poly([[x, y, t], [x + w, y, t], [x + w, y + d, t], [x, y + d, t]], 'iso-t') +
        '</g>'
}

/** A flat rectangle on a horizontal plane at height z. */
export const rectTop = (x, y, z, w, d, cls, h) => poly([[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], cls, h)
/** A rectangle on the plane x = const (a right face): dy along y, dz up. */
export const rectX = (x, y, z, dy, dz, cls, h) => poly([[x, y, z], [x, y + dy, z], [x, y + dy, z + dz], [x, y, z + dz]], cls, h)
/** A rectangle on the plane y = const (a left face): dx along x, dz up. */
export const rectY = (x, y, z, dx, dz, cls, h) => poly([[x, y, z], [x + dx, y, z], [x + dx, y, z + dz], [x, y, z + dz]], cls, h)

/** Points of a circle in one of the planes: 'z' (horizontal), 'x' or 'y'. */
export function circlePts(plane, cx, cy, cz, r, n = 28) {
    const out = []
    for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2
        const u = Math.cos(a) * r, v = Math.sin(a) * r
        out.push(plane === 'z' ? [cx + u, cy + v, cz] : plane === 'x' ? [cx, cy + u, cz + v] : [cx + u, cy, cz + v])
    }
    return out
}
export const circle = (plane, cx, cy, cz, r, cls, h, n) => poly(circlePts(plane, cx, cy, cz, r, n), cls, h)

/** A cylinder standing on z (a knob, a foot or a lamp housing). */
export function cylinder(cx, cy, z, r, h, color, extra = '') {
    // silhouette: the two side tangents of the top and bottom ellipses
    const [ax, ay] = proj(cx, cy, z), [, ty] = proj(cx, cy, z + h)
    const rx = r1(r * Math.SQRT2 * C), ry = r1(r * Math.SQRT2 / 2)
    return `<g class="iso-solid${extra ? ' ' + extra : ''}"${hue(color)}>` +
        `<path class="iso-r" d="M${r1(ax - rx)},${ty} L${r1(ax - rx)},${ay} A${rx},${ry} 0 0 0 ${r1(ax + rx)},${ay} L${r1(ax + rx)},${ty} Z"/>` +
        `<ellipse class="iso-t" cx="${ax}" cy="${ty}" rx="${rx}" ry="${ry}"/></g>`
}

/** A polyline on the floor or on a face, as a path. */
export const line = (list, cls, h) => `<path class="${cls}"${hue(h)} d="M${list.map(p => proj(...p).join(',')).join(' L')}"/>`

export const dot = (x, y, z, r, cls, h) => {
    const [px, py] = proj(x, y, z)
    return `<circle class="${cls}"${hue(h)} cx="${px}" cy="${py}" r="${r}"/>`
}

/** viewBox around a set of world points with a margin. */
export function viewBoxOf(points, pad = 8) {
    const s = points.map(p => proj(...p))
    const xs = s.map(p => p[0]), ys = s.map(p => p[1])
    const x0 = Math.min(...xs) - pad, y0 = Math.min(...ys) - pad
    return `${r1(x0)} ${r1(y0)} ${r1(Math.max(...xs) - x0 + pad)} ${r1(Math.max(...ys) - y0 + pad)}`
}

/**
 * SVG transform that maps 2D coordinates on a plane to the screen, so that shapes, rotations and translations can be
 * written in the plane: 'x' (the plane x = const: u along +y, v up), 'y' (y = const: u along +x, v up) or 'z'
 * (horizontal: u along +x, v along +y). With `down`, v points down, for text.
 */
export function planeMatrix(plane, x, y, z, down = false) {
    const [ox, oy] = proj(x, y, z)
    const v = down ? 1 : -1
    const m = plane === 'x' ? [-C, 0.5, 0, v] : plane === 'y' ? [C, 0.5, 0, v] : [C, 0.5, -C, 0.5]
    return `matrix(${m.map(n => Math.round(n * 1000) / 1000).join(' ')} ${ox} ${oy})`
}
