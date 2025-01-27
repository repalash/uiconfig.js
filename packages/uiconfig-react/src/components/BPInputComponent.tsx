import {BPValueComponent, BPValueComponentState} from "./BPValueComponent.tsx";
import {BPComponentProps2, UiConfigRendererContextType} from "./BPComponent.tsx";
import {PrimitiveVal} from "uiconfig.js";

// todo rename to GenericValueComponent
export class BPInputComponent<
    TStateValue extends PrimitiveVal, TState extends BPValueComponentState<TStateValue> = BPValueComponentState<TStateValue>>
    extends BPValueComponent<TStateValue, TState, TStateValue> {

    constructor(props: BPComponentProps2<TStateValue, TState, BPInputComponent<TStateValue, TState>>, context: UiConfigRendererContextType) {
        super(props, context);
    }

    convertValueToState(value: TStateValue, state: TState): TState {
        return {...state, value}
    }

    async convertStateToValue(state: TState): Promise<TStateValue> {
        return state.value;
    }
}
