import React, {ChangeEventHandler} from "react";
import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {InputGroup, TextArea} from "@blueprintjs/core";
import {BPInputComponent} from "./BPInputComponent";
import {BPValueComponentState} from "./BPValueComponent";

export class BPTextInputComponent extends BPInputComponent<string> {
    constructor(props: BPComponentProps<string>, context: UiConfigRendererContextType) {
        super(props, context, {value: '', label: 'Input'});
    }

    private _inputRef = React.createRef<HTMLInputElement|HTMLTextAreaElement>()

    private _iv = 0
    async refreshConfigState(state?: BPValueComponentState<string>): Promise<void> {
        const iv = this._iv
        await super.refreshConfigState(state);
        if(iv === this._iv) {
            if (this._inputRef.current && this._inputRef.current.value !== this.state.value)
                this._inputRef.current.value = this.state.value
        }
    }

    private _edited = false
    private _onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        this._iv+=1
        this._edited = true
        this.setValue(e.target.value, false); // todo: set loading while this promise is happening.
    }

    // after an edit, blur sets the value once more with `last: true`: the change event marks the end of the edit and
    // the undo manager closes the step that merged the keystrokes
    private _onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!this._edited) return
        this._edited = false
        this._iv+=1
        this.setValue(e.target.value, true);
    }

    renderInput() {
        const config = this.props.config as any;
        const isMultiline = config.multiline === true;

        if (isMultiline) {
            return (
                <TextArea
                    defaultValue={this.state.value}
                    inputRef={this._inputRef as any}
                    disabled={this.state.disabled}
                    readOnly={this.state.readOnly}
                    key={this.props.config.uuid}
                    fill={true}
                    rows={config.rows}
                    cols={config.cols}
                    autoResize={config.autoResize}
                    onChange={this._onChange as any}
                    onBlur={this._onBlur}/>
            )
        }

        return (
            <InputGroup
                defaultValue={this.state.value}
                inputRef={this._inputRef as any}
                disabled={this.state.disabled}
                readOnly={this.state.readOnly}
                key={this.props.config.uuid}
                fill={true}
                onChange={this._onChange}
                onBlur={this._onBlur}/>
        )
    }
}
