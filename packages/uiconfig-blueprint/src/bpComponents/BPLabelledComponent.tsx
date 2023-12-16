import {BPComponent, BPComponentProps, BPComponentState, UiConfigRendererContextType} from "./BPComponent";

export type BPLabelledComponentState = BPComponentState & {
    label: string
}
export abstract class BPLabelledComponent<TValue, TState, TProps extends BPComponentProps<TValue> = BPComponentProps<TValue>> extends BPComponent<TValue, TState&BPLabelledComponentState, TProps> {

    protected constructor(props: TProps, context: UiConfigRendererContextType, state: TState) {
        super(props, context, {label: 'Input', ...state});
    }

    getUpdatedState(state: TState & BPLabelledComponentState): TState & BPLabelledComponentState {
        return super.getUpdatedState({
            ...state,
            label: this.context.methods.getLabel(this.props.config) || state.label,
        })
    }

}
