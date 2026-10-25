import React from "react";
import {Card, Panel, PanelStack2} from "@blueprintjs/core";
import {ConfigObject, ConfigProps} from "../ConfigObject";
import {UiObjectConfig} from 'uiconfig.js'
import {UiConfigRendererBaseBp, UiConfigRendererContext} from '../bpComponents/BPComponent'
import {getOrCall, ValOrFunc} from "ts-browser-helpers";

// import {ViewerAppContext} from "./ViewerAppComponent";

export function useConfigToStackItem(config: UiObjectConfig<any, 'panel'>, renderer?: UiConfigRendererBaseBp){
    renderer = renderer ?? React.useContext(UiConfigRendererContext)
    if(!renderer) throw new Error('No renderer provided or found in context')
    const stackItem = React.useCallback(() => {
        return {
            props: {config: config},
            renderPanel(props: ConfigProps) {
                // console.log(props.config === config)
                return (
                    <ul style={{listStyleType: "none", paddingLeft: "0", margin: "0"}}>
                        {/*{v && (<ConfigObject {...props}/>)}*/}
                        {config && (<ConfigObject {...props} isPanel={true}/>)}
                    </ul>
                )
            },
            title: renderer!.methods.getLabel(config)
        } as Panel<{ config: UiObjectConfig }>
    }, [config])
    return stackItem
}
export type InspectorStackItem = ValOrFunc<Panel<{ config: UiObjectConfig }>>
function getStackItem(i: InspectorStackItem){
    const r = getOrCall(i)
    return r?[r] : []
}
export function InspectorStackComponent({stackItem, className}: {
    stackItem: InspectorStackItem,
    className?: string
}) {
    const [currentPanelStack, setCurrentPanelStack] = React.useState<Array<Panel<{ config: UiObjectConfig }>>>(getStackItem(stackItem));
    React.useEffect(() => {
        // console.warn('change', stackItem)
        setCurrentPanelStack(getStackItem(stackItem))
    }, [setCurrentPanelStack, stackItem])

    return (
        <Card className={"bpInspectorCard " + className||''} style={{borderRadius: 0}}>
            <PanelStack2 className="inspectorPanelStack"
                         showPanelHeader={true}
                         renderActivePanelOnly={true}
                         onOpen={(p) => setCurrentPanelStack([...currentPanelStack, p] as any)}
                         onClose={() => setCurrentPanelStack(currentPanelStack.slice(0, -1))}
                         stack={currentPanelStack}/>
        </Card>
    )
}
