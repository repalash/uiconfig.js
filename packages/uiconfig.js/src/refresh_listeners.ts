import type {UiObjectConfig, UiRefreshListener} from './types'

/**
 * The refresh listeners of a config: what `config.uiRefresh()` calls.
 * - `listeners`: added with {@link addRefreshListener}, one for each renderer that draws the config
 * - `assigned`: the function of `config.uiRefresh = fn`, as before there were listeners (an app that forwards the
 *   refreshes of a config to another, a test)
 */
interface RefreshListeners {
    listeners: UiRefreshListener[]
    assigned?: UiRefreshListener
    /** `config.uiRefresh` while there are listeners: calls `assigned` and each listener */
    dispatch: UiRefreshListener
}

/**
 * The key of the {@link RefreshListeners} on a config: a non-enumerable property, so JSON, a spread (`{...config}`),
 * `Object.assign` and `structuredClone` leave it out. A global symbol, so two copies of uiconfig.js on a page (the UMD
 * bundle of a renderer includes one) share the listeners of a config.
 */
const LISTENERS = Symbol.for('uiconfig.js/refreshListeners')

type ConfigWithListeners = UiObjectConfig & {[LISTENERS]?: RefreshListeners}

/** The getter of `uiRefresh` on a config with listeners; the same function for every config (the state is on it) */
function getUiRefresh(this: ConfigWithListeners): UiRefreshListener | undefined {
    const s = this[LISTENERS]
    if (!s) return undefined
    // without listeners, the assigned function itself (as a plain property would give it back)
    return s.listeners.length ? s.dispatch : s.assigned
}
// marks the accessor, for the copies of uiconfig.js on a page
Object.defineProperty(getUiRefresh, LISTENERS, {value: true})

/** The setter of `uiRefresh` on a config with listeners: `config.uiRefresh = fn` sets the assigned function */
function setUiRefresh(this: ConfigWithListeners, fn: UiRefreshListener | undefined) {
    const s = this[LISTENERS]
    if (!s || fn === s.dispatch) return // the dispatcher read back and assigned again: no change (it would call itself)
    s.assigned = typeof fn === 'function' ? fn : undefined
}

/** New listeners of a config, with the function that calls them */
function createListeners(): RefreshListeners {
    const s: RefreshListeners = {
        listeners: [],
        // a function, not an arrow: called as `config.uiRefresh()`, `this` is the config, and an assigned method-style
        // `uiRefresh` (one that uses `this`) gets it as it did before there were listeners
        dispatch: function(this: unknown, deep, mode, delay) {
            const fns = s.assigned ? [s.assigned, ...s.listeners] : [...s.listeners]
            let failed = false
            let error: unknown
            for (const fn of fns) {
                // removed by a listener before it (for example a renderer that disposed the config): not called
                if (fn !== s.assigned && !s.listeners.includes(fn)) continue
                try {
                    fn.call(this, deep, mode, delay)
                } catch (e) {
                    // the other renderers still refresh; the first error is thrown after them
                    if (!failed) error = e
                    failed = true
                }
            }
            if (failed) throw error
        },
    }
    return s
}

/**
 * The listeners of a config, with the `uiRefresh` accessor on it. The first time, a function in `config.uiRefresh` (a
 * plain property, or one on its prototype) becomes the assigned function.
 */
function listenersOf(config: ConfigWithListeners): RefreshListeners {
    let s = config[LISTENERS]
    if (!s) {
        s = createListeners()
        Object.defineProperty(config, LISTENERS, {value: s, enumerable: false, configurable: true, writable: false})
    }
    // also after `delete config.uiRefresh`, or a plain property that replaced the accessor (Object.defineProperty). The
    // accessor of another copy of uiconfig.js works on the same listeners: it stays.
    const get = Object.getOwnPropertyDescriptor(config, 'uiRefresh')?.get as {[LISTENERS]?: boolean} | undefined
    if (!get?.[LISTENERS]) {
        const current = config.uiRefresh
        // (the dispatcher, if a foreign accessor returned it, is not an assigned function: it would call itself)
        s.assigned = typeof current === 'function' && current !== s.dispatch ? current : undefined
        Object.defineProperty(config, 'uiRefresh', {get: getUiRefresh, set: setUiRefresh, enumerable: false, configurable: true})
    }
    return s
}

/**
 * Adds a function that `config.uiRefresh(deep, mode, delay)` calls. Each renderer that draws the config adds its own,
 * so a config drawn by more than one renderer (a Tweakpane panel and a form) refreshes in all of them.
 *
 * A function assigned with `config.uiRefresh = fn` is called too, before the listeners; assigning `undefined` removes
 * only that function. `config.uiRefresh` reads back the assigned function while there are no listeners.
 *
 * The listeners are not enumerable properties of the config: JSON, a spread and `Object.assign` leave them out.
 * @param config - the config
 * @param listener - called with the arguments of `config.uiRefresh`. Added once: adding it again does nothing.
 * @returns a function that removes the listener
 */
export function addRefreshListener(config: UiObjectConfig, listener: UiRefreshListener): () => void {
    const s = listenersOf(config)
    if (!s.listeners.includes(listener)) s.listeners.push(listener)
    return () => removeRefreshListener(config, listener)
}

/**
 * Removes a function added with {@link addRefreshListener}. The function assigned to `config.uiRefresh`, and the
 * listeners of other renderers, stay.
 */
export function removeRefreshListener(config: UiObjectConfig, listener: UiRefreshListener) {
    const s = (config as ConfigWithListeners)[LISTENERS]
    if (!s) return
    const i = s.listeners.indexOf(listener)
    if (i >= 0) s.listeners.splice(i, 1)
}

