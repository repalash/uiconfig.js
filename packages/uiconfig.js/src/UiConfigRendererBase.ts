import {getUrlQueryParam, JSUndoManager, now, SimpleEventDispatcher, timeout} from 'ts-browser-helpers'
import {TUiRefreshModes, UiObjectConfig, UiRefreshListener} from './types'
import {UiConfigMethods} from './UiConfigMethods'
import {setElementTooltip, titleTooltip, UiTooltipHook, UiTooltipInfo} from './tooltips'

export abstract class UiConfigRendererBase extends SimpleEventDispatcher<'preFrame'|'preRender'|'postRender'|'postFrame'> {
    /**
     * The tooltip hook of the renderers that set no {@link tooltip}: set it here for every renderer, or on a renderer
     * class for those of that class (`UiConfigRendererTweakpane.Tooltip = ...`). Default: the native `title`
     * ({@link titleTooltip}). See {@link UiTooltipHook}.
     */
    static Tooltip: UiTooltipHook = titleTooltip

    /** The tooltip hook of this renderer, or `false` for no tooltips; default: the static `Tooltip` of its class */
    tooltip?: UiTooltipHook | false

    /** The tooltip hook that this renderer uses ({@link tooltip}, else the static `Tooltip` of its class), or none */
    get tooltipHook(): UiTooltipHook | undefined {
        if (this.tooltip === false) return undefined
        return this.tooltip ?? (this.constructor as typeof UiConfigRendererBase).Tooltip
    }

    /**
     * Sets, changes or removes the tooltip of an element of this renderer with its {@link tooltipHook} (see
     * {@link setElementTooltip}): call it again when the text changes, and with no text to remove it.
     */
    setTooltip(element: HTMLElement, text?: string, info?: Partial<UiTooltipInfo>) {
        setElementTooltip(this.tooltipHook, element, text, info)
    }

    public readonly methods: UiConfigMethods
    private _undoManager?: JSUndoManager

    get undoManager() {
        return this._undoManager
    }
    set undoManager(value: JSUndoManager|undefined) {
        this._undoManager = value
        if (this._undoManager) Object.assign(this._undoManager.presets, this.methods.undoPresets)
    }

    protected _autoFrameEvents: boolean
    protected constructor(autoFrameEvents = true, methods?: UiConfigMethods, undoManager?: JSUndoManager|false) {
        super()
        this.methods = methods || new UiConfigMethods(this)
        this.undoManager = undoManager === false ? undefined : undoManager || new JSUndoManager({bindHotKeys: true, limit: 1000, debug: getUrlQueryParam('debugUndo') !== null})
        this._autoFrameEvents = autoFrameEvents
        if (autoFrameEvents) {
            this.addEventListener('preFrame', () => this.refreshQueue('preFrame'))
            this.addEventListener('postFrame', () => this.refreshQueue('postFrame'))
            this.addEventListener('preRender', () => this.refreshQueue('preRender'))
            this.addEventListener('postRender', () => this.refreshQueue('postRender'))
        }
    }

    private _rafId: number | null = null

    raf = () => {
        if (!this._autoFrameEvents) return
        this.dispatchEvent({type: 'preFrame'})
        this.dispatchEvent({type: 'preRender'})
        this.dispatchEvent({type: 'postRender'})
        this.dispatchEvent({type: 'postFrame'})
        this._rafId = requestAnimationFrame(this.raf)
    }

    // call from render or onMount
    start() {
        if (this._rafId === null) {
            this._rafId = requestAnimationFrame(this.raf)
        }
    }
    // call from unmount or onDispose etc
    stop() {
        if (this._rafId !== null) {
            cancelAnimationFrame(this._rafId)
            this._rafId = null
        }
    }

    protected _refreshQueue: Record<TUiRefreshModes, [UiObjectConfig, number, string | undefined][]> = { // [config, delay, uuid]
        'preRender': [],
        'postRender': [],
        'preFrame': [],
        'postFrame': [],
    }

    private _lastModeTime: Record<TUiRefreshModes, number> = {
        'preRender': 0,
        'postRender': 0,
        'preFrame': 0,
        'postFrame': 0,
    }

