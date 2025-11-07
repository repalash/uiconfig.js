import React from "react";
import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {BPInputComponent} from "./BPInputComponent";
import {BPValueComponentState} from "./BPValueComponent";
import type {Vector2, Vector3,Euler, Vector4} from "three";
import {ExtendedNumericInput} from "../components/ExtendedNumericInput";
import {wIcon3, xIcon3, yIcon3, zIcon3} from "../components/variableIcons";
import {getOrCall} from 'ts-browser-helpers'
import {getNumberTransformFunctions} from "./GetNumberTransformFunctions";
import {HTMLSelect} from "@blueprintjs/core";

export type BPVectorComponentState = BPValueComponentState<Vector2|Vector3|Euler|Vector4> & {
    min: number,
    max: number,
    step: number,
    components: 1|2|3|4,
    unit?: string,
    isEuler: boolean,
}

export class BPVectorInputComponent extends BPInputComponent<Vector2|Vector3|Euler|Vector4, BPVectorComponentState> {
    constructor(props: BPComponentProps<Vector2|Vector3|Euler|Vector4>, context: UiConfigRendererContextType) {
        super(props, context, {
            value: new context.THREE!.Vector2(),
            label: 'Vector',
            min: -Infinity,
            max: Infinity,
            step: 0.01,
            components: 2,
            isEuler: false,
        });
    }

    forceOnChange: boolean = true

    doesNeedRefresh(_: BPVectorComponentState): boolean {
        return true;
    }

    getUpdatedState(state: BPVectorComponentState): BPVectorComponentState {
        const bounds = getOrCall(this.props.config.bounds)
        const max = (bounds?.length ?? 0) >= 2 ? bounds![1] : Infinity
        const min = (bounds?.length ?? 0) >= 1 ? bounds![0] : -Infinity
        const step = getOrCall(this.props.config.stepSize) || (isFinite(max) && isFinite(min) ? (Math.pow(10, Math.floor(Math.log10((max - min) / 100)))) : 0.01)
        state = super.getUpdatedState({
            ...state,
            min, max, step
        });
        // console.warn(state.value)
        let com = this.props.config.type!.replace('vector', '').replace('vec', '')
        let components: any = 0;
        // Check if this is an Euler object
        const isEuler = typeof (state.value as any).order === 'string';
        state.isEuler = isEuler;

        // console.log(com, components)
        if(!com.length){
            let v = state.value as any;
            // console.log(v)
            if(typeof v.w === "number") components = 4
            else if (typeof v.z === "number") components = 3
            else if (typeof v.y === "number") components = 2
            else if (typeof v.x === "number") components = 1
        } else {
            components = Math.min(4, Math.max(1, parseInt(com)))
        }
        state.components = components
        return state
    }

    private _inputs = [React.createRef<ExtendedNumericInput>(), React.createRef<ExtendedNumericInput>(), React.createRef<ExtendedNumericInput>(), React.createRef<ExtendedNumericInput>()]
    private _parent = React.createRef<HTMLDivElement>()
    private _lastWidth?: number

