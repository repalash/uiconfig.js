import {describe, expect, test, vi} from 'vitest'
import {UiConfigMethods, UiConfigRendererBase, UiObjectConfig} from '../src'

/** A renderer that records what it refreshes, with no frame loop and no undo manager */
class TestRenderer extends UiConfigRendererBase {
    refreshed: UiObjectConfig[] = []
    constructor() {
        super(false, undefined, false)
    }
    protected _refreshUiConfigObject(config: UiObjectConfig) {
        this.refreshed.push(config)
    }
}

const flush = () => new Promise(r => setTimeout(r, 0))

describe('refresh listeners', () => {
    test('config.uiRefresh calls every listener with its arguments', () => {
        const config: UiObjectConfig = {type: 'number'}
        const a = vi.fn()
        const b = vi.fn()
        UiConfigMethods.AddRefreshListener(config, a)
        UiConfigMethods.AddRefreshListener(config, b)
        config.uiRefresh?.(true, 'immediate', 5)
        expect(a).toHaveBeenCalledWith(true, 'immediate', 5)
        expect(b).toHaveBeenCalledWith(true, 'immediate', 5)
    })

    test('a listener added twice is called once; the remove function removes it', () => {
        const config: UiObjectConfig = {type: 'number'}
        const a = vi.fn()
        const b = vi.fn()
        const removeA = UiConfigMethods.AddRefreshListener(config, a)
        UiConfigMethods.AddRefreshListener(config, a)
        UiConfigMethods.AddRefreshListener(config, b)
        config.uiRefresh?.()
        expect(a).toHaveBeenCalledTimes(1)
        removeA()
        config.uiRefresh?.()
        expect(a).toHaveBeenCalledTimes(1)
        expect(b).toHaveBeenCalledTimes(2)
        UiConfigMethods.RemoveRefreshListener(config, b)
        expect(config.uiRefresh).toBeUndefined()
    })

    test('a config without listeners: uiRefresh stays a plain property', () => {
        const fn = vi.fn()
        const config: UiObjectConfig = {type: 'number'}
        config.uiRefresh = fn
        expect(config.uiRefresh).toBe(fn)
        expect(Object.keys(config)).toContain('uiRefresh')
        config.uiRefresh = undefined
        expect(config.uiRefresh).toBeUndefined()
    })

    test('an assigned function is called with the listeners; assigning undefined removes only it', () => {
        const config: UiObjectConfig = {type: 'number'}
        const listener = vi.fn()
        const assigned = vi.fn()
        UiConfigMethods.AddRefreshListener(config, listener)
        config.uiRefresh = assigned
        config.uiRefresh?.(false, 'postFrame', 0)
        expect(assigned).toHaveBeenCalledWith(false, 'postFrame', 0)
        expect(listener).toHaveBeenCalledTimes(1)
        config.uiRefresh = undefined
        config.uiRefresh?.()
        expect(assigned).toHaveBeenCalledTimes(1)
        expect(listener).toHaveBeenCalledTimes(2)
        // a new assignment replaces the assigned function only
        const other = vi.fn()
        config.uiRefresh = other
        config.uiRefresh = vi.fn()
        config.uiRefresh?.()
        expect(other).not.toHaveBeenCalled()
        expect(listener).toHaveBeenCalledTimes(3)
    })

    test('a function assigned before the first listener is kept, and read back while there are no listeners', () => {
        const forward = vi.fn()
        const config: UiObjectConfig = {type: 'folder', uiRefresh: forward}
        const listener = vi.fn()
        const remove = UiConfigMethods.AddRefreshListener(config, listener)
        config.uiRefresh?.(true)
        expect(forward).toHaveBeenCalledWith(true, undefined, undefined)
        expect(listener).toHaveBeenCalledWith(true, undefined, undefined)
        remove()
        expect(config.uiRefresh).toBe(forward)
    })

    test('the listeners are not enumerable: JSON, a spread and Object.assign leave them out', () => {
        const config: UiObjectConfig = {type: 'number', label: 'A'}
        UiConfigMethods.AddRefreshListener(config, () => {})
        config.uiRefresh = () => {}
        expect(Object.keys(config)).toEqual(['type', 'label'])
        expect(JSON.parse(JSON.stringify(config))).toEqual({type: 'number', label: 'A'})
        const copy = {...config}
        expect(copy.uiRefresh).toBeUndefined()
        expect(Object.getOwnPropertySymbols(copy)).toEqual([])
        const assigned = Object.assign({}, config)
        expect(assigned.uiRefresh).toBeUndefined()
    })

    test('assigning the function read from uiRefresh does not make it call itself', () => {
        const config: UiObjectConfig = {type: 'number'}
        const listener = vi.fn()
        UiConfigMethods.AddRefreshListener(config, listener)
        const read = config.uiRefresh
        config.uiRefresh = read
        config.uiRefresh?.()
        expect(listener).toHaveBeenCalledTimes(1)
    })

    test('a listener removed by an earlier one is not called; an error is thrown after all the others ran', () => {
        const config: UiObjectConfig = {type: 'number'}
        const second = vi.fn()
        const third = vi.fn()
        UiConfigMethods.AddRefreshListener(config, () => UiConfigMethods.RemoveRefreshListener(config, second))
        UiConfigMethods.AddRefreshListener(config, second)
        UiConfigMethods.AddRefreshListener(config, () => {
            throw new Error('fails')
        })
        UiConfigMethods.AddRefreshListener(config, third)
        expect(() => config.uiRefresh?.()).toThrow('fails')
        expect(second).not.toHaveBeenCalled()
        expect(third).toHaveBeenCalledTimes(1)
    })

    test('after delete config.uiRefresh, the next listener puts the accessor back', () => {
        const config: UiObjectConfig = {type: 'number'}
        const a = vi.fn()
        const b = vi.fn()
        UiConfigMethods.AddRefreshListener(config, a)
        delete config.uiRefresh
        UiConfigMethods.AddRefreshListener(config, b)
        config.uiRefresh?.()
        expect(a).toHaveBeenCalledTimes(1)
        expect(b).toHaveBeenCalledTimes(1)
    })

    test('two copies of uiconfig.js on a page (the UMD bundle of a renderer has one) share the listeners of a config', async() => {
        const config: UiObjectConfig = {type: 'number'}
        const a = vi.fn()
        const b = vi.fn()
        const assigned = vi.fn()
        UiConfigMethods.AddRefreshListener(config, a)
        config.uiRefresh = assigned
        vi.resetModules()
        const other = await import('../src/refresh_listeners')
        other.addRefreshListener(config, b)
        config.uiRefresh?.()
        expect([a, b, assigned].map(f => f.mock.calls.length)).toEqual([1, 1, 1])
        UiConfigMethods.RemoveRefreshListener(config, b)
        config.uiRefresh?.()
        expect([a, b, assigned].map(f => f.mock.calls.length)).toEqual([2, 1, 2])
    })
})

