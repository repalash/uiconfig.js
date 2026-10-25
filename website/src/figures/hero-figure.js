// The hero figure: what the hero panel is made of, as a small machine on a bench. The heading object is a cabinet
// whose dial shows the weight; the config is a card in the slot of the renderer; the renderer drives a panel plate
// whose sliders, swatch and switch show the values of the hero panel. src/figures/hero-motion.ts moves the parts
// (transforms and fills only) when the hero panel changes.
import {box, circle, dot, line, planeMatrix, poly, rectTop, rectX, rectY, viewBoxOf} from './iso.js'

export const hero = {
    // the dial on the right face of the cabinet (plane x = const)
    dial: {x: 64, y: 96, z: 28, r: 14},
    // the panel plate: its front face is the plane y = plate.y; rows are measured along x (u) and up (v)
    plate: {x: 176, y: 78, z: 6, w: 60, h: 66},
    rows: {text: 56, weight: 45, tracking: 35, swatch: 22, outline: 12},
    track: {u0: 22, u1: 54},
}

/** Value (0..1) to the angle of the needle in the dial plane, degrees (0 lower left, 1 lower right). */
export const dialAngle = v => -27 + v * 234

function screws(x, y, z, w, d, inset) {
    return [[x + inset, y + inset], [x + w - inset, y + inset], [x + w - inset, y + d - inset], [x + inset, y + d - inset]]
        .map(([sx, sy]) => dot(sx, sy, z, 1.5, 'iso-screw') + dot(sx, sy, z, 0.55, 'iso-screw-slot')).join('')
}

function cabinet() {
    const x = 14, y = 72, w = 50, d = 48, h = 48
    const {dial} = hero
    let s = box(x - 2, y - 2, 0, w + 4, d + 4, 3, 'base-dark') + box(x, y, 3, w, d, h, 'data')
    for (let i = 0; i < 3; i++) {
        const z = 9 + i * 13
        s += rectY(x + 5, y + d, z, w - 10, 10, 'iso-drawer') + rectY(x + 19, y + d, z + 4, 12, 2, 'iso-handle')
    }
    s += rectTop(x + 8, y + 8, 3 + h, w - 16, 12, 'iso-inlay') + line([[x + 12, y + 12.5, 3 + h], [x + w - 14, y + 12.5, 3 + h]], 'iso-rule-line') +
        line([[x + 12, y + 16, 3 + h], [x + w - 22, y + 16, 3 + h]], 'iso-rule-line')
    // dial, drawn in its plane; the needle turns in the same plane
    const m = planeMatrix('x', dial.x, dial.y, dial.z)
    let ticks = ''
    for (let i = 0; i <= 8; i++) {
        const a = dialAngle(i / 8) * Math.PI / 180
        const r0 = i % 4 === 0 ? dial.r - 4.5 : dial.r - 2.8
        ticks += `<line class="${i % 4 === 0 ? 'iso-tick-major' : 'iso-tick'}" x1="${(Math.cos(a) * r0).toFixed(2)}" y1="${(Math.sin(a) * r0).toFixed(2)}" x2="${(Math.cos(a) * (dial.r - 1)).toFixed(2)}" y2="${(Math.sin(a) * (dial.r - 1)).toFixed(2)}"/>`
    }
    s += `<g transform="${m}"><circle class="iso-bezel" r="${dial.r + 2.2}"/><circle class="iso-dial" r="${dial.r}"/>${ticks}` +
        `<g data-hero-needle transform="rotate(${dialAngle(0.75)})"><line class="iso-needle" x1="-2.5" y1="0" x2="${dial.r - 3}" y2="0"/></g>` +
        '<circle class="iso-hub" r="1.7"/></g>'
    return s
}

function renderer() {
    const x = 94, y = 40, w = 58, d = 46, h = 40
    let s = box(x - 2, y - 2, 0, w + 4, d + 4, 3, 'base-dark') + box(x, y, 3, w, d, h, 'tweakpane')
    // slot on top, the config card standing in it
    s += rectTop(x + 9, y + 19, 3 + h, 40, 6, 'iso-slot')
    const cx = x + 11, cy = y + 21
    s += box(cx, cy, 3 + h, 36, 2.4, 38, 'paper')
    // rows on the card's left face (plane y = cy + 2.4)
    const cm = planeMatrix('y', cx, cy + 2.4, 3 + h)
    s += `<g transform="${cm}"><rect class="iso-fill" style="--h:var(--c-config)" x="3" y="30" width="30" height="5"/>` +
        [['data', 24], ['tweakpane', 18], ['blueprint', 21], ['data', 14]].map(([c, len], i) =>
            `<rect class="iso-label" x="3" y="${22 - i * 6}" width="8" height="2.4"/><rect class="iso-fill" style="--h:var(--c-${c})" x="13" y="${22 - i * 6}" width="${len - 4}" height="2.4"/>`).join('') +
        '</g>'
    // vents on the right face, a name plate and the lamp on the left face
    for (let i = 0; i < 5; i++) s += rectX(x + w, y + 10 + i * 6, 14, 2.4, 18, 'iso-vent')
    s += rectX(x + w, y + 8, 6, d - 16, 2.2, 'iso-slot')
    s += rectY(x + 8, y + d, 12, 24, 12, 'iso-plate') + line([[x + 11, y + d, 19], [x + 28, y + d, 19]], 'iso-rule-line') +
        line([[x + 11, y + d, 15.5], [x + 22, y + d, 15.5]], 'iso-rule-line')
    s += circle('y', x + w - 10, y + d, 30, 4, 'iso-lamp-ring') + `<g class="iso-lamp" data-hero-lamp>${circle('y', x + w - 10, y + d, 30, 2.7, 'iso-lamp-glow')}</g>`
    return s
}

