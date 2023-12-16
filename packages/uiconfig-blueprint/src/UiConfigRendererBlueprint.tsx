import {createDiv, createStyles, css} from "ts-browser-helpers";
import {UiConfigRendererBase, UiObjectConfig} from "uiconfig.js";
import React from 'react'
import {createRoot, Root} from 'react-dom/client'
import {InspectorStackComponent} from './components/InspectorStackComponent'
import {BPComponent, UiConfigRendererContext} from './bpComponents/BPComponent'
// @ts-ignore
import rendererCss from './renderer.scss'
import {FocusStyleManager} from '@blueprintjs/core'
import {THREE} from "./threejs";

export class UiConfigRendererBlueprint extends UiConfigRendererBase<Root> {

    constructor(container: HTMLElement = document.body, {autoPostFrame = true} = {}) {
        super(container, autoPostFrame);
        // this._root.expanded = expanded

    }

    protected _createUiContainer(): HTMLDivElement {
        FocusStyleManager.onlyShowFocusOnTabs();

        const container = createDiv({id: 'blueprintUiContainer', addToBody: false})
        createStyles(css`
          :root{
            --blueprint-ui-container-width: 300px;
          }
          @media only screen and (min-width: 1500px) {
            :root{
              --blueprint-ui-container-width: 400px;
            }
          }
          @media only screen and (min-width: 2500px) {
            :root{
              --blueprint-ui-container-width: 500px;
            }
          }
        `)
        createStyles(rendererCss)

        this._root = createRoot(container, {
            identifierPrefix: 'bpUi',
            onRecoverableError: (error) => {
                console.warn(error)
            }
        })
        this._root.render(
            <React.StrictMode>
            <UiConfigRendererContext.Provider value={this}>
                <InspectorStackComponent config={this.config}/>
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

    // eslint-disable-next-line @typescript-eslint/naming-convention
    THREE: THREE|undefined = (window as any).THREE

    // todo: hidden and disabled

    // protected _renderUiConfig(uiConfig: UiObjectConfig<any, string>, parent: any): any {
    //     const ui = uiConfig.type ? this._typeGenerators[uiConfig.type]?.(parent, uiConfig, this) as BladeApi<BladeController<View>> | undefined : undefined
    //     if (ui) {
    //         ui.hidden = getOrCall(uiConfig.hidden) ?? false
    //         ui.disabled = getOrCall(uiConfig.disabled) ?? false // todo: also see if property is writable?
    //     }
    //
    //     return ui
    //
    // }

}
