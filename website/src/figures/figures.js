// The figures of the page, as SVG strings. vite.config.js puts them into index.html at build time;
// src/figures/binding-motion.ts moves the parts of the binding figure that move.
import {box, circle, circlePts, cylinder, dot, line, poly, proj, rectTop, rectX, rectY, viewBoxOf} from './iso.js'

// ---------------------------------------------------------------- binding figure
// A bench: the data object (a cabinet with a dial) on the left, the config (a card on a stand) in the middle,
// two renderers (Tweakpane, Blueprint) on the right, each printing a panel. Channels in the bench carry a
// change: from the panel where it happens, along the front, to the data object; from there through the config
// and the other renderer to the other panel.

/** Angle of the dial needle for a value from 0 to 1, in the plane of the dial (0 lower left, 1 lower right). */
export const needleAngle = v => Math.PI * (-0.15 + 1.3 * v)

export const scene = {
    dial: {x: 64, y: 122, z: 26, r: 13},
    // slider tracks on the two panels: start and end of the track, on the panel top
    tracks: {
        tweakpane: {from: [272, 26, 4], to: [272, 56, 4]},
        blueprint: {from: [272, 101, 4], to: [272, 131, 4]},
    },
    lamps: {tweakpane: [236, 62, 30], blueprint: [236, 137, 30]},
    // channels on the bench top (z = 0)
    paths: {
        // from each panel back to the data object
        tweakpaneToData: [[298, 40], [306, 40], [306, 160], [38, 160], [38, 150]],
        blueprintToData: [[298, 116], [306, 116], [306, 160], [38, 160], [38, 150]],
        // from the data object through the config and a renderer to its panel
        dataToTweakpane: [[64, 140], [96, 140], [96, 116], [168, 116], [176, 116], [176, 40], [194, 40], [258, 40], [264, 40]],
        dataToBlueprint: [[64, 140], [96, 140], [96, 116], [168, 116], [176, 116], [194, 116], [258, 116], [264, 116]],
    },
}

const screws = (x, y, z, w, d, inset = 5) => [[x + inset, y + inset], [x + w - inset, y + inset], [x + w - inset, y + d - inset], [x + inset, y + d - inset]]
    .map(([sx, sy]) => dot(sx, sy, z, 1.6, 'iso-screw') + dot(sx, sy, z, 0.6, 'iso-screw-slot')).join('')

function channel(points) {
    return line(points.map(([x, y]) => [x, y, 0]), 'iso-groove')
}

function panel(x, y, color, name) {
    const z = 4
    const t = scene.tracks[name]
    return box(x, y, 0, 36, 46, z, 'paper') +
        rectTop(x + 1.5, y + 1.5, z, 5, 43, 'iso-fill', color) + // title bar
        // slider: track, fill up to the knob, knob (moved by binding-motion.ts)
        line([t.from, t.to], 'iso-track') +
        `<path class="iso-track-fill" data-fill="${name}" style="--h:var(--c-data)" d="M${proj(...t.from).join(',')} L${proj(...t.from).join(',')}"/>` +
        `<g data-knob="${name}">${cylinder(...t.from.slice(0, 2), z, 3.2, 1.6, 'data')}</g>` +
        // toggle and color swatch rows
        rectTop(x + 18, y + 6, z, 5, 11, 'iso-fill', color) + dot(x + 20.5, y + 14, z + 0.2, 1.9, 'iso-knob-dot') +
        rectTop(x + 26, y + 6, z, 5, 11, 'iso-fill', 'config') +
        rectTop(x + 18, y + 22, z, 1.2, 18, 'iso-rule') + rectTop(x + 26, y + 22, z, 1.2, 12, 'iso-rule')
}

function machine(x, y, color, name) {
    const w = 58, d = 42, h = 40
    const [lx, ly, lz] = scene.lamps[name]
    let s = box(x - 2, y - 2, 0, w + 4, d + 4, 3, 'base-dark') + // plinth
        box(x, y, 3, w, d, h, color)
    // feed slot on top, with the config sheet entering it
    s += rectTop(x + 10, y + 14, 3 + h, 30, 5, 'iso-slot')
    s += rectTop(x + 12, y + 15.2, 3 + h + 0.1, 26, 1.6, 'iso-fill', 'paper')
    // vents on the right face: closed slots
    for (let i = 0; i < 5; i++) s += rectX(x + w, y + 8 + i * 6, 14, 2.4, 18, 'iso-vent')
    // output slit on the right face, low
    s += rectX(x + w, y + 6, 6, d - 12, 2.2, 'iso-slot')
    // name plate with rule lines and the lamp on the left face
    s += rectY(x + 8, y + d, 12, 26, 12, 'iso-plate') +
        line([[x + 11, y + d, 19], [x + 30, y + d, 19]], 'iso-rule-line') + line([[x + 11, y + d, 15.5], [x + 24, y + d, 15.5]], 'iso-rule-line')
    s += circle('y', lx, ly, lz, 4.2, 'iso-lamp-ring') + `<g class="iso-lamp" data-lamp="${name}">${circle('y', lx, ly, lz, 2.8, 'iso-lamp-glow')}</g>`
    return s
}

