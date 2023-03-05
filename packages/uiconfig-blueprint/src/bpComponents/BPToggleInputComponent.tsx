import React, {ChangeEventHandler} from "react";
import {BPComponentProps} from "./BPComponent";
import {Switch} from "@blueprintjs/core";
import {BPInputComponent} from "./BPInputComponent";

export class BPToggleInputComponent extends BPInputComponent<boolean> {
    constructor(props: BPComponentProps<boolean>, context: any) {
        super(props, context, {value: false, label: 'Input'});
    }

    private _onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        this.setValue(e.target.checked); // todo: set loading while this promise is happening.
    }

    renderInput() {
        return (
            <Switch alignIndicator="right" defaultChecked={this.state.value}
                    label={this.state.label} onChange={this._onChange}
                    className="switch" innerLabelChecked="on" innerLabel="off"/>
        )
    }

    render() {
        return (
            <div className="xPaddedContent folderContent" style={{flexBasis: "50%"}}>
                {this.renderInput()}
            </div>
        )
    }
}
