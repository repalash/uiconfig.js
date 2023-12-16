import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {BPLabelledComponent, BPLabelledComponentState} from "./BPLabelledComponent";

export type BPValueComponentState<TStateValue> = BPLabelledComponentState & {
    value: TStateValue
}

export abstract class BPValueComponent<TValue, TState extends BPValueComponentState<TStateValue>, TStateValue> extends BPLabelledComponent<TValue, TState> {

    protected constructor(props: BPComponentProps<TValue>, context: UiConfigRendererContextType, state: TState) {
        super(props, context, state);
    }

    abstract convertValueToState(value: TValue, state: TState): TState;

    abstract convertStateToValue(state: TState): Promise<TValue>;

    getUpdatedState(state: TState): TState {
        const val = this.context.methods.getValue(this.props.config)
        state = super.getUpdatedState(state)
        return val ? this.convertValueToState(val, state) : state
    }

    protected _previousLast = false

    doesNeedRefresh(state: TState, _last?: boolean): boolean {
        return this._previousLast !== _last || this.state.value !== state.value
    }

    async setValue(value: TStateValue, last?: boolean) {
        return this.updateStateValue({...this.state, value}, last)
    }

    forceOnChange: boolean = false

    async updateStateValue(state: TState, last?: boolean) {
        if (!this.doesNeedRefresh(state, last)) {
            await this.setStatePromise(state)
            return
        }
        let val = await this.convertStateToValue(state)
        await this.context.methods.setValue(this.props.config, val, {last}, this.forceOnChange)
        await this.refreshConfigState(state)
    }

}
