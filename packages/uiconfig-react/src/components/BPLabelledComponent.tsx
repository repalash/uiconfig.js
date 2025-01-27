import {BPComponent, BPComponentProps2, BPComponentState, UiConfigRendererContextType} from "./BPComponent.tsx";
import {PrimitiveVal} from "uiconfig.js";

export type BPLabelledComponentState = BPComponentState & {
    label: string
}
export class BPLabelledComponent
<TValue extends PrimitiveVal|void, TState = BPLabelledComponentState> extends BPComponent<TValue, TState&BPLabelledComponentState> {

    constructor(props: BPComponentProps2<TValue, TState&BPLabelledComponentState>, context: UiConfigRendererContextType) {
        super(props, context);
    }

    getUpdatedState(state: TState & BPLabelledComponentState): TState & BPLabelledComponentState {
        const label = this.context.methods.getLabel(this.props.config) || state.label
        if(label !== state.label) this.keyVersion++
        return super.getUpdatedState({
            ...state,
            label: label,
        })
    }

}
