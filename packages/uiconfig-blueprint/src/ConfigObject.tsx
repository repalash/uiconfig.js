import React from "react";
import {Class, getOrCall, PartialRecord} from "ts-browser-helpers";
import {BPComponentProps, BPComponentState, UiConfigRendererContext} from "./bpComponents/BPComponent";
import {BPFolderComponent, FolderHeadCard} from "./bpComponents/BPFolderComponent";
import {BPTextInputComponent} from "./bpComponents/BPTextInputComponent";
import {BPNumberInputComponent} from "./bpComponents/BPNumberInputComponent";
import {BPButtonComponent} from "./bpComponents/BPButtonComponent";
import {BPToggleInputComponent} from "./bpComponents/BPToggleInputComponent";
import {BPSliderInputComponent} from "./bpComponents/BPSliderInputComponent";
import {BPDropdownInputComponent} from "./bpComponents/BPDropdownInputComponent";
import {PanelActions} from "@blueprintjs/core/lib/esm/components/panel-stack2/panelTypes";
import {BPPanelComponent} from "./bpComponents/BPPanelComponent";
import {BPTreeFolderComponent} from "./bpComponents/BPTreeFolderComponent";
import {UiObjectConfig} from 'uiconfig.js'
import {BPColorInputComponent} from './bpComponents/BPColorInputComponent'
import {BPVectorInputComponent} from './bpComponents/BPVectorInputComponent'
// import {BPVectorInputComponent} from "./bpComponents/BPVectorInputComponent";
// import {BPFileComponent} from "./bpComponents/BPFileComponent";
// import {BPColorInputComponent} from "./bpComponents/BPColorInputComponent";
// import {BPHierarchyComponent} from "./bpComponents/BPHierarchyComponent";

export type UiConfigTypes = 'input' | 'button' | 'folder' | 'checkbox' | 'toggle' |
    'dropdown' | 'slider' | 'color' | 'image' | 'number' | 'panel' | 'tree' | 'hierarchy' | 'materials' |
    'vec' | 'vec2' | 'vec3' | 'vec4' | 'monitor' | 'vector'

export interface ConfigProps extends PanelActions {
    config: UiObjectConfig;
    isPanel?: boolean,
    level?: number,
    className?: string
}

export const ConfigObjectGenerators: PartialRecord<UiConfigTypes, Class<React.Component<BPComponentProps<any>, BPComponentState>>> = {
    input: BPTextInputComponent,
    number: BPNumberInputComponent,
    button: BPButtonComponent,
    // folder: BPPanelComponent,
    folder: BPFolderComponent,
    panel: BPPanelComponent,
    // folder: bpPopFolderGenerator,
    checkbox: BPToggleInputComponent,
    toggle: BPToggleInputComponent,
    dropdown: BPDropdownInputComponent,
    slider: BPSliderInputComponent,
    tree: BPTreeFolderComponent,
    color: BPColorInputComponent,
    // image: BPFileComponent,
    vec: BPVectorInputComponent,
    vec2: BPVectorInputComponent,
    vec3: BPVectorInputComponent,
    vec4: BPVectorInputComponent,
    vector: BPVectorInputComponent,
    // hierarchy: BPHierarchyComponent,
}

export class ConfigObject extends React.Component<ConfigProps, {}> {
    static contextType = UiConfigRendererContext
    declare context: React.ContextType<typeof UiConfigRendererContext>
    state = {}

