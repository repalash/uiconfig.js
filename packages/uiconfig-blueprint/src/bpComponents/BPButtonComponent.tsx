import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import React from "react";
import {BPLabelledComponent, BPLabelledComponentState} from "./BPLabelledComponent";
import {Button} from "@blueprintjs/core";

export class BPButtonComponent extends BPLabelledComponent<()=>void, BPLabelledComponentState> {
    constructor(props: BPComponentProps<()=>void>, context: UiConfigRendererContextType) {
        super(props, context, {label: 'Button'});
    }

    onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        // console.log('her')
        this.context.methods.clickButton(this.props.config, {args: [event]})
    }

    render() {
        return !this.state.hidden ? (
            <div className="bpButtonComponent xPaddedContent">
                <Button className="bpButton"
                        disabled={this.state.disabled}
                        // small={true}
                        text={this.state.label} style={{}} onClick={this.onClick}/>
            </div>
        ) : null
    }

}
