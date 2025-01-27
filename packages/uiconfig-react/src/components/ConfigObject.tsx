import React from "react";
import {UiConfigRendererContext} from "./BPComponent.tsx";
import {UiObjectConfig} from 'uiconfig.js'

export type UiConfigTypes = 'input' | 'button' | 'folder' | 'checkbox' | 'toggle' |
    'dropdown' | 'slider' | 'color' | 'image' | 'number' /*| 'panel'*/ | 'tree' | 'hierarchy' |
    'vec' | 'vec2' | 'vec3' | 'vec4' | 'monitor'

export interface ConfigProps {
    config: UiObjectConfig;
    level?: number,
}

// export const ConfigObjectGenerators: PartialRecord<UiConfigTypes, Class<React.Component<BPComponentProps<any>, BPComponentState>>|((props: BPComponentProps<any>) => React.JSX.Element)> = {
// }

// export class ConfigObject extends React.Component<ConfigProps, {}> {
//     static contextType = UiConfigRendererContext
//     declare context: React.ContextType<typeof UiConfigRendererContext>
//     state = {}
//
//     render() {
//         this.context.methods.initUiConfig(this.props.config)
//         if (!this.props.config.type) return (<div key={this.props.config.uuid}></div>)
//         let type = this.props.config.type as any as UiConfigTypes
//         const val = this.context.methods.getValue(this.props.config)
//
//         // hacks
//         if (type === 'input' && typeof val === 'number') this.props.config.type = type = 'number'
//         if (type === 'input' && typeof val === 'boolean') this.props.config.type = type = 'toggle'
//         if (type === 'monitor') {
//             this.props.config.type = type = 'input'
//             this.props.config.readOnly = true
//         }
//         if (val && type === 'input' && typeof (val as any).x === 'number') this.props.config.type = type = 'vec'
//
//         if(!this.context.ConfigObjectGenerators) return null
//         let BPComp = this.context.ConfigObjectGenerators[type]
//         if (BPComp) {
//             return (<div key={this.props.config.uuid}><BPComp {...{...this.props}} /></div>)
//         }
//         return (<><div key={this.props.config.uuid}>Unknown type: {this.props.config.type}</div><br/></>)
//     }
// }

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
    let BPComp = context.ConfigObjectGenerators[type]
    if (BPComp) {
        return (<div key={props.config.uuid}><BPComp {...{...props}} /></div>)
    }
    return (<><div key={props.config.uuid}>Unknown type: {props.config.type}</div><br/></>)
}