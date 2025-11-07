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

    async refreshConfigState(state?: BPValueComponentState<string>): Promise<void> {
        await super.refreshConfigState(state);
        if (this._inputRef.current)
            this._inputRef.current.value = this.state.value
    }

    private _onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        this.setValue(e.target.value); // todo: set loading while this promise is happening.
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
                    onChange={this._onChange as any}/>
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
                onChange={this._onChange}/>
        )
    }
}
