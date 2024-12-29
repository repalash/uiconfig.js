import {TUiRefreshModes, UiObjectConfig} from './types'
import {UiConfigMethods} from './UiConfigMethods'
import {createDiv, JSUndoManager} from 'ts-browser-helpers'
import {UiConfigRendererBase} from './UiConfigRendererBase'

export abstract class UiConfigRenderer extends UiConfigRendererBase {
    readonly config: UiObjectConfig<any, 'panel'> = {
        type: 'panel',
        label: 'Configuration',
        children: [],
    }

    private _uiContainer: HTMLElement

    protected constructor(container: HTMLElement = document.body, autoFrameEvents = true, methods?: UiConfigMethods, undoManager?: JSUndoManager|false) {
        super(autoFrameEvents, methods, undoManager)
        this._uiContainer = this._createUiContainer()
        container.appendChild(this._uiContainer)
        this.start()
    }

    unmount() {
        this.disposeUiConfig(this.config)
        this._uiContainer.remove()
        this.stop()
    }

    // appendUiConfig(uiConfig: UiObjectConfig): void {
    //     if (!uiConfig) return
    //     this._renderUiConfig(uiConfig)
    // }

    appendChild(config?: UiObjectConfig, params?: UiObjectConfig) {
        if (!config) return
        Object.assign(config, params)
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

    protected _createUiContainer(): HTMLDivElement {
        return createDiv({id: 'uiConfigContainer', addToBody: false})
    }

}