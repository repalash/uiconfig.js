import React from "react";
import {UiConfigRendererContext} from "./UiConfigBase.tsx";
import {UiObjectConfig} from "uiconfig.js"
import {getOrCall} from "ts-browser-helpers";

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

    // todo move order to uiconfigmethods...
    const order = props.config.order ? getOrCall(props.config.order, props.config) ?? undefined : undefined
    const orderStyle = {order: order && typeof order === 'string' ? parseInt(order): order}

    if (!props.config.type) return (<div key={props.config.uuid} style={orderStyle}></div>)
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
        return (<div key={props.config.uuid} style={orderStyle}><UiConfigComp {...{...props}} /></div>)
    }
    return (<><div key={props.config.uuid} style={orderStyle}>Unknown type: {props.config.type}</div><br/></>)
}
