import {UiConfigBaseProps2, UiConfigRendererContextType} from "./UiConfigBase.tsx";
import {UiConfigLabelled, UiConfigLabelledState} from "./UiConfigLabelled.tsx";
import {equalsPrimitive, PrimitiveVal} from "uiconfig.js";
import React from "react";

export type UiConfigValueBaseState<TStateValue> = UiConfigLabelledState & {
    value: TStateValue
}

export abstract class UiConfigValueBase<TValue extends PrimitiveVal, TState extends UiConfigValueBaseState<TStateValue>, TStateValue> extends UiConfigLabelled<TValue, TState> {
    protected constructor(props: UiConfigBaseProps2<TValue, TState, any>, context: UiConfigRendererContextType) {
        super(props, context);
        this.setValue = this.setValue.bind(this)
    }

    abstract convertValueToState(value: TValue, state: TState): TState;

    abstract convertStateToValue(state: TState): Promise<TValue>;

    // this should be state.value ideally which is initialValue in parent component
    // a separate variable is made here so that it can be undefined in the beginning.
    private _lastValRef: TValue | undefined

    getUpdatedState(state: TState): TState {
        const val = this.context.methods.getValue(this.props.config, this._lastValRef, false) // this has to be false otherwise the children component will rerender everytime. like sliders
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

type TEmptyNumber = number | ''
export function useNumberInputState(initialValue: number, min: number, max: number, step: number, setValue: (v: number, last: boolean) => void): [TEmptyNumber, (v: string|number, last: boolean) => void] {
    const [val, setVal] = React.useState<TEmptyNumber>(initialValue); // todo should we clamp initial? or show the correct val

    React.useEffect(() => {
        setVal(initialValue);
    }, [initialValue]);

    const setValueCallback = React.useCallback((v: string|number, last: boolean) => {
        let num = typeof v === 'string' ? parseFloat(v || '0') : v;
        if(!isFinite(num)) num = 0
        const clamped = Math.min(max, Math.max(min, num));
        if (!last && Math.abs(clamped - num) > (step || 0.01) / 1000) {
            // invalid value
            setVal(v === '' ? '' : num);
        } else {
            setVal(v === '' && !clamped ? '' : clamped);
            setValue(clamped, last);
        }
    }, [min, max, step]);

    return [val, setValueCallback];
}

export type TVectorInputVal1 = {x: number, y?: number, z?: number, w?: number, clone(): TVectorInputVal1, toArray(): number[], fromArray(a: number[]): TVectorInputVal1, equals(other: TVectorInputVal1): boolean; copy(other: TVectorInputVal1): void;}
export type TVectorInputVal = number[]|TVectorInputVal1

export function useVectorInputState(initialValue: TVectorInputVal, min: number, max: number, step: number, setValue: (v: TVectorInputVal, last: boolean) => void): [TEmptyNumber[], (v: string, key: number, last: boolean) => void, (v: number[], last: boolean) => void] {
    const [val, setVal] = React.useState<TEmptyNumber[]>(Array.isArray(initialValue) ? [...initialValue] : initialValue.toArray()); // todo should we clamp initial? or show the correct val

    React.useEffect(() => {
        setVal(Array.isArray(initialValue) ? [...initialValue] : initialValue.toArray());
    }, [initialValue]);

    const setOne = React.useCallback((v: string, key: number, last: boolean) => {
        const num = parseFloat(v || '0');
        const clamped = Math.min(max, Math.max(min, num));
        const copy = [...val];
        if (!last && Math.abs(clamped - num) > (step || 0.01) / 1000) {
            // invalid value
            copy[key] = v === '' ? '' : num;
            setVal(copy);
        } else {
            copy[key] = v === '' && !clamped ? '' : clamped;
            setVal(copy);
            const copy2 = Array.isArray(initialValue) ? [...initialValue] : initialValue.clone();
            if(Array.isArray(copy2)){
                copy2[key] = clamped;
            }else {
                const idx = (['x', 'y', 'z', 'w'] as const)[key];
                if(idx) copy2[idx] = clamped;
            }
            // console.log('setOne', copy2, last);
            setValue(copy2, last);
        }
    }, [min, max, step, initialValue]);

    const setAll = React.useCallback((v: number[], last: boolean) => {
        setVal([...v]);
        if(Array.isArray(initialValue)){
            initialValue.splice(0, 4, ...v);
        }else {
            initialValue.fromArray(v);
        }
        setValue(initialValue, last);
    }, [initialValue]);

    return [val, setOne, setAll];
}

type TColorHexString = string
type TColorObj = {r: number, g: number, b: number, a?: number, clone(): TColorObj, toArray(): number[], fromArray(a: number[]): TColorObj, equals(other: TColorObj): boolean; copy(other: TColorObj): void; getHexString(): string; set(v: TColorObj|string|number): void;/* convertLinearToSRGB(): void; convertSRGBToLinear(): void; isColor: boolean*/}
export type TColorInputVal = string | number | TColorObj

function colorToHex(color: TColorInputVal){
    if(typeof color === 'string') return color;
    if(typeof color === 'number') return '#' + Math.floor(color).toString(16).padStart(6, '0');
    if(typeof color.getHexString === 'function') return '#' + color.getHexString();
    const c = typeof color.toArray === 'function' ? color.toArray() : [color.r, color.g, color.b, color.a]
    return '#' + c.map(c => c === undefined ? '' : Math.floor(c * 255).toString(16).padStart(2, '0')).join('');
}
function hexToColor(color: TColorInputVal, hex: TColorHexString): TColorInputVal{
    if(typeof color === 'string') return hex;
    if(typeof color === 'number') return parseInt(hex.slice(1), 16);
    if(typeof color.fromArray === 'function') {
        const c = typeof color.clone === 'function' ? color.clone() : color;
        if(typeof c.set === 'function') {
            c.set(hex)
            return c
        }
        return c.fromArray([parseInt(hex.slice(1, 3), 16) / 255, parseInt(hex.slice(3, 5), 16) / 255, parseInt(hex.slice(5, 7), 16) / 255, parseInt(hex.slice(7, 9), 16) / 255]);
    }
    return hex;
}
export function useColorInputState(initialValue: TColorInputVal, setValue: (v: TColorInputVal, last: boolean) => void): [TColorHexString, (v: TColorHexString, last: boolean) => void] {
    const [val, setVal] = React.useState<TColorHexString>(colorToHex(initialValue)); // todo should we clamp initial? or show the correct val

    React.useEffect(() => {
        setVal(colorToHex(initialValue));
    }, [initialValue]);

    const setValueCallback = React.useCallback((v: TColorHexString, last: boolean) => {
        const isValid = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(v);
        if(!isValid){
            // invalid value
            setVal(v);
        }else{
            setVal(v);
            setValue(hexToColor(initialValue, v), last);
        }
    }, [initialValue]);

    return [val, setValueCallback];
}

