import React from "react";
import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {BPInputComponent} from "./BPInputComponent";
import {ExtendedNumericInput} from "../components/ExtendedNumericInput";
import {BPValueComponentState} from "./BPValueComponent";

export class BPNumberInputComponent extends BPInputComponent<number> {
    constructor(props: BPComponentProps<number>, context: UiConfigRendererContextType) {
        super(props, context, {value: 0, label: 'Number'});
    }

    private _inputs = [React.createRef<ExtendedNumericInput>()]

    async refreshConfigState(state?: BPValueComponentState<number>): Promise<void> {
        await super.refreshConfigState(state);
        await this._inputs[0].current?.setValue(this.state.value)
    }

    private _onChange = (v: number, last?: boolean) => {
        this.setValue(v, last); // todo: set loading while this promise is happening.
    }

    renderInput() {
        return (
            <ExtendedNumericInput
                className="numericInput"
                disabled={this.state.disabled}
                readOnly={this.state.readOnly}
                defaultValue={this.state.value}
                ref={this._inputs[0]}
                key={this.props.config.uuid}
                onChange2={this._onChange} fill={false}/>
        )
    }
}
