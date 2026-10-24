import React from "react";
import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {BPInputComponent} from "./BPInputComponent";
import {ExtendedNumericInput} from "../components/ExtendedNumericInput";
import {BPValueComponentState} from "./BPValueComponent";
import {getNumberTransformFunctions} from "./GetNumberTransformFunctions";

export class BPNumberInputComponent extends BPInputComponent<number, BPValueComponentState<number>&{unit?: string}> {
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

        const unit = this.props.config.unit as string|undefined; // todo add to uiconfig, getOrCall
        const unitType = this.props.config.unitType as string|undefined; // todo add to uiconfig, getOrCall
        const targetUnit = this.state.unit || unit
        const {transformValue, invTransformValue} = getNumberTransformFunctions(unit, unitType, targetUnit);

        return (
            <ExtendedNumericInput
                className="numericInput"
                disabled={this.state.disabled}
                readOnly={this.state.readOnly}
                defaultValue={this.state.value}
                fill={true}
                ref={this._inputs[0]}
                key={this.props.config.uuid}
                onChange2={this._onChange}
                transformValue={transformValue}
                invTransformValue={invTransformValue}
            />
        )
    }
}

