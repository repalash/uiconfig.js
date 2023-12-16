import React from "react";
import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {BPInputComponent} from "./BPInputComponent";
import {BPValueComponentState} from "./BPValueComponent";
import type {Vector2, Vector3, Vector4} from "three";
import {ExtendedNumericInput} from "../components/ExtendedNumericInput";
import {wIcon3, xIcon3, yIcon3, zIcon3} from "../components/variableIcons";
import {getOrCall} from 'ts-browser-helpers'

export type BPVectorComponentState = BPValueComponentState<Vector2|Vector3|Vector4> & {
    min: number,
    max: number,
    step: number,
    components: 1|2|3|4,
}

export class BPVectorInputComponent extends BPInputComponent<Vector2|Vector3|Vector4, BPVectorComponentState> {
    constructor(props: BPComponentProps<Vector2|Vector3|Vector4>, context: UiConfigRendererContextType) {
        super(props, context, {
            value: new context.THREE!.Vector2(),
            label: 'Vector',
            min: -Infinity,
            max: Infinity,
            step: 0.01,
            components: 2,
        });
    }

    forceOnChange: boolean = true

    doesNeedRefresh(_: BPVectorComponentState): boolean {
        return true;
    }

    getUpdatedState(state: BPVectorComponentState): BPVectorComponentState {
        const bounds = getOrCall(this.props.config.bounds)
        const max = (bounds?.length ?? 0) >= 2 ? bounds![1] : Infinity
        const min = (bounds?.length ?? 0) >= 1 ? bounds![0] : -Infinity
        const step = getOrCall(this.props.config.stepSize) || (isFinite(max) && isFinite(min) ? (Math.pow(10, Math.floor(Math.log10((max - min) / 100)))) : 0.01)
        state = super.getUpdatedState({
            ...state,
            min, max, step
        });
        // console.warn(state.value)
        let com = this.props.config.type!.replace('vector', '').replace('vec', '')
        let components: any = 0;
        // console.log(com, components)
        if(!com.length){
            let v = state.value as any;
            // console.log(v)
            if(typeof v.w === "number") components = 4
            else if (typeof v.z === "number") components = 3
            else if (typeof v.y === "number") components = 2
            else if (typeof v.x === "number") components = 1
        } else {
            components = Math.min(4, Math.max(1, parseInt(com)))
        }
        state.components = components
        return state
    }

    private _inputs = [React.createRef<ExtendedNumericInput>(), React.createRef<ExtendedNumericInput>(), React.createRef<ExtendedNumericInput>(), React.createRef<ExtendedNumericInput>()]

    async refreshConfigState(state?: BPVectorComponentState): Promise<void> {
        await super.refreshConfigState(state);
        await this._inputs[0].current?.setValue(this.state.value.x)
        await this._inputs[1].current?.setValue(this.state.value.y)
        await this._inputs[2].current?.setValue((this.state.value as any).z)
        await this._inputs[3].current?.setValue((this.state.value as any).w)
    }

    renderInput() {
        let ret = []
        if (!this.state.value) return <></>;

        // console.warn(this.state.value)
        if (this.state.components > 0) {
            const x = (
                <ExtendedNumericInput
                    style={{maxWidth: "8rem", minWidth: "2rem"}}
                    disabled={this.state.disabled} readOnly={this.state.readOnly}
                    // defaultValue={state}
                    leftIcon={xIcon3}
                    value={this.state.value.x}
                    key={this.props.config.uuid + '_x'}
                    ref={this._inputs[0]}
                    min={this.state.min} max={this.state.max} stepSize={this.state.step}
                    minorStepSize={this.state.step / 10}
                    majorStepSize={this.state.step * 10}
                    buttonPosition="none"
                    onChange2={(v, last) => {
                        this.state.value.x = v
                        this.setValue(this.state.value, last) // todo: does need refresh?
                    }}
                />)
            ret.push(x)
        }
        if(this.state.components>1) {
            const y = (
                <ExtendedNumericInput
                    style={{maxWidth: "8rem", minWidth: "2rem"}}
                    // defaultValue={state}
                    disabled={this.state.disabled} readOnly={this.state.readOnly}
                    value={this.state.value.y}
                    leftIcon={yIcon3}
                    key={this.props.config.uuid + '_y'}
                    ref={this._inputs[1]}
                    min={this.state.min} max={this.state.max} stepSize={this.state.step}
                    minorStepSize={this.state.step / 10}
                    majorStepSize={this.state.step * 10}
                    buttonPosition="none"
                    onChange2={(v, last) => {
                        this.state.value.y = v
                        this.setValue(this.state.value, last) // todo: does need refresh?
                    }}
                />)
            ret.push(y)
        }
        if(this.state.components>2) {
            const z = (
                <ExtendedNumericInput
                    style={{maxWidth: "8rem", minWidth: "2rem"}}
                    // defaultValue={state}
                    disabled={this.state.disabled} readOnly={this.state.readOnly}
                    value={(this.state.value as Vector3|Vector4).z}
                    key={this.props.config.uuid + '_z'}
                    leftIcon={zIcon3}
                    min={this.state.min} max={this.state.max} stepSize={this.state.step}
                    ref={this._inputs[2]}
                    minorStepSize={this.state.step / 10}
                    majorStepSize={this.state.step * 10}
                    buttonPosition="none"
                    onChange2={(v, last) => {
                        (this.state.value as Vector3 | Vector4).z = v
                        this.setValue(this.state.value, last) // todo: does need refresh?
                    }}
                />)
            ret.push(z)
        }
        if(this.state.components>3) {
            const z = (
                <ExtendedNumericInput
                    style={{maxWidth: "8rem", minWidth: "2rem"}}
                    // defaultValue={state}
                    disabled={this.state.disabled} readOnly={this.state.readOnly}
                    value={(this.state.value as Vector4).w}
                    key={this.props.config.uuid + '_w'}
                    leftIcon={wIcon3}
                    ref={this._inputs[3]}
                    min={this.state.min} max={this.state.max} stepSize={this.state.step}
                    minorStepSize={this.state.step / 10}
                    majorStepSize={this.state.step * 10}
                    buttonPosition="none"
                    onChange2={(v, last) => {
                        (this.state.value as Vector4).w = v
                        this.setValue(this.state.value, last) // todo: does need refresh?
                    }}
                />)
            ret.push(z)
        }
        return ret
    }
}
