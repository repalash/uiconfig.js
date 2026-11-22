import {describe, expect, test} from 'vitest'
import {UiConfigRendererBase, UiObjectConfig} from '../src'

/** A renderer that records what it refreshes, and can run a callback for one config while the queue runs */
class TestRenderer extends UiConfigRendererBase {
    refreshed: UiObjectConfig[] = []
    onRefresh = new Map<UiObjectConfig, () => void>()
    constructor() {
        super(false, undefined, false)
    }
    protected _refreshUiConfigObject(config: UiObjectConfig) {
        this.refreshed.push(config)
        this.onRefresh.get(config)?.()
    }
}

const config = (label: string): UiObjectConfig => ({type: 'number', label, uuid: label})

describe('refresh queue', () => {
    test('a refresh queued in a mode while that mode runs is kept, and runs at its next run', () => {
        const r = new TestRenderer()
        const a = config('a'), b = config('b')
        r.onRefresh.set(a, () => r.addToRefreshQueue('postFrame', b, false, 0))
        r.addToRefreshQueue('postFrame', a, false, 0)
        r.refreshQueue('postFrame')
        expect(r.refreshed).toEqual([a])
        r.refreshQueue('postFrame')
        expect(r.refreshed).toEqual([a, b])
    })

    test('a config that refreshes itself while the queue runs runs once per run, not in a loop', () => {
        const r = new TestRenderer()
        const a = config('a')
        r.onRefresh.set(a, () => r.addToRefreshQueue('postFrame', a, false, 0))
        r.addToRefreshQueue('postFrame', a, false, 0)
        r.refreshQueue('postFrame')
        r.refreshQueue('postFrame')
        expect(r.refreshed).toEqual([a, a])
    })

    test('a delayed refresh stays queued until its delay passes, and is not doubled when queued again', async() => {
        const r = new TestRenderer()
        const a = config('a')
        r.addToRefreshQueue('postFrame', a, false, 30)
        r.refreshQueue('postFrame')
        expect(r.refreshed).toEqual([])
        r.addToRefreshQueue('postFrame', a, false, 0)
        await new Promise(res => setTimeout(res, 40))
        r.refreshQueue('postFrame')
        expect(r.refreshed).toEqual([a])
        r.refreshQueue('postFrame')
        expect(r.refreshed).toEqual([a])
    })
})
