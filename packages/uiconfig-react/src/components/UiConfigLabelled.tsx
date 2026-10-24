import {UiConfigBase, UiConfigBaseProps2, UiConfigBaseState, UiConfigRendererContextType} from "./UiConfigBase.tsx";
import {PrimitiveVal} from "uiconfig.js";

export type UiConfigLabelledState = UiConfigBaseState & {
    label: string
}
export class UiConfigLabelled
<TValue extends PrimitiveVal|void, TState = UiConfigLabelledState> extends UiConfigBase<TValue, TState&UiConfigLabelledState> {

    constructor(props: UiConfigBaseProps2<TValue, TState&UiConfigLabelledState>, context: UiConfigRendererContextType) {
        super(props, context);
    }

    getUpdatedState(state: TState & UiConfigLabelledState): TState & UiConfigLabelledState {
        const label = this.context.methods.getLabel(this.props.config) || state.label
        if(label !== state.label) this.keyVersion++
        return super.getUpdatedState({
            ...state,
            label: label,
        })
    }

}
