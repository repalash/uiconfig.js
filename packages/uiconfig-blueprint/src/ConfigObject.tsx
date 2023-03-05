import React from "react";
import {Class, PartialRecord} from "ts-browser-helpers";
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
import {UiObjectConfig} from 'uiconfig'
// import {BPVectorInputComponent} from "./bpComponents/BPVectorInputComponent";
// import {BPFileComponent} from "./bpComponents/BPFileComponent";
// import {BPColorInputComponent} from "./bpComponents/BPColorInputComponent";
// import {BPHierarchyComponent} from "./bpComponents/BPHierarchyComponent";

export type UiConfigTypes = 'input' | 'button' | 'folder' | 'checkbox' | 'toggle' |
    'dropdown' | 'slider' | 'color' | 'image' | 'number' | 'panel' | 'tree' | 'hierarchy' |
    'vec' | 'vec2' | 'vec3' | 'vec4'

export interface ConfigProps extends PanelActions {
    config: UiObjectConfig;
    isPanel?: boolean,
    level?: number,
}

const generators: PartialRecord<UiConfigTypes, Class<React.Component<BPComponentProps<any>, BPComponentState>>> = {
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
    // color: BPColorInputComponent,
    // image: BPFileComponent,
    // vec: BPVectorInputComponent,
    // vec2: BPVectorInputComponent,
    // vec3: BPVectorInputComponent,
    // vec4: BPVectorInputComponent,
    // hierarchy: BPHierarchyComponent,
}

export class ConfigObject extends React.Component<ConfigProps, {}> {
    static contextType = UiConfigRendererContext
    context!: React.ContextType<typeof UiConfigRendererContext>
    state = {}

    render() {
        this.context.methods.initUiConfig(this.props.config)
        if (!this.props.config.type) return (<div key={this.props.config.uuid}></div>)
        let type = this.props.config.type as any as UiConfigTypes
        const val = this.context.methods.getValue(this.props.config)

        // hacks
        if (type === 'input' && typeof val === 'number') this.props.config.type = type = 'number'
        if (val && type === 'input' && typeof val.x === 'number') this.props.config.type = type = 'vec'

        let BPComp = generators[type]
        if (type === 'panel' && !this.props.isPanel) {
            const label = this.context.methods.getLabel(this.props.config)
            return (
                <div key={this.props.config.uuid}>
                    <FolderHeadCard label={label} minimal={false} open={false} onClick={() => {
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
            return (<div key={this.props.config.uuid}><BPComp {...{...this.props, isPanel: undefined}} /></div>)
        }
        return (<div key={this.props.config.uuid}>Unknown type: {this.props.config.type}</div>)

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
        // const g = generators[this.props.uiConfig.type as any as UiConfigTypes]
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
