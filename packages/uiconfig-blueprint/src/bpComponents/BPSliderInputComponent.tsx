import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {Slider} from "@blueprintjs/core";
import {BPInputComponent} from "./BPInputComponent";
import {BPValueComponentState} from "./BPValueComponent";
import {getOrCall} from "ts-browser-helpers";
import {ExtendedNumericInput} from "../components/ExtendedNumericInput";
import {getNumberTransformFunctions} from "./GetNumberTransformFunctions";

export type BPSliderComponentState = BPValueComponentState<number> & {
    min: number,
    max: number,
    step: number
    unit?: string,
}

export class BPSliderInputComponent extends BPInputComponent<number, BPSliderComponentState> {
    constructor(props: BPComponentProps<number>, context: UiConfigRendererContextType) {
        super(props, context, {
            value: 0,
            label: 'Slider',
            min: 0,
            max: 1,
            step: 0.01,
        });
    }

    getUpdatedState(state: BPSliderComponentState): BPSliderComponentState {
        const bounds = getOrCall(this.props.config.bounds)
        const max = (bounds?.length ?? 0) >= 2 ? bounds![1] : 1
        const min = (bounds?.length ?? 0) >= 1 ? bounds![0] : 0
        const step = getOrCall(this.props.config.stepSize) || (Math.pow(10, Math.floor(Math.log10((max - min) / 100))))
        return super.getUpdatedState({
            ...state,
            min, max, step
        });
    }

    flexBasis = "75%"

    renderInput() {

        const unit = this.props.config.unit as string|undefined; // todo add to uiconfig, getOrCall
        const unitType = this.props.config.unitType as string|undefined; // todo add to uiconfig, getOrCall
        const targetUnit = this.state.unit || unit
        const {transformValue, invTransformValue} = getNumberTransformFunctions(unit, unitType, targetUnit);

        const invTransformValue_ = invTransformValue || ((v: number) => v);
        const transformValue_ = transformValue || ((v: number) => v);
        return [(<ExtendedNumericInput
                style={{maxWidth: "4rem", minWidth: "3rem"}}
                // defaultValue={state}
                disabled={this.state.disabled} readOnly={this.state.readOnly}
                value={Math.min(this.state.max, Math.max(this.state.min, this.state.value))}
                key={this.props.config.uuid + '_input'}
                min={this.state.min} max={this.state.max}
                stepSize={this.state.step}
                minorStepSize={this.state.step/10}
                majorStepSize={this.state.step*10}
                buttonPosition="none"
                draggableIcon={false}
                transformValue={transformValue}
                invTransformValue={invTransformValue}
                onChange2={(v, last) => {
                    if(this.state.readOnly) return
                    this.setValue(v, last)
                }}
            />), (
            <Slider
                value={invTransformValue_(Math.min(this.state.max, Math.max(this.state.min, this.state.value)))}
                key={this.props.config.uuid + '_slider'}
                disabled={this.state.disabled}
                min={invTransformValue_(this.state.min)}
                max={invTransformValue_(this.state.max)}
                stepSize={invTransformValue_(this.state.step)}
                labelRenderer={false}
                // labelStepSize={(max - min)}
                // labelValues={[]}
                onChange={(v) => {
                    if(this.state.readOnly) return
                    this.setValue(transformValue_(v), false)
                }}
                onRelease={(v) => {
                    if(this.state.readOnly) return
                    this.setValue(transformValue_(v), true)
                }}
            />
        ),
    ]
    }
}
