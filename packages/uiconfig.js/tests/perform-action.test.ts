import {describe, expect, test, vi} from 'vitest'
import {JSUndoManager} from 'ts-browser-helpers'
import {UiConfigRendererBase, UiObjectConfig} from '../src'

/** A renderer with an undo manager (its presets replay the action steps) and no frame loop */
class TestRenderer extends UiConfigRendererBase {
    constructor(undoManager: JSUndoManager) {
        super(false, undefined, undoManager)
    }
    protected _refreshUiConfigObject() {
        // nothing drawn
    }
}

function setup() {
    const undoManager = new JSUndoManager({limit: 100, debug: false, bindHotKeys: false})
    const renderer = new TestRenderer(undoManager)
    const config: UiObjectConfig = {type: 'button', label: 'Act'}
    return {undoManager, methods: renderer.methods, config}
}

// the undo manager runs the steps without waiting; the replays are async
const wait = () => new Promise(r => setTimeout(r, 0))

describe('PerformAction', () => {
    test('a returned undo function: undo, redo, undo leaves nothing (the undo of the redo run undoes it)', async() => {
        const {undoManager, methods, config} = setup()
        const objects: number[] = []
        let next = 1
        const add = () => {
            const id = next++
            objects.push(id)
            return () => {
                const i = objects.indexOf(id)
                if (i >= 0) objects.splice(i, 1)
            }
        }
        await methods.performAction(undefined, add, [], config)
        expect(objects).toEqual([1])
        undoManager.undo()
        await wait()
        expect(objects).toEqual([])
        undoManager.redo() // runs the action again: object 2
        await wait()
        expect(objects).toEqual([2])
        undoManager.undo()
        await wait()
        expect(objects).toEqual([])
        undoManager.redo()
        await wait()
        expect(objects).toEqual([3])
    })

    test('undo and redo are read when they run: an undo that replaces the redo (like EntityComponentPlugin.addComponent)', async() => {
        const {undoManager, methods, config} = setup()
        const ids: number[] = []
        let next = 1
        const add = () => {
            const id = next++
            ids.push(id)
            const action: any = {
                undo: () => {
                    ids.splice(ids.indexOf(id), 1)
                    action.redo = () => ids.push(id) // the redo brings back the same id
                },
                redo: () => ids.push(next++),
            }
            return action
        }
        await methods.performAction(undefined, add, [], config)
        undoManager.undo()
        await wait()
        expect(ids).toEqual([])
        undoManager.redo()
        await wait()
        expect(ids).toEqual([1])
    })

    test('an object with action and undo: the action runs now, redo runs it again; undo and redo are called on the object', async() => {
        const {undoManager, methods, config} = setup()
        const target = {x: 0}
        const result = {
            x: 5,
            action() {
                target.x = this.x
            },
            undo() {
                target.x = 0
            },
        }
        await methods.performAction(undefined, () => result, [], config)
        expect(target.x).toBe(5)
        undoManager.undo()
        await wait()
        expect(target.x).toBe(0)
        undoManager.redo()
        await wait()
        expect(target.x).toBe(5)
    })

    test('an object with only undo: redo runs the action again', async() => {
        const {undoManager, methods, config} = setup()
        const target = {count: 0}
        const inc = () => {
            target.count++
            return {undo: () => target.count--}
        }
        await methods.performAction(undefined, inc, [], config)
        undoManager.undo()
        await wait()
        expect(target.count).toBe(0)
        undoManager.redo()
        await wait()
        expect(target.count).toBe(1)
    })

    test('the action is called on its target with the arguments; onUndoRedo is called after an undo and a redo', async() => {
        const {undoManager, methods, config} = setup()
        const target = {n: 0, add(k: number) {
            this.n += k
            return () => this.n -= k
        }}
        const onUndoRedo = vi.fn()
        await methods.performAction(target, target.add, [2], config, onUndoRedo)
        expect(target.n).toBe(2)
        undoManager.undo()
        await wait()
        expect(target.n).toBe(0)
        undoManager.redo()
        await wait()
        expect(target.n).toBe(2)
        expect(onUndoRedo).toHaveBeenCalledTimes(2)
    })

    test('onPending: called once when the action returns a promise, not for a synchronous action or a redo', async() => {
        const {undoManager, methods, config} = setup()
        const pending = vi.fn()
        await methods.performAction(undefined, () => () => {}, [], config, undefined, pending)
        expect(pending).not.toHaveBeenCalled()
        let resolve!: () => void
        let runs = 0
        const done = methods.performAction(undefined, () => {
            runs++
            return new Promise<() => void>(r => resolve = () => r(() => {}))
        }, [], config, undefined, pending)
        expect(pending).toHaveBeenCalledTimes(1) // before the promise settles
        resolve()
        await done
        undoManager.undo()
        await wait()
        undoManager.redo()
        await wait()
        resolve()
        await wait()
        expect(runs).toBe(2)
        expect(pending).toHaveBeenCalledTimes(1)
    })

    test('onPending: an async action of a returned {action, undo}, once (also when the outer function is async)', async() => {
        const {methods, config} = setup()
        const pending = vi.fn()
        let resolve!: () => void
        const done = methods.performAction(undefined, () => ({action: () => new Promise<void>(r => resolve = r), undo: () => {}}), [], config, undefined, pending)
        expect(pending).toHaveBeenCalledTimes(1) // before the action settles
        resolve()
        await done
        const pending2 = vi.fn()
        await methods.performAction(undefined, async() => ({action: async() => {}, undo: () => {}}), [], config, undefined, pending2)
        expect(pending2).toHaveBeenCalledTimes(1)
    })

    test('an action that returns no undo records no step; an error rejects the promise', async() => {
        const {undoManager, methods, config} = setup()
        await methods.performAction(undefined, () => 5, [], config)
        expect(undoManager.peek()).toBeFalsy()
        await expect(methods.performAction(undefined, () => {
            throw new Error('nope')
        }, [], config)).rejects.toThrow('nope')
    })
})
