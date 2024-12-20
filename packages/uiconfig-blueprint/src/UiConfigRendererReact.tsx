import {createDiv, createStyles} from "ts-browser-helpers";
import {UiConfigRendererBase, UiObjectConfig} from "uiconfig.js";
import React from 'react'
import {createRoot, Root} from 'react-dom/client'
import {BPComponent, UiConfigRendererContext} from './bpComponents/BPComponent'
// @ts-ignore
import rendererCss from './renderer.scss?inline'
import {ConfigObject} from "./ConfigObject"; // for rollup build remove ?inline
// import {FocusStyleManager} from '@blueprintjs/core'
// import {THREE} from "./threejs";

export class UiConfigRendererReact extends UiConfigRendererBase<Root> {

    constructor(container: HTMLElement = document.body, {autoPostFrame = true} = {}) {
        super(container, autoPostFrame);
        // this._root.expanded = expanded
    }

    protected _createUiContainer(): HTMLDivElement {
        // FocusStyleManager.onlyShowFocusOnTabs();

        const container = createDiv({id: 'reactUiContainer', addToBody: false})
        createStyles(rendererCss)
        // @ts-ignore
        this.config.type = 'folder'
        console.log(this.config)

        this._root = createRoot(container, {
            identifierPrefix: 'ui-cfg',
            onRecoverableError: (error) => {
                console.warn(error)
            }
        })
        this._root.render(
            <React.StrictMode>
            <UiConfigRendererContext.Provider value={this}>
                <ConfigObject config={this.config}/>
            </UiConfigRendererContext.Provider>
            </React.StrictMode>
        )
        return container
    }

    protected _refreshUiConfigObject(config: UiObjectConfig): void {
        (config.uiRef as BPComponent<any, any>).refreshConfigState()
    }

    renderUiConfig(_: UiObjectConfig): void {
        return;
    }

    // // eslint-disable-next-line @typescript-eslint/naming-convention
    // THREE: THREE|undefined = (window as any).THREE

    dispose() {
        // todo
    }

}
