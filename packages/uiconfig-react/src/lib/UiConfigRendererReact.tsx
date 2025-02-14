import {Class, createDiv, createStyles, PartialRecord} from "ts-browser-helpers";
import {UiConfigRendererBase, UiObjectConfig} from "uiconfig.js";
import React from 'react'
import {createRoot, Root} from 'react-dom/client'
import {ConfigObject, UiConfigTypes} from "../components/ConfigObject.tsx"; // for rollup build remove ?inline
import {UiConfigBase, UiConfigBaseProps, UiConfigBaseState, UiConfigRendererContext} from "../components/UiConfigBase.tsx";
// import {FocusStyleManager} from '@blueprintjs/core'
// import {THREE} from "./threejs";

export class UiConfigRendererReact extends UiConfigRendererBase {
    ConfigObjectGenerators: PartialRecord<UiConfigTypes, Class<React.Component<UiConfigBaseProps<any>, UiConfigBaseState>>|((props: UiConfigBaseProps<any>) => React.JSX.Element)> = {}

    constructor({autoPostFrame = true} = {}) {
        super(autoPostFrame);
        // this._root.expanded = expanded
    }

    protected _refreshUiConfigObject(config: UiObjectConfig): void {
        (config.uiRef as UiConfigBase<any, any>)?.refreshConfigState()
    }

    static Provider = ({renderer, rClass, children}: {renderer?: UiConfigRendererReact, rClass?: Class<UiConfigRendererReact>, children: React.ReactNode})=>{
        const [_renderer, setRenderer] = React.useState<UiConfigRendererReact|undefined>(renderer)
        React.useEffect(() => {
            const r = renderer ?? new (rClass ?? this)()
            r.start()
            setRenderer(r)
            return () => r.stop()
        }, [])
        return _renderer ? <UiConfigRendererContext.Provider value={_renderer}>{children}</UiConfigRendererContext.Provider> : null
    }

    // todo note - this.config is not used, it should be removed from the base class also in the ui-config package as it can create confusion
    render(config: UiObjectConfig, container: HTMLElement = document.body) {
        // this._css && createStyles(this._css)
        const container2 = createDiv({id: 'reactUiContainer', addToBody: false})
        // @ts-ignore
        // this.config.type = 'folder'
        // console.log(this.config)

        this._root = createRoot(container2, {
            identifierPrefix: 'ui-cfg',
            onRecoverableError: (error) => {
                console.warn(error)
            }
        })
        container.appendChild(container2)

        this._root?.render(
            <React.StrictMode>
                <UiConfigRendererContext.Provider value={this}>
                    <ConfigObject config={config??{}}/>
                </UiConfigRendererContext.Provider>
            </React.StrictMode>
        )
        this.start()
        return container2
    }

    protected _root?: Root

    unmount() {
        this._root?.unmount()
        this.stop()
    }

}

export function ConfigObject2(props: {config: UiObjectConfig, css: string}) {
    const [renderer, setRenderer] = React.useState<UiConfigRendererReact>()
    React.useEffect(() => {
        const r = new UiConfigRendererReact()
        r.start()
        setRenderer(r)
        const styles = createStyles(props.css)
        return () => {
            styles?.remove()
            r.stop()
        }
    }, [])
    return renderer ? (
        <UiConfigRendererContext.Provider value={renderer}>
            <ConfigObject config={props.config}/>
        </UiConfigRendererContext.Provider>
    ) : null
}