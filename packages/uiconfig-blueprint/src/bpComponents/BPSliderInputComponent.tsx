import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {NumericInput, Slider} from "@blueprintjs/core";
import {BPInputComponent} from "./BPInputComponent";
import {BPValueComponentState} from "./BPValueComponent";
import {getOrCall} from "ts-browser-helpers";

export type BPSliderComponentState = BPValueComponentState<number> & {
    min: number,
    max: number,
    step: number
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
        return [(
            <Slider
                value={Math.min(this.state.max, Math.max(this.state.min, this.state.value))}
                key={this.props.config.uuid + '_slider'}
                disabled={this.state.disabled}
                min={this.state.min} max={this.state.max} stepSize={this.state.step}
                labelRenderer={false}
                // labelStepSize={(max - min)}
                // labelValues={[]}
                onChange={(v) => {
                    if(this.state.readOnly) return
                    this.setValue(v)
                }}
            />
        ),(
            <NumericInput
                style={{maxWidth: "4rem", minWidth: "3rem"}}
                // defaultValue={state}
                disabled={this.state.disabled}
                value={Math.min(this.state.max, Math.max(this.state.min, this.state.value))}
                key={this.props.config.uuid + '_input'}
                min={this.state.min} max={this.state.max} stepSize={this.state.step}
                minorStepSize={this.state.step/10}
                majorStepSize={this.state.step*10}
                buttonPosition="none"
                onValueChange={(v) => {
                    if(this.state.readOnly) return
                    this.setValue(v)
                }}
            />)
    ]
    }
}
