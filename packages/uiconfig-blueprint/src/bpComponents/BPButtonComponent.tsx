import {BPComponentProps} from "./BPComponent";
import React from "react";
import {BPLabelledComponent, BPLabelledComponentState} from "./BPLabelledComponent";
import {Button} from "@blueprintjs/core";

export class BPButtonComponent extends BPLabelledComponent<()=>void, BPLabelledComponentState> {
    constructor(props: BPComponentProps<()=>void>, context: any) {
        super(props, context, {label: 'Button'});
    }

    onClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        console.log('her')
        this.context.methods.clickButton(this.props.config, {args: [event]})
    }

    render() {
        return (
            <div className="bpButtonComponent xPaddedContent">
                <Button className="bpButton"
                    // small={true}
                        text={this.state.label} style={{}} onClick={this.onClick}/>
            </div>
        )
    }

}