function dataCabinet() {
    const x = 14, y = 98, w = 50, d = 50, h = 48
    const {dial} = scene
    let s = box(x - 2, y - 2, 0, w + 4, d + 4, 3, 'base-dark') + box(x, y, 3, w, d, h, 'data')
    // drawers on the left face: key/value rows
    for (let i = 0; i < 3; i++) {
        const z = 9 + i * 13
        s += rectY(x + 5, y + d, z, w - 10, 10, 'iso-drawer') + rectY(x + 20, y + d, z + 4, 10, 2, 'iso-handle')
    }
    // dial on the right face: bezel, face, ticks; the needle is moved by binding-motion.ts
    s += circle('x', x + w, dial.y, dial.z, dial.r + 2, 'iso-bezel') + circle('x', x + w, dial.y, dial.z, dial.r, 'iso-dial')
    for (let i = 0; i <= 10; i++) {
        const a = needleAngle(i / 10)
        const r0 = i % 5 === 0 ? dial.r - 4 : dial.r - 2.5
        s += line([[x + w, dial.y + Math.cos(a) * r0, dial.z + Math.sin(a) * r0], [x + w, dial.y + Math.cos(a) * (dial.r - 1), dial.z + Math.sin(a) * (dial.r - 1)]], i % 5 === 0 ? 'iso-tick-major' : 'iso-tick')
    }
    const [cx, cy] = proj(x + w, dial.y, dial.z)
    s += `<line class="iso-needle" data-needle x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy}"/>` + dot(x + w, dial.y, dial.z, 1.6, 'iso-hub')
    // label inlay on top
    s += rectTop(x + 8, y + 8, 3 + h, w - 16, 14, 'iso-inlay') + line([[x + 12, y + 13, 3 + h], [x + w - 14, y + 13, 3 + h]], 'iso-rule-line') +
        line([[x + 12, y + 17, 3 + h], [x + w - 22, y + 17, 3 + h]], 'iso-rule-line')
    return s
}

function configStand() {
    // plinth, two posts and the card between them
    const x = 104, y = 84, w = 56
    let s = box(x - 6, y - 4, 0, w + 12, 26, 5, 'base-dark')
    s += box(x - 4, y + 2, 5, 4, 4, 74, 'base-dark') + box(x + w, y + 2, 5, 4, 4, 74, 'base-dark')
    s += box(x, y + 2, 10, w, 3, 68, 'paper')
    // on the card's left face: a header and rows; each row a label and a value colored by component type
    const fy = y + 5
    s += rectY(x + 1.5, fy, 12, w - 3, 64, 'iso-sheet')
    s += rectY(x + 3, fy, 68, w - 6, 7, 'iso-fill', 'config')
    const rows = [['data', 30], ['tweakpane', 22], ['blueprint', 26], ['config', 18], ['data', 24]]
    rows.forEach(([c, len], i) => {
        const z = 58 - i * 9
        s += rectY(x + 5, fy, z, 12, 3, 'iso-label') + rectY(x + 21, fy, z, len, 3, 'iso-fill', c)
    })
    // clip on top
    s += box(x + w / 2 - 6, y + 1, 76, 12, 5, 4, 'base-dark')
    return s
}

export function bindingFigure() {
    const bench = {x: 0, y: 0, w: 316, d: 172}
    let s = ''
    // halo under the bench
    s += poly([[-10, -6, -14], [bench.w + 12, -6, -14], [bench.w + 12, bench.d + 14, -14], [-10, bench.d + 14, -14]], 'iso-halo')
    s += box(bench.x, bench.y, -12, bench.w, bench.d, 12, 'base')
    // bevel line along the top front edges and a label plate with rule lines on the front
    s += line([[bench.w, 0, -1.5], [bench.w, bench.d, -1.5], [0, bench.d, -1.5]], 'iso-bevel')
    s += rectY(18, bench.d, -9, 46, 6, 'iso-plate') + line([[22, bench.d, -6], [54, bench.d, -6]], 'iso-rule-line')
    s += screws(0, 0, 0, bench.w, bench.d, 6)
    // channels, then the tokens that run in them (drawn by binding-motion.ts), then the solids back to front
    for (const p of Object.values(scene.paths)) s += channel(p)
    s += '<g data-tokens></g>'
    s += machine(194, 20, 'tweakpane', 'tweakpane')
    s += configStand()
    s += dataCabinet()
    s += machine(194, 95, 'blueprint', 'blueprint')
    s += panel(264, 17, 'tweakpane', 'tweakpane')
    s += panel(264, 93, 'blueprint', 'blueprint')
    const vb = viewBoxOf([[-10, -6, -14], [bench.w + 12, -6, -14], [bench.w + 12, bench.d + 14, -14], [-10, bench.d + 14, -14], [104, 86, 84], [0, 0, 0], [194, 20, 46]], 6)
    return `<svg class="iso fig-binding" viewBox="${vb}" role="img" aria-labelledby="fig-binding-title fig-binding-desc">` +
        '<title id="fig-binding-title">One data object, one config, two renderers</title>' +
        '<desc id="fig-binding-desc">A bench with a data cabinet and its dial, a config card on a stand, and two machines, Tweakpane and Blueprint, that each print a panel. A change in one panel runs along a channel to the data cabinet, and from there through the config to the other panel, whose slider moves to the same value.</desc>' +
        s + '</svg>'
}