describe('refresh listeners: the receiver', () => {
    test('an assigned method-style uiRefresh is called on the config, with and without listeners', () => {
        const seen: unknown[] = []
        const config: UiObjectConfig = {
            type: 'folder',
            uiRefresh(this: UiObjectConfig) {
                seen.push(this)
            },
        }
        config.uiRefresh!()
        UiConfigMethods.AddRefreshListener(config, () => {})
        config.uiRefresh!()
        expect(seen).toEqual([config, config])
    })
})

describe('renderer refresh listeners', () => {
    test('two renderers on one config both refresh it; disposeUiConfig removes only the listener of its renderer', async() => {
        const config: UiObjectConfig = {type: 'number'}
        const r1 = new TestRenderer()
        const r2 = new TestRenderer()
        r1.addRefreshListener(config)
        r2.addRefreshListener(config)
        const assigned = vi.fn()
        config.uiRefresh = assigned
        config.uiRefresh?.(false, 'immediate')
        await flush()
        expect(r1.refreshed).toEqual([config])
        expect(r2.refreshed).toEqual([config])

        r1.disposeUiConfig(config)
        config.uiRefresh?.(false, 'immediate')
        await flush()
        expect(r1.refreshed).toEqual([config])
        expect(r2.refreshed).toEqual([config, config])
        expect(assigned).toHaveBeenCalledTimes(2) // the assigned function stays

        r2.disposeUiConfig(config)
        expect(config.uiRefresh).toBe(assigned)
    })

    test('a renderer adds one listener per config; its remove function and removeRefreshListener remove it', async() => {
        const config: UiObjectConfig = {type: 'number'}
        const r = new TestRenderer()
        const remove = r.addRefreshListener(config)
        r.addRefreshListener(config)
        config.uiRefresh?.(false, 'immediate')
        await flush()
        expect(r.refreshed).toEqual([config])
        remove()
        expect(config.uiRefresh).toBeUndefined()
        r.addRefreshListener(config)
        r.removeRefreshListener(config)
        expect(config.uiRefresh).toBeUndefined()
    })

    test('the default listener queues the refresh in the given mode (postFrame when none is given)', () => {
        const config: UiObjectConfig = {type: 'number'}
        const r = new TestRenderer()
        r.addRefreshListener(config)
        config.uiRefresh?.()
        expect(r.refreshed).toEqual([])
        r.refreshQueue('postFrame')
        expect(r.refreshed).toEqual([config])
    })
})
