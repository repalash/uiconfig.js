import React from "react";
import {Card, Panel, PanelStack2} from "@blueprintjs/core";
import {ConfigObject, ConfigProps} from "../ConfigObject";
import {UiObjectConfig} from 'uiconfig.js'
import {UiConfigRendererContext} from '../bpComponents/BPComponent'

// import {ViewerAppContext} from "./ViewerAppComponent";

export function InspectorStackComponent({config}: { config: UiObjectConfig<any, 'panel'> }) {
    const renderer = React.useContext(UiConfigRendererContext)
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
            title: renderer.methods.getLabel(config)
        }
    }, [config])
    const [currentPanelStack, setCurrentPanelStack] = React.useState<Array<Panel<{ config: UiObjectConfig<any> }>>>([stackItem()]);
    React.useEffect(() => {
        console.warn('change', config)
        setCurrentPanelStack([stackItem()])
    }, [config])

    return (
        <Card id="bpInspectorCard" style={{height: "100%", flexGrow: "1"}}>
            <PanelStack2 className="inspectorPanelStack bp5-dark"
                         renderActivePanelOnly={true}
                         onOpen={(p) => setCurrentPanelStack([...currentPanelStack, p] as any)}
                         onClose={() => setCurrentPanelStack(currentPanelStack.slice(0, -1))}
                         stack={currentPanelStack as any}/>
        </Card>
    )
}
