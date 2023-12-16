import React, {createRef} from "react";
import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {Button, Icon, InputGroup, Popover} from "@blueprintjs/core";
import {BPValueComponent, BPValueComponentState} from "./BPValueComponent";
import {HexColorPicker} from "react-colorful";
import {FormGroupComponent} from "../components/FormGroupComponent";
import {getOrCall} from 'ts-browser-helpers'
import type {Color, ColorRepresentation} from "three"

export type BPColorComponentState = BPValueComponentState<string> & {
    mode: 'number' | 'string' | 'Color', lastValue?: ColorRepresentation,
    srgbConvert: boolean
}


export class BPColorInputComponent extends BPValueComponent<ColorRepresentation, BPColorComponentState, string> {
    private _inputRef = createRef<HTMLInputElement>()
    private _tempColor: Color

    constructor(props: BPComponentProps<ColorRepresentation>, context: UiConfigRendererContextType) {
        super(props, context, {
            label: 'Color',
            value: "#000000",
            mode: 'number',
            srgbConvert: false,
        });
        if(!context.THREE?.Color) throw new Error('BPColorInputComponent requires THREE.Color to be available in context')
        if(!this._tempColor) this._tempColor = new context.THREE.Color()
    }

    convertValueToState(val: ColorRepresentation, state: BPColorComponentState): BPColorComponentState {
        if(!this._tempColor) this._tempColor = new this.context.THREE!.Color()
        let mode: BPColorComponentState['mode'] = state.mode
        const srgbConvert = getOrCall(this.props.config.srgb) === true
        if (typeof val === 'string') mode = 'string'
        else if (typeof val === 'number') mode = 'number';
        else if (val.isColor)
            mode = 'Color'
        else console.error('not supported color', val)
        this._tempColor.set(val)
        if (srgbConvert) this._tempColor.convertLinearToSRGB()
        const value = '#' + this._tempColor.getHexString()
        // console.log('color', mode, value, val)
        return {...state, mode, value, lastValue: val, srgbConvert} // default config.srgb = false
    }

    async convertStateToValue(state: BPColorComponentState): Promise<ColorRepresentation> {
        if(!this._tempColor) this._tempColor = new this.context.THREE!.Color()
        let val: ColorRepresentation = state.lastValue || 0
        this._tempColor.set(state.value)
        if (state.srgbConvert) this._tempColor.convertSRGBToLinear()
        if (state.mode === 'number') {
            val = this._tempColor.getHex()
        } else if (state.mode === 'string') {
            val = '#' + this._tempColor.getHexString();
        } else if (state.mode === 'Color') {
            val = ((state.lastValue as Color) ?? new this.context.THREE!.Color()).copy(this._tempColor)
        }
        return val;
    }

    forceOnChange: boolean = true

    doesNeedRefresh(state: BPColorComponentState, _?: boolean): boolean {
        const eq = !super.doesNeedRefresh(state);
        return ((state.value as any as Color)?.isColor && eq) ? true : !eq
    }

    private _mouseButtons = 0

    componentDidMount() {
        super.componentDidMount();
        document.addEventListener('mousemove', this._mouseMove)
    }

    private _mouseMove = (ev: MouseEvent) => {
        this._mouseButtons = ev.buttons
        if (!this._mouseButtons && this._hasMouseUp) this._mouseUp()
    }

    componentWillUnmount() {
        document.removeEventListener('mousemove', this._mouseMove)
        this._mouseButtons = 0
        super.componentWillUnmount();
    }

    private _hasMouseUp = false
    private _mouseUp = () => {
        document.removeEventListener('mouseup', this._mouseMove)
        if (!this._hasMouseUp) return
        this._hasMouseUp = false
        this.setValue(this._inputRef.current!.value, true)

        if (this._hasMouseUp) return
        document.addEventListener('mouseup', this._mouseUp)
    }

    render() {
        return !this.state.hidden ? (
            <FormGroupComponent label={this.state.label}>
                <InputGroup inputRef={this._inputRef}
                            disabled={this.state.disabled} readOnly={this.state.readOnly}
                            leftElement={(
                    <Popover
                        popoverClassName={'color-picker-popover'}
                        usePortal={false}
                        minimal={false}
                        content={
                        <HexColorPicker color={this.state.value}
                                        onChange={(c) => {
                                            if(this.state.readOnly || this.state.disabled) return
                            this._tempColor.set(c)
                            const v = '#' + this._tempColor.getHexString().toUpperCase()
                            this.setValue(v, false)
                            this._inputRef.current!.value = v

                            if (this._hasMouseUp) return
                            this._hasMouseUp = true
                            document.addEventListener('mouseup', this._mouseUp)
                        }
                        }/>
                    }
                >
                    <Button
                        disabled={this.state.disabled || this.state.readOnly}
                        icon={<Icon icon="full-circle" color={this.state.value}/>}
                        text="" minimal
                    />
                </Popover>
            )} key={this.props.config.uuid} defaultValue={this.state.value} onChange={(e) => {
                const isHex = /^([A-Fa-f\d]+)$/.exec(e.target.value) // if someone pastes a color hex without #
                this._tempColor.set((isHex ? '#' : '') + e.target.value)
                this.setValue('#' + this._tempColor.getHexString().toUpperCase())
            }}/>
            </FormGroupComponent>
        ) : null
    }
}