// ---------------------------------------------------------------- section icons (decorative)

function icon(name, body, points) {
    return `<svg class="iso iso-icon icon-${name}" viewBox="${viewBoxOf(points, 3)}" aria-hidden="true" focusable="false">${body}</svg>`
}

export const icons = {
    syntax: () => icon('syntax',
        ['tweakpane', 'blueprint', 'config'].map((c, i) => {
            const z = i * 9
            return box(0, 0, z, 34, 24, 4, 'paper') + rectTop(3, 3, z + 4, 6, 18, 'iso-fill', c) +
                rectTop(13, 4, z + 4, 1.4, 14, 'iso-rule') + rectTop(18, 4, z + 4, 1.4, 10, 'iso-rule') + rectTop(23, 4, z + 4, 1.4, 16, 'iso-rule')
        }).join(''),
        [[0, 0, 0], [34, 0, 0], [34, 24, 0], [0, 24, 0], [0, 0, 22]]),
    components: () => icon('components',
        box(0, 0, 0, 34, 30, 4, 'paper') + rectTop(3, 3, 4, 4, 24, 'iso-fill', 'config') +
        line([[13, 5, 4], [13, 25, 4]], 'iso-track') + line([[13, 5, 4], [13, 16, 4]], 'iso-track-fill', 'data') + cylinder(13, 16, 4, 2.6, 1.6, 'data') +
        rectTop(20, 5, 4, 4.5, 10, 'iso-fill', 'tweakpane') + dot(22.2, 12.5, 4.2, 1.6, 'iso-knob-dot') +
        rectTop(27, 5, 4, 4.5, 8, 'iso-fill', 'blueprint') + rectTop(27, 16, 4, 4.5, 9, 'iso-fill', 'config'),
        [[0, 0, 0], [34, 0, 0], [34, 30, 0], [0, 30, 0], [0, 0, 8]]),
    playground: () => icon('playground',
        box(0, 0, 0, 30, 36, 4, 'paper') + rectTop(2.5, 2.5, 4, 3.5, 31, 'iso-fill', 'config') +
        [[9, 4, 14, 'blueprint'], [13, 8, 18, 'tweakpane'], [17, 8, 12, 'data'], [21, 4, 20, 'config'], [25, 8, 10, 'blueprint']]
            .map(([x, y, len, c]) => rectTop(x, y, 4, 1.6, len, 'iso-fill', c)).join('') +
        box(23.5, 26, 4, 3, 3, 4, 'data'),
        [[0, 0, 0], [30, 0, 0], [30, 36, 0], [0, 36, 0], [0, 0, 9]]),
    three: () => icon('three',
        box(4, 4, 0, 22, 22, 22, 'config') +
        line([[2, 2, 0], [34, 2, 0]], 'iso-axis', 'blueprint') + line([[2, 2, 0], [2, 34, 0]], 'iso-axis', 'tweakpane') + line([[2, 2, 0], [2, 2, 32]], 'iso-axis', 'data') +
        dot(2, 2, 0, 1.8, 'iso-hub'),
        [[2, 2, 0], [34, 2, 0], [2, 34, 0], [2, 2, 32], [26, 26, 0]]),
    install: () => icon('install',
        box(0, 0, 0, 30, 26, 20, 'paper') + rectTop(13, 0, 20, 4, 26, 'iso-fill', 'data') + rectX(30, 0, 8, 26, 4, 'iso-fill', 'data') +
        rectY(4, 26, 6, 14, 8, 'iso-plate'),
        [[0, 0, 0], [30, 0, 0], [30, 26, 0], [0, 26, 0], [0, 0, 20]]),
}

/** Points along a channel at a fraction f of its length (for the moving tokens). */
export function pointAlong(points, f) {
    const seg = []
    let total = 0
    for (let i = 1; i < points.length; i++) {
        const l = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1])
        seg.push(l)
        total += l
    }
    let rest = Math.min(Math.max(f, 0), 1) * total
    for (let i = 0; i < seg.length; i++) {
        if (rest <= seg[i]) {
            const k = seg[i] ? rest / seg[i] : 0
            return [points[i][0] + (points[i + 1][0] - points[i][0]) * k, points[i][1] + (points[i + 1][1] - points[i][1]) * k]
        }
        rest -= seg[i]
    }
    return points[points.length - 1]
}

export {circlePts, proj}
