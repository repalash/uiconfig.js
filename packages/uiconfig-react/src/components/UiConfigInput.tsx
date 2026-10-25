import {UiConfigValueBase, UiConfigValueBaseState} from "./UiConfigValueBase.tsx";
import {UiConfigBaseProps2, UiConfigRendererContextType} from "./UiConfigBase.tsx";
import {PrimitiveVal} from "uiconfig.js";

// todo rename to GenericValueComponent
export class UiConfigInput<
    TStateValue extends PrimitiveVal, TState extends UiConfigValueBaseState<TStateValue> = UiConfigValueBaseState<TStateValue>>
    extends UiConfigValueBase<TStateValue, TState, TStateValue> {

    constructor(props: UiConfigBaseProps2<TStateValue, TState, UiConfigInput<TStateValue, TState>>, context: UiConfigRendererContextType) {
        super(props, context);
    }

    convertValueToState(value: TStateValue, state: TState): TState {
        return {...state, value}
    }

    async convertStateToValue(state: TState): Promise<TStateValue> {
        return state.value;
    }
}