    render() {
        if (!this.props.config || !this.props.config.type) return (<div key={this.props.config.uuid} className={this.props.className}></div>)
        this.context.methods.initUiConfig(this.props.config)

        const order = this.props.config.order ? getOrCall(this.props.config.order, this.props.config) ?? undefined : undefined
        const orderStyle = {order: order && typeof order === 'string' ? parseInt(order): order}

        let type = this.props.config.type as any as UiConfigTypes
        const val = this.context.methods.getRawValue(this.props.config)

        // hacks
        if (type === 'input' && typeof val === 'number') this.props.config.type = type = 'number'
        if (type === 'input' && typeof val === 'boolean') this.props.config.type = type = 'toggle'
        if (type === 'monitor') {
            this.props.config.type = type = 'input'
            this.props.config.readOnly = true
        }
        if (val && type === 'input' && typeof (val as any).x === 'number') this.props.config.type = type = 'vec'

        let BPComp = ConfigObjectGenerators[type]
        if (type === 'panel' && !this.props.isPanel) {
            const label = this.context.methods.getLabel(this.props.config)
            const children = this.context.methods.getChildren(this.props.config)
            const enabledToggle = children[0] && this.context.methods.getLabel(children[0]).toLowerCase() === 'enabled' ? children[0] : undefined
            enabledToggle && (enabledToggle.hidden = true)
            return (
                <div key={this.props.config.uuid} style={orderStyle} className={this.props.className}>
                    <FolderHeadCard
                        enabled={enabledToggle ? this.context.methods.getRawValue(enabledToggle) : undefined}
                        onEnabledChange={(e) => enabledToggle && this.context.methods.setValue(enabledToggle, e.target.checked, {}).then(() => this.setState(this.state))}
                        level={0} label={label} minimal={false} open={false} onClick={() => {
                        this.props.openPanel<{ config: UiObjectConfig<any> }>({
                            props: {config: this.props.config},
                            title: label,
                            renderPanel: props => {
                                if (BPComp)
                                    return (<BPComp {...props}/>)
                                else return <></>
                            }
                        })
                    }}/>
                </div>
            )
        }
        if (BPComp) {
            return (<div key={this.props.config.uuid} style={orderStyle} className={this.props.className}><BPComp {...{...this.props, isPanel: undefined}} /></div>)
        }
        return (<div key={this.props.config.uuid} style={orderStyle} className={this.props.className}>
            {/*Unknown type: {this.props.config.type}*/}
        </div>)
        // return null

        // let uiRef: React.FC | BPUiRef<any> | null = this.props.uiConfig.uiRef
        // if (uiRef) {
        //     if (typeof uiRef === 'function') {
        //         const FC = uiRef
        //         return (<li key={this.props.uiConfig.uuid}><FC/></li>)
        //     }
        //     const FC = uiRef.FC
        //     return (<li key={this.props.uiConfig.uuid}><FC defaultState={this.state} onChange={(s)=>{this.setState({...this.state, ...s})}}/></li>)
        // }
        // if (!this.props.uiConfig.type) return (<li key={v4()}></li>)
        // if (!this.props.uiConfig.uuid) this.props.uiConfig.uuid = v4()
        // const g = ConfigObjectGenerators[this.props.uiConfig.type as any as UiConfigTypes]
        // // console.log(props.uiConfig)
        // if (!g) return <li key={this.props.uiConfig.uuid}></li>
        // this.props.uiConfig.uiRefresh = (mode, deep, delay) => {
        //     console.log('refresh', mode, deep, delay) // todo handle mode, deep, delay
        //     const _uiRef: React.FC | BPUiRef<any> | null = g(this.props.uiConfig)
        //     this.props.uiConfig.uiRef = _uiRef
        //     if (typeof _uiRef !== 'function') {
        //         this.setState(_uiRef.state)
        //     }
        // }
        // uiRef = g(this.props.uiConfig)
        // this.props.uiConfig.uiRef = uiRef
        // if (typeof uiRef !== 'function') {
        //     this.state = {...uiRef.state}
        // }
        // if (uiRef) {
        //     if (typeof uiRef === 'function')
        //         return (<li key={this.props.uiConfig.uuid}>{uiRef({})}</li>)
        //     return (<li key={this.props.uiConfig.uuid}>{uiRef.FC({
        //         defaultState: this.state, onChange: (s) => {
        //             this.setState(s)
        //         }
        //     })}</li>)
        // }
        // return (<li key={v4()}>Error rendering ConfigObject</li>)
    }
}
