import React from "react";
import {Button, Card, Panel, PanelStack2, Popover} from "@blueprintjs/core";
import {ConfigObject, ConfigProps} from "../ConfigObject";
import {UiObjectConfig} from 'uiconfig.js'
import {UiConfigRendererContext} from '../bpComponents/BPComponent'
import {Classes} from '@blueprintjs/core/src/common'
import {
    defaultVisualStyle,
    setupVisualStyle,
    ThemeSettingsMenuComponent,
    VisualStyleContext
} from './VisualStyleContext'

// import {ViewerAppContext} from "./ViewerAppComponent";

export function ConfigurationPanelComponent({config}: { config: UiObjectConfig<any, 'panel'> }) {
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
        } as Panel<{ config: UiObjectConfig }>
    }, [config])
    const [currentPanelStack, setCurrentPanelStack] = React.useState<Array<Panel<{ config: UiObjectConfig }>>>([stackItem()]);

    React.useEffect(() => {
        setCurrentPanelStack([stackItem()])
    }, [stackItem, setCurrentPanelStack])

    const style = setupVisualStyle()

    return (
        <VisualStyleContext.Provider value={{...defaultVisualStyle, ...style}}>
        <Card id="bpInspectorCard" className={style.darkMode?Classes.DARK:""} style={{height: "100%", flexGrow: "1", position: "relative"}}>
            <PanelStack2 className="inspectorPanelStack"
                         showPanelHeader={true}
                         renderActivePanelOnly={true}
                         onOpen={(p) => setCurrentPanelStack([...currentPanelStack, p] as any)}
                         onClose={() => setCurrentPanelStack(currentPanelStack.slice(0, -1))}
                         stack={currentPanelStack}/>
            <div className={"bpPanelStackHeaderOverlay " + Classes.PANEL_STACK2_HEADER}>
                <Popover targetProps={{style: {position: "absolute", right: "5px"}}}
                         minimal={true}
                         targetTagName={"div"}
                    content={
                    <ThemeSettingsMenuComponent/>
                } placement="bottom">
                    <Button icon="cog" small minimal text="" />
                </Popover>
            </div>
        </Card>
        </VisualStyleContext.Provider>
    )
}
