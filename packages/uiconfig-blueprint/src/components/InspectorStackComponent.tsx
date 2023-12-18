import React from "react";
import {Button, Card, Panel, PanelStack2, Popover} from "@blueprintjs/core";
import {ConfigObject, ConfigProps} from "../ConfigObject";
import {UiObjectConfig} from 'uiconfig.js'
import {UiConfigRendererContext} from '../bpComponents/BPComponent'
import {Classes} from '@blueprintjs/core/src/common'
import {defaultVisualStyle, ThemeSettingsMenuComponent, VisualStyleContext} from './VisualStyleContext'

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
        } as Panel<{ config: UiObjectConfig }>
    }, [config])
    const [currentPanelStack, setCurrentPanelStack] = React.useState<Array<Panel<{ config: UiObjectConfig }>>>([stackItem()]);
    React.useEffect(() => {
        // console.warn('change', config)
        setCurrentPanelStack([stackItem()])
    }, [config])

    const localStoragePrefix = 'bpUi'
    const localStorageIds = {
        'darkMode': localStoragePrefix + 'DarkMode',
        'theme': localStoragePrefix + 'Theme',
    }
    const [darkMode, setDarkMode] = React.useState(localStorage.getItem(localStorageIds.darkMode) !== (defaultVisualStyle.darkMode ? 'false' : 'true'))
    React.useEffect(() => {
        localStorage.setItem('bpUiDarkMode', darkMode ? 'true' : 'false')
    }, [darkMode])
    const [theme, setTheme] = React.useState(localStorage.getItem(localStorageIds.theme) || defaultVisualStyle.theme)
    React.useEffect(() => {
        localStorage.setItem('bpUiTheme', theme)
        document.documentElement.classList.remove(...Object.keys(defaultVisualStyle.themes).map(k => k))
        document.documentElement.classList.add(theme)
    }, [theme])

    return (
        <VisualStyleContext.Provider value={{...defaultVisualStyle, darkMode, setDarkMode, theme, setTheme}}>
        <Card id="bpInspectorCard" className={darkMode?Classes.DARK:""} style={{height: "100%", flexGrow: "1", position: "relative"}}>
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