    async refreshConfigState(state?: BPVectorComponentState): Promise<void> {
        await super.refreshConfigState(state);
        await this._inputs[0].current?.setValue(this.state.value.x)
        await this._inputs[1].current?.setValue(this.state.value.y)
        await this._inputs[2].current?.setValue((this.state.value as any).z)
        await this._inputs[3].current?.setValue((this.state.value as any).w)
    }
    // todo can we do it with css instead of ResizeObserver
    private _resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            const newWidth = entry.contentRect.width
            if (Math.abs(newWidth - (this._lastWidth||0)) > 5) {
                this._lastWidth = newWidth
                this.forceUpdate()
            }
        }
    })

    componentDidMount() {
        if (this._parent.current) {
            this._resizeObserver.observe(this._parent.current)
        }
        super.componentDidMount()
    }

    componentWillUnmount() {
        this._resizeObserver.disconnect()
        super.componentWillUnmount()
    }

    renderInput() {
        let ret = []
        if (!this.state.value) return <></>;

        const unit = this.props.config.unit as string|undefined; // todo add to uiconfig, getOrCall
        const unitType = this.props.config.unitType as string|undefined; // todo add to uiconfig, getOrCall
        const targetUnit = this.state.unit || unit
        const transformValue = getNumberTransformFunctions(unit, unitType, targetUnit);

        const props = {
            disabled: this.state.disabled,
            readOnly: this.state.readOnly,
            min: this.state.min,
            max: this.state.max,
            stepSize: this.state.step,
            minorStepSize: this.state.step / 10,
            majorStepSize: this.state.step * 10,
            buttonPosition: "none",
            ...transformValue,
        } as const

        const showIcon = this._parent.current?.offsetWidth ? this._parent.current.offsetWidth > (60 * this.state.components) : true

        // Euler rotation order options
        const eulerOrderOptions = [
            { label: 'XYZ', value: 'XYZ' },
            { label: 'YXZ', value: 'YXZ' },
            { label: 'ZXY', value: 'ZXY' },
            { label: 'ZYX', value: 'ZYX' },
            { label: 'YZX', value: 'YZX' },
            { label: 'XZY', value: 'XZY' }
        ];

        if (this.state.components > 0) {
            const x = (
                <ExtendedNumericInput
                    style={{maxWidth: "8rem", minWidth: "2rem"}}
                    // defaultValue={state}
                    leftIcon={xIcon3}
                    draggableIcon={showIcon}
                    value={this.state.value.x}
                    key={this.props.config.uuid + '_x'}
                    ref={this._inputs[0]}
                    {...props}
                    onChange2={(v, last) => {
                        this.state.value.x = v
                        this.setValue(this.state.value, last) // todo: does need refresh?
                    }}
                />)
            ret.push(x)
        }
        if(this.state.components>1) {
            const y = (
                <ExtendedNumericInput
                    style={{maxWidth: "8rem", minWidth: "2rem"}}
                    // defaultValue={state}
                    value={this.state.value.y}
                    leftIcon={yIcon3}
                    draggableIcon={showIcon}
                    key={this.props.config.uuid + '_y'}
                    ref={this._inputs[1]}
                    {...props}
                    onChange2={(v, last) => {
                        this.state.value.y = v
                        this.setValue(this.state.value, last) // todo: does need refresh?
                    }}
                />)
            ret.push(y)
        }
        if(this.state.components>2) {
            const z = (
                <ExtendedNumericInput
                    style={{maxWidth: "8rem", minWidth: "2rem"}}
                    // defaultValue={state}
                    value={(this.state.value as Vector3|Euler|Vector4).z}
                    key={this.props.config.uuid + '_z'}
                    leftIcon={zIcon3}
                    draggableIcon={showIcon}
                    ref={this._inputs[2]}
                    {...props}
                    onChange2={(v, last) => {
                        (this.state.value as Vector3|Euler | Vector4).z = v
                        this.setValue(this.state.value, last) // todo: does need refresh?
                    }}
                />)
            ret.push(z)

            // Add Euler rotation order dropdown after z component
            if(this.state.isEuler && this.props.config.showOrderSelector) { // todo add showOrderSelector to uiconfig types and other renderers
                const eulerOrderDropdown = (
                    <HTMLSelect
                        options={eulerOrderOptions}
                        minimal={true}
                        fill={false}
                        disabled={this.state.disabled || this.state.readOnly}
                        value={(this.state.value as Euler).order}
                        key={this.props.config.uuid + '_order'}
                        onChange={(event) => {
                            (this.state.value as Euler).order = event.currentTarget.value as any;
                            this.setValue(this.state.value, true);
                        }}
                        style={{maxWidth: "6rem", minWidth: "2rem"}}
                    />
                );
                ret.push(eulerOrderDropdown);
            }
        }
        if(this.state.components>3) {
            const w = (
                <ExtendedNumericInput
                    style={{maxWidth: "8rem", minWidth: "2rem"}}
                    // defaultValue={state}
                    value={(this.state.value as Vector4).w}
                    key={this.props.config.uuid + '_w'}
                    leftIcon={wIcon3}
                    draggableIcon={showIcon}
                    ref={this._inputs[3]}
                    {...props}
                    onChange2={(v, last) => {
                        (this.state.value as Vector4).w = v
                        this.setValue(this.state.value, last) // todo: does need refresh?
                    }}
                />)
            ret.push(w)
        }
        return <div ref={this._parent}
                    className={"formGroupContent"}
        >
            {ret}
        </div>
    }
}
