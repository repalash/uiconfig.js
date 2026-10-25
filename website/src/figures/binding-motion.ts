// Moves the binding figure: every few seconds a value changes in one panel, a token carries the change
// along the channel to the data object (its dial follows), and a second token carries it through the
// config and the other renderer to the other panel (its slider follows). Runs only while the figure is in
// view; with reduced motion the figure stays still.
import {needleAngle, pointAlong, proj, scene} from './figures.js'

type Name = 'tweakpane' | 'blueprint'
const CYCLE = 7000
const follow = (current: number, target: number, dt: number, rate = 7) => target + (current - target) * Math.exp(-rate * dt)

export function setupBindingFigure() {
    const svg = document.querySelector<SVGSVGElement>('.fig-binding')
    if (!svg) return
    const readout = document.getElementById('fig-binding-readout')
    const needle = svg.querySelector<SVGLineElement>('[data-needle]')!
    const tokens = svg.querySelector<SVGGElement>('[data-tokens]')!
    const knob = (n: Name) => svg.querySelector<SVGGElement>(`[data-knob="${n}"]`)!
    const fill = (n: Name) => svg.querySelector<SVGPathElement>(`[data-fill="${n}"]`)!
    const lamp = (n: Name) => svg.querySelector<SVGGElement>(`[data-lamp="${n}"]`)!

    // write only what changed: unchanged attributes cause no style, layout or paint work
    const attr = (el: Element, name: string, value: string) => {
        if (el.getAttribute(name) !== value) el.setAttribute(name, value)
    }
    const opacity = (el: SVGElement, value: string) => {
        if (el.style.opacity !== value) el.style.opacity = value
    }

    const NS = 'http://www.w3.org/2000/svg'
    const token = () => {
        const c = document.createElementNS(NS, 'circle')
        c.setAttribute('r', '3.6')
        c.setAttribute('class', 'iso-token')
        c.style.opacity = '0'
        tokens.append(c)
        return c
    }
    const toData = token()
    const toPanel = token()

    const state = {data: 0.62, tweakpane: 0.62, blueprint: 0.62}
    const target = {...state}

    const draw = () => {
        const a = needleAngle(state.data)
        const {x, y, z, r} = {...scene.dial, x: 64}
        const [nx, ny] = proj(x, y + Math.cos(a) * (r - 3), z + Math.sin(a) * (r - 3))
        attr(needle, 'x2', String(nx))
        attr(needle, 'y2', String(ny))
        for (const n of ['tweakpane', 'blueprint'] as Name[]) {
            const {from, to} = scene.tracks[n]
            const p = from.map((v, i) => v + (to[i] - v) * state[n]) as [number, number, number]
            const [fx, fy] = proj(...from)
            const [px, py] = proj(...p)
            attr(knob(n), 'transform', `translate(${(px - fx).toFixed(1)} ${(py - fy).toFixed(1)})`)
            attr(fill(n), 'd', `M${fx},${fy} L${px.toFixed(1)},${py.toFixed(1)}`)
        }
        const text = `value ${state.data.toFixed(2)}`
        if (readout && readout.textContent !== text) readout.textContent = text
    }
    const place = (c: SVGCircleElement, path: number[][], f: number | null) => {
        if (f === null || f < 0 || f > 1) {
            opacity(c, '0')
            return
        }
        const [x, y] = pointAlong(path, f)
        const [sx, sy] = proj(x, y, 1)
        attr(c, 'cx', sx.toFixed(1))
        attr(c, 'cy', sy.toFixed(1))
        // fade in and out at the ends of the run
        opacity(c, Math.min(1, f * 8, (1 - f) * 8).toFixed(2))
    }
    draw()

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let source: Name = 'blueprint'
    let cycleStart = 0
    let last = 0
    let raf = 0
    let changed = {data: false, panel: false}
    const frame = (now: number) => {
        const dt = last ? Math.min((now - last) / 1000, 0.1) : 0
        last = now
        if (!cycleStart || now - cycleStart > CYCLE) {
            // a new change, in the other panel than last time
            cycleStart = now
            source = source === 'tweakpane' ? 'blueprint' : 'tweakpane'
            let v = 0.15 + Math.random() * 0.75
            if (Math.abs(v - state.data) < 0.2) v = state.data > 0.5 ? v - 0.3 : v + 0.3
            target[source] = v
            changed = {data: false, panel: false}
        }
        const other: Name = source === 'tweakpane' ? 'blueprint' : 'tweakpane'
        const t = now - cycleStart
        // 0.0 to 0.7 s: the slider moves in the source panel; 0.7 to 2.4 s: the change runs to the data object
        const f1 = (t - 700) / 1700
        place(toData, scene.paths[`${source}ToData`], f1)
        if (f1 >= 1 && !changed.data) {
            changed.data = true
            target.data = target[source]
        }
        // 2.6 to 4.6 s: from the data object through the config and the other renderer to its panel
        const f2 = (t - 2600) / 2000
        place(toPanel, scene.paths[`dataTo${other === 'tweakpane' ? 'Tweakpane' : 'Blueprint'}`], f2)
        lamp(other).classList.toggle('is-on', f2 > 0.62 && f2 < 1.15)
        if (f2 >= 1 && !changed.panel) {
            changed.panel = true
            target[other] = target.data
        }
        for (const k of ['data', 'tweakpane', 'blueprint'] as const) state[k] = follow(state[k], target[k], dt, k === 'data' ? 5 : 8)
        draw()
        raf = requestAnimationFrame(frame)
    }

    const io = new IntersectionObserver(entries => {
        const visible = entries.some(e => e.isIntersecting)
        if (visible && !raf) {
            last = 0
            raf = requestAnimationFrame(frame)
        } else if (!visible && raf) {
            cancelAnimationFrame(raf)
            raf = 0
        }
    })
    io.observe(svg)
}
