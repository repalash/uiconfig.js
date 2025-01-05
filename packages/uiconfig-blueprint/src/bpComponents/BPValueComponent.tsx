import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {BPLabelledComponent, BPLabelledComponentState} from "./BPLabelledComponent";
import {equalsPrimitive, PrimitiveVal} from "uiconfig.js";

export type BPValueComponentState<TStateValue> = BPLabelledComponentState & {
    value: TStateValue
}

export abstract class BPValueComponent<TValue extends PrimitiveVal, TState extends BPValueComponentState<TStateValue>, TStateValue> extends BPLabelledComponent<TValue, TState> {

    protected constructor(props: BPComponentProps<TValue>, context: UiConfigRendererContextType, state: TState) {
        super(props, context, state);
        this.setValue = this.setValue.bind(this)
    }

    abstract convertValueToState(value: TValue, state: TState): TState;

    abstract convertStateToValue(state: TState): Promise<TValue>;

    // this should be state.value ideally which is initialValue in parent component
    // a separate variable is made here so that it can be undefined in the beginning.
    private _lastValRef: TValue | undefined

    getUpdatedState(state: TState): TState {
        const val = this.context.methods.getValue<TValue>(this.props.config, this._lastValRef, false) // this has to be false otherwise the children component will rerender everytime. like sliders
        if(this._lastValRef !== undefined && val !== undefined){
            // changed from outside, so we need to update the children
            this.keyVersion++
        }
        this._lastValRef = val
        // console.log('getUpdatedState', val);
        state = super.getUpdatedState(state)
        state = val !== undefined ? this.convertValueToState(val, state) : state
        return state
    }

    protected _previousLast = false

    // is this really required?
    doesNeedRefresh(state: TState, _last?: boolean): boolean {
        const needsRefresh = this._previousLast !== _last || !equals(this.state.value, state.value);
        this._previousLast = _last ?? true;
        // console.log('doesNeedRefresh', needsRefresh, this.state.value, state.value);
        return needsRefresh;
    }

    setState(state: TState, callback?: () => void) {
        // this.keyVersion++ // dont in getUpdatedState
        super.setState(state, callback);
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
        this._lastValRef = val
        await this.context.methods.setValue(this.props.config, val, {last}, this.forceOnChange)
        await this.refreshConfigState(state)
    }

}

function equals(a: any, b: any){
    return equalsPrimitive(a, b)
}
