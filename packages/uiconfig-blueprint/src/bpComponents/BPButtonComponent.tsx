import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import React from "react";
import {BPLabelledComponent, BPLabelledComponentState} from "./BPLabelledComponent";
import {Button, Intent} from "@blueprintjs/core";

// @ts-ignore
export class BPButtonComponent extends BPLabelledComponent<()=>void, BPLabelledComponentState> {
    constructor(props: BPComponentProps<()=>void>, context: UiConfigRendererContextType) {
        super(props, context, {label: 'Button'});
    }

    onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // console.log('her')
        this.context.methods.clickButton(this.props.config, {args: [event]})
    }

    protected flexBasis = "50%"

    render() {
        return !this.state.hidden ? (
            <div className="bpButtonComponent xPaddedContent"
                 style={{flexBasis: this.state.baseWidth ?? this.flexBasis}}
            >
                <Button className="bpButton"
                        disabled={this.state.disabled || this.state.readOnly}
                        intent={Intent.PRIMARY}
                        // small={true}
                        fill={true}
                        text={this.state.label} style={{}} onClick={this.onClick}/>
            </div>
        ) : null
    }

}
