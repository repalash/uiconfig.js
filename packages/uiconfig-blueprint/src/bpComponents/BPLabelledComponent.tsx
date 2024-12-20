import {BPComponent, BPComponentProps2, BPComponentState, UiConfigRendererContextType} from "./BPComponent";

export type BPLabelledComponentState = BPComponentState & {
    label: string
}
export class BPLabelledComponent
<TValue, TState> extends BPComponent<TValue, TState&BPLabelledComponentState> {

    constructor(props: BPComponentProps2<TValue, TState&BPLabelledComponentState>, context: UiConfigRendererContextType) {
        super(props, context);
    }

    getUpdatedState(state: TState & BPLabelledComponentState): TState & BPLabelledComponentState {
        return super.getUpdatedState({
            ...state,
            label: this.context.methods.getLabel(this.props.config) || state.label,
        })
    }

}
