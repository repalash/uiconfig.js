import React from "react";
import {BPComponentProps} from "./BPComponent";
import {ConfigObject} from "../ConfigObject";
import {BPLabelledComponent, BPLabelledComponentState} from "./BPLabelledComponent";
import {PanelActions} from "@blueprintjs/core/lib/esm/components/panel-stack2/panelTypes";
import {UiObjectConfig} from 'uiconfig.js'
import {getOrCall, safeSetProperty} from 'ts-browser-helpers'

export type BPPanelComponentState = BPLabelledComponentState & {
    children: UiObjectConfig[]
    expanded: boolean
}

export class BPPanelComponent extends BPLabelledComponent<void, BPPanelComponentState, BPComponentProps<void>&PanelActions> {
    constructor(props: BPComponentProps<void>&PanelActions, context: any) {
        super(props, context, {
            children: [],
            expanded: false,
            label: 'Panel'
        });
    }

    getUpdatedState(state: BPPanelComponentState) {
        // console.log('update folder')
        return {
            ...super.getUpdatedState(state),
            // children: (this.props.config.children || []).map(c => getOrCall(c) || {}).flat(2),
            children: this.context.methods.getChildren(this.props.config),
            expanded: getOrCall(this.props.config.expanded) ?? false,
        }
    }

    setExpanded = (e: boolean) => {
        if (e === this.state.expanded) return
        this.setState({...this.state, expanded: e})
        safeSetProperty(this.props.config, "expanded", e, true)
        // if (e) this.state.children.forEach(c => Array.isArray(c) ? null : c.uiRefresh?.("postFrame", true, 1)) // todo: handle array and functions
    }

    componentDidMount() {
        super.componentDidMount();
        this.setExpanded(true)
    }


    componentWillUnmount() {
        this.setExpanded(false)
        super.componentWillUnmount();
    }

    render() {
        return (
            <div
                key={this.props.config.uuid}
                className="folder-children" style={{listStyleType: "none", paddingLeft: "0"}}>
                {this.state.children.map((c, i) => <ConfigObject key={'c' + i} {...this.props} config={c}/>)}
            </div>
        )
    }
}
