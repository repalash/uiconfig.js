import {describe, expect, test, vi} from 'vitest'
import {setElementTooltip, titleTooltip, UiConfigRendererBase, UiObjectConfig, UiTooltipHook} from '../src'

/** An element with what the tooltips use (Node has no DOM) */
function element() {
    return {
        title: '',
        removeAttribute(name: string) {
            if (name === 'title') this.title = ''
        },
    } as unknown as HTMLElement
}

class TestRenderer extends UiConfigRendererBase {
    constructor() {
        super(false, undefined, false)
    }
    protected _refreshUiConfigObject(_: UiObjectConfig) {
        // nothing to draw
    }
}
class OtherRenderer extends TestRenderer {}

describe('tooltips', () => {
    test('titleTooltip sets the native title and removes it', () => {
        const el = element()
        const remove = titleTooltip(el, 'Snapshot', {label: 'Snapshot', needed: () => true})
        expect(el.title).toBe('Snapshot')
        ;(remove as () => void)()
        expect(el.title).toBe('')
    })

    test('setElementTooltip: the same text and hook does nothing; a new text removes the old tooltip first; no text removes it', () => {
        const el = element()
        const calls: string[] = []
        const hook: UiTooltipHook = (_, text, info) => {
            calls.push(`add ${text} ${info.label} ${info.needed()}`)
            return () => calls.push(`remove ${text}`)
        }
        setElementTooltip(hook, el, 'A')
        setElementTooltip(hook, el, 'A')
        setElementTooltip(hook, el, 'B', {label: 'b'})
        setElementTooltip(hook, el, undefined)
        expect(calls).toEqual(['add A A true', 'remove A', 'add B b true', 'remove B'])
    })

    test('a renderer uses its tooltip, else the static Tooltip of its class, else of UiConfigRendererBase; false is none', () => {
        const base = vi.fn(), other = vi.fn(), own = vi.fn()
        const saved = UiConfigRendererBase.Tooltip
        try {
            UiConfigRendererBase.Tooltip = base
            const a = new TestRenderer(), b = new OtherRenderer()
            expect(a.tooltipHook).toBe(base)
            OtherRenderer.Tooltip = other
            expect(b.tooltipHook).toBe(other)
            expect(a.tooltipHook).toBe(base)
            a.tooltip = own
            expect(a.tooltipHook).toBe(own)
            a.tooltip = false
            expect(a.tooltipHook).toBeUndefined()
            const el = element()
            b.setTooltip(el, 'More actions')
            expect(other).toHaveBeenCalledWith(el, 'More actions', expect.objectContaining({label: 'More actions'}))
        } finally {
            UiConfigRendererBase.Tooltip = saved
        }
    })
})
