// Moves the hero figure with the hero panel: the dial and the weight slider follow the weight, the tracking slider
// the tracking, the swatch the color, the switch the outline, the text bar the length of the text. Only transforms,
// opacity and fills change. The loop runs while a part is still moving and the figure is on screen; with reduced
// motion the parts jump to their values.
import {dialAngle, hero} from './hero-figure.js'

export interface HeadingValues {text: string, weight: number, tracking: number, color: string, outline: boolean}

const follow = (current: number, target: number, dt: number) => target + (current - target) * Math.exp(-9 * dt)

export function setupHeroFigure() {
    const svg = document.querySelector<SVGSVGElement>('.fig-hero')
    if (!svg) return
    const q = (sel: string) => svg.querySelector<SVGElement>(sel)!
    const needle = q('[data-hero-needle]')
    const knobs = {weight: q('[data-hero-knob="weight"]'), tracking: q('[data-hero-knob="tracking"]')}
    const fills = {weight: q('[data-hero-fill="weight"]'), tracking: q('[data-hero-fill="tracking"]')}
    const sw = q('[data-hero-switch]')
    const textBar = q('[data-hero-text]')
    const swatch = q('[data-hero-swatch]')
    const lamp = q('[data-hero-lamp]')
    const readout = document.getElementById('fig-hero-readout')
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const {track, rows} = hero

    const state = {weight: 0.75, tracking: 0.25, outline: 0, text: 0.8}
    const target = {...state}
    const set = (el: Element, name: string, value: string) => {
        if (el.getAttribute(name) !== value) el.setAttribute(name, value)
    }
    const draw = () => {
        set(needle, 'transform', `rotate(${dialAngle(state.weight).toFixed(1)})`)
        for (const k of ['weight', 'tracking'] as const) {
            const u = track.u0 + (track.u1 - track.u0) * state[k]
            set(knobs[k], 'transform', `translate(${u.toFixed(2)} ${rows[k]})`)
            set(fills[k], 'transform', `translate(${track.u0} 0) scale(${state[k].toFixed(3)} 1) translate(${-track.u0} 0)`)
        }
        set(sw, 'transform', `translate(${(track.u0 + 2.6 + 5.8 * state.outline).toFixed(2)} ${rows.outline})`)
        set(textBar, 'transform', `translate(${track.u0} 0) scale(${state.text.toFixed(3)} 1) translate(${-track.u0} 0)`)
    }

    let raf = 0
    let last = 0
    let visible = false
    let lampUntil = 0
    const frame = (now: number) => {
        const dt = last ? Math.min((now - last) / 1000, 0.1) : 0
        last = now
        let moving = false
        for (const k of Object.keys(state) as (keyof typeof state)[]) {
            state[k] = follow(state[k], target[k], dt)
            if (Math.abs(state[k] - target[k]) > 0.0015) moving = true
            else state[k] = target[k]
        }
        draw()
        lamp.classList.toggle('is-on', now < lampUntil)
        raf = moving || now < lampUntil ? requestAnimationFrame(frame) : 0
        if (!raf) last = 0
    }
    const run = () => {
        if (reduced) {
            Object.assign(state, target)
            draw()
            return
        }
        if (!raf && visible) raf = requestAnimationFrame(frame)
    }

    addEventListener('heading', ev => {
        const h = (ev as CustomEvent<HeadingValues>).detail
        target.weight = Math.min(1, Math.max(0, (h.weight - 100) / 800))
        target.tracking = Math.min(1, Math.max(0, (h.tracking + 0.08) / 0.2))
        target.outline = h.outline ? 1 : 0
        target.text = Math.min(1, Math.max(0.08, h.text.length / 14))
        if (swatch.style.fill !== h.color) swatch.style.fill = h.color
        if (readout) readout.textContent = `weight ${Math.round(h.weight)}, tracking ${h.tracking.toFixed(2)}`
        lampUntil = performance.now() + 450
        run()
    })

    new IntersectionObserver(entries => {
        visible = entries.some(e => e.isIntersecting)
        if (visible) run()
        else if (raf) {
            cancelAnimationFrame(raf)
            raf = 0
            last = 0
        }
    }).observe(svg)
    draw()
}