function plate() {
    const {x, y, z, w, h} = hero.plate
    const {rows, track} = hero
    // easel: a foot on the bench and a back strut
    let s = box(x - 2, y - 14, 0, w + 4, 18, 4, 'base-dark')
    s += box(x + 6, y - 12, 4, 4, 4, 30, 'base-dark') + box(x + w - 10, y - 12, 4, 4, 4, 30, 'base-dark')
    s += box(x, y - 3, z, w, 3, h, 'paper')
    const m = planeMatrix('y', x, y, z)
    s += rectY(x + 1.5, y, z + 1.5, w - 3, h - 3, 'iso-sheet')
    const label = (v, len = 12) => `<rect class="iso-label" x="5" y="${v - 1.2}" width="${len}" height="2.4"/>`
    const slider = (v, name, k) => {
        const u = track.u0 + (track.u1 - track.u0) * k
        return label(v) + `<line class="iso-track" x1="${track.u0}" y1="${v}" x2="${track.u1}" y2="${v}"/>` +
            `<line class="iso-track-fill" style="--h:var(--c-data)" data-hero-fill="${name}" x1="${track.u0}" y1="${v}" x2="${track.u1}" y2="${v}" transform="translate(${track.u0} 0) scale(${k} 1) translate(${-track.u0} 0)"/>` +
            `<g data-hero-knob="${name}" transform="translate(${u.toFixed(1)} ${v})"><circle class="iso-knob" r="3"/></g>`
    }
    s += `<g transform="${m}">` +
        `<rect class="iso-fill" style="--h:var(--c-tweakpane)" x="2" y="${h - 6}" width="${w - 4}" height="4"/>` +
        // text row: a bar as long as the heading text
        label(rows.text) + `<rect class="iso-textbar" data-hero-text x="${track.u0}" y="${rows.text - 1.6}" width="${track.u1 - track.u0}" height="3.2"/>` +
        slider(rows.weight, 'weight', 0.75) + slider(rows.tracking, 'tracking', 0.25) +
        label(rows.swatch) + `<rect class="iso-swatch" data-hero-swatch x="${track.u0}" y="${rows.swatch - 3}" width="10" height="6" rx="1"/>` +
        label(rows.outline) + `<rect class="iso-switch" x="${track.u0}" y="${rows.outline - 2.6}" width="11" height="5.2" rx="2.6"/>` +
        `<g data-hero-switch transform="translate(${track.u0 + 2.6} ${rows.outline})"><circle class="iso-knob" r="2"/></g>` +
        '</g>'
    return s
}

export function heroFigure() {
    const bench = {w: 250, d: 124}
    let s = poly([[-8, -6, -12], [bench.w + 10, -6, -12], [bench.w + 10, bench.d + 12, -12], [-8, bench.d + 12, -12]], 'iso-halo')
    s += box(0, 0, -10, bench.w, bench.d, 10, 'base')
    s += line([[bench.w, 0, -1.5], [bench.w, bench.d, -1.5], [0, bench.d, -1.5]], 'iso-bevel')
    s += rectY(16, bench.d, -7.5, 40, 5, 'iso-plate') + line([[20, bench.d, -5], [48, bench.d, -5]], 'iso-rule-line')
    s += screws(0, 0, 0, bench.w, bench.d, 6)
    // channels: cabinet to renderer, renderer to the plate
    s += line([[40, 70, 0], [40, 56, 0], [92, 56, 0]], 'iso-groove') + line([[154, 63, 0], [206, 63, 0]], 'iso-groove')
    s += renderer() + cabinet() + plate()
    const vb = viewBoxOf([[-8, -6, -12], [bench.w + 10, -6, -12], [bench.w + 10, bench.d + 12, -12], [-8, bench.d + 12, -12], [105, 61, 84], [176, 78, 72]], 6)
    return `<svg class="iso fig-hero" viewBox="${vb}" role="img" aria-labelledby="fig-hero-title fig-hero-desc">` +
        '<title id="fig-hero-title">What the hero panel is made of</title>' +
        '<desc id="fig-hero-desc">A bench with the heading object as a cabinet whose dial shows the font weight, the config as a card in the slot of the renderer, and the panel plate that the renderer drives. Its sliders, color swatch and switch follow the hero panel.</desc>' +
        s + '</svg>'
}