    refreshQueue(mode: TUiRefreshModes) {
        const l = this._refreshQueue[mode]
        // a refresh queued while this runs goes to the new list, and runs at the next run
        this._refreshQueue[mode] = []
        const t = now()
        const delta = t - this._lastModeTime[mode]
        this._lastModeTime[mode] = t
        for (const value of l) { // todo: add option to disable ui refresh like for when animating
            if (value[1] > 0.001) this._addToRefreshQueue(mode, value[0], value[1] - delta)
            else this._refreshUiConfigObject(value[0])
        }
    }

    private _addToRefreshQueue(mode: TUiRefreshModes, config: UiObjectConfig, delay: number) {
        const uuid = config.uuid
        const l = this._refreshQueue[mode]
        // if (uuid) {
        //     l = l.filter(v=>v[3] !== uuid)
        // }
        // console.warn('add to refresh queue:', uuid)
        const old = l.find(value => value[2] === uuid)
        if (!old)
            l.push([config, delay, uuid])
        else {
            old[1] = Math.max(old[1], delay) // push delay
        }
        this._refreshQueue[mode] = l
    }

    /** The refresh listener of this renderer on each config that it draws, see {@link addRefreshListener} */
    private _refreshListeners = new WeakMap<UiObjectConfig, UiRefreshListener>()

    /**
     * Makes `config.uiRefresh()` refresh the UI of the config in this renderer, next to the other renderers that draw
     * it (`UiConfigMethods.AddRefreshListener`). Call it when the config is rendered; once per config: a second call
     * keeps the first listener. {@link disposeUiConfig} and {@link removeRefreshListener} remove it.
     * @returns a function that removes the listener
     */
    addRefreshListener(config: UiObjectConfig): () => void {
        let listener = this._refreshListeners.get(config)
        if (!listener) {
            listener = this._createRefreshListener(config)
            this._refreshListeners.set(config, listener)
        }
        UiConfigMethods.AddRefreshListener(config, listener)
        return () => this.removeRefreshListener(config)
    }

    /** Removes the refresh listener of this renderer from a config ({@link addRefreshListener}); other renderers keep theirs */
    removeRefreshListener(config: UiObjectConfig) {
        const listener = this._refreshListeners.get(config)
        if (!listener) return
        this._refreshListeners.delete(config)
        UiConfigMethods.RemoveRefreshListener(config, listener)
    }

    /**
     * The function that this renderer adds to `config.uiRefresh` ({@link addRefreshListener}). Default: queues a
     * refresh of the config in this renderer ({@link addToRefreshQueue}, `postFrame` when no mode is given).
     */
    protected _createRefreshListener(config: UiObjectConfig): UiRefreshListener {
        return (deep = false, mode = 'postFrame', delay = 0) => this.addToRefreshQueue(mode, config, deep, delay)
    }

    /**
     * Disposes the UI associated with a config, doesn't makes change to the object or its parent.
     * Removes the refresh listener of this renderer from the config; the listeners of other renderers, and a function
     * assigned to `config.uiRefresh`, stay.
     * @param config
     * @param performDispose
     */
    disposeUiConfig(config?: UiObjectConfig, performDispose = true) {
        if (!config) return
        if (config.uiRef) {
            if (performDispose) config.uiRef.dispose?.()
            config.uiRef = undefined
        }
        config.uiRefType = undefined
        this.removeRefreshListener(config)
    }

    addToRefreshQueue(mode: TUiRefreshModes | 'immediate', uiConfig: UiObjectConfig, deep: boolean, delay: number) {
        const list = deep ? this._flattenUiConfig(uiConfig) : [uiConfig]
        for (const value of list) {
            if (mode === 'immediate') timeout(delay).then(()=>this._refreshUiConfigObject(value))
            else this._addToRefreshQueue(mode, value, delay)
        }
    }
    protected abstract _refreshUiConfigObject(config: UiObjectConfig): void

    private _flattenUiConfig(uiC: UiObjectConfig, list?: UiObjectConfig[]) {
        list = list ?? []
        if (!uiC || !uiC.uiRef) return list
        list.push(uiC)
        if (typeof uiC.children === 'function') return list // todo call function, see below.
        uiC.children?.forEach(value => {
            if (typeof value === 'function') {
                return
                //  todo: call function. this is commented because it makes it slower and it doesnt matter much since result of function most likely wont have uiRef
                // value = value()
            }
            if (!value) return
            if (Array.isArray(value)) value.forEach(v1 => list = this._flattenUiConfig(v1, list))
            else list = this._flattenUiConfig(value, list)
        })
        return list
    }

}

