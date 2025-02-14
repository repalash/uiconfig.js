import React from "react";
import {UiConfigRendererContext} from "./UiConfigBase.tsx";
import {UiObjectConfig} from 'uiconfig.js'

export type UiConfigTypes = 'input' | 'button' | 'folder' | 'checkbox' | 'toggle' |
    'dropdown' | 'slider' | 'color' | 'image' | 'number' /*| 'panel'*/ | 'tree' | 'hierarchy' |
    'vec' | 'vec2' | 'vec3' | 'vec4' | 'monitor'

export interface ConfigProps {
    config: UiObjectConfig;
    level?: number,
}

export const ConfigObject = (props: ConfigProps) => {
    const context = React.useContext(UiConfigRendererContext)
    context.methods.initUiConfig(props.config)
    if (!props.config.type) return (<div key={props.config.uuid}></div>)
    let type = props.config.type as any as UiConfigTypes
    const val = context.methods.getRawValue(props.config)

    // hacks
    if (type === 'input' && typeof val === 'number') props.config.type = type = 'number'
    if (type === 'input' && typeof val === 'boolean') props.config.type = type = 'toggle'
    if (type === 'monitor') {
        props.config.type = type = 'input'
        props.config.readOnly = true
    }
    if (val && type === 'input' && typeof (val as any).x === 'number') props.config.type = type = 'vec'

    if(!context.ConfigObjectGenerators) return null
    let UiConfigComp = context.ConfigObjectGenerators[type]
    if (UiConfigComp) {
        return (<div key={props.config.uuid}><UiConfigComp {...{...props}} /></div>)
    }
    return (<><div key={props.config.uuid}>Unknown type: {props.config.type}</div><br/></>)
}