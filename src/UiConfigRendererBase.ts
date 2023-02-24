import {createDiv, now, SimpleEventDispatcher, timeout} from 'ts-browser-helpers'
import {TUiRefreshModes, UiObjectConfig} from './types'
import {UiConfigMethods} from './UiConfigMethods'

export abstract class UiConfigRendererBase<TUiNode = any> extends SimpleEventDispatcher<'preFrame'|'preRender'|'postRender'|'postFrame'> {
    public readonly methods: UiConfigMethods

    readonly config: UiObjectConfig<any, 'panel'> = {
        type: 'panel',
        label: 'Configuration',
        children: [],
    }
    protected constructor(container: HTMLElement = document.body, autoFrameEvents = true, methods?: UiConfigMethods) {
        super()
        this.methods = methods || new UiConfigMethods(this)
        const uiContainer = this._createUiContainer()
        container.appendChild(uiContainer)

        if (autoFrameEvents) {
            this.addEventListener('preFrame', () => this.refreshQueue('preFrame'))
            this.addEventListener('postFrame', () => this.refreshQueue('postFrame'))
            this.addEventListener('preRender', () => this.refreshQueue('preRender'))
            this.addEventListener('postRender', () => this.refreshQueue('postRender'))
            const fn = () => {
                this.dispatchEvent({type: 'preFrame'})
                this.dispatchEvent({type: 'preRender'})
                this.dispatchEvent({type: 'postRender'})
                this.dispatchEvent({type: 'postFrame'})
                requestAnimationFrame(fn)
            }
            requestAnimationFrame(fn)
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
        const l2: any[] = []
        const t = now()
        const delta = t - this._lastModeTime[mode]
        l.forEach(value => {
            if (value[1] > 0.001) {
                value[1] -= delta
                l2.push(value)
            } else
                this._refreshUiConfigObject(value[0])
        }) // todo: add option to disable ui refresh like for when animating
        this._refreshQueue[mode] = l2
        this._lastModeTime[mode] = t
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

    dispose() {
        // todo
    }

    // appendUiConfig(uiConfig: UiObjectConfig): void {
    //     if (!uiConfig) return
    //     this._renderUiConfig(uiConfig)
    // }

    appendChild(config: UiObjectConfig) {
        this.config.children!.push(config)
        this.refreshRoot()
    }
    removeChild(config: UiObjectConfig) {
        const index = this.config.children!.indexOf(config)
        if (index === -1) return
        this.config.children!.splice(index, 1)
        this.disposeUiConfig(config)
        this.refreshRoot()
    }

    refreshRoot(deep = true, mode: TUiRefreshModes | 'immediate' = 'postFrame', delay = 0) {
        this.config.uiRefresh?.(deep, mode, delay)
    }

    abstract renderUiConfig(uiConfig: UiObjectConfig): void

    protected _root?: TUiNode

    /**
     * Disposes the UI associated with a config, doesn't makes change to the object or its parent.
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
        config.uiRefresh = undefined
    }

    addToRefreshQueue(mode: TUiRefreshModes | 'immediate', uiConfig: UiObjectConfig, deep: boolean, delay: number) {
        const list = deep ? this._flattenUiConfig(uiConfig) : [uiConfig]
        for (const value of list) {
            if (mode === 'immediate') timeout(delay).then(()=>this._refreshUiConfigObject(value))
            else this._addToRefreshQueue(mode, value, delay)
        }
    }
    protected abstract _refreshUiConfigObject(config: UiObjectConfig): void

    protected _createUiContainer(): HTMLDivElement {
        return createDiv({id: 'uiConfigContainer', addToBody: false})
    }

    private _flattenUiConfig(uiC: UiObjectConfig, list?: UiObjectConfig[]) {
        list = list ?? []
        if (!uiC || !uiC.uiRef) return list
        list.push(uiC)
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
