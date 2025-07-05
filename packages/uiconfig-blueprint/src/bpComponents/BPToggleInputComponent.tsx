import {ChangeEventHandler} from "react";
import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {Switch} from "@blueprintjs/core";
import {BPInputComponent} from "./BPInputComponent";

export class BPToggleInputComponent extends BPInputComponent<boolean> {
    constructor(props: BPComponentProps<boolean>, context: UiConfigRendererContextType) {
        super(props, context, {value: false, label: 'Input'});
    }

    private _onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        this.setValue(e.target.checked); // todo: set loading while this promise is happening.
    }

    renderInput() {
        return (
            <Switch alignIndicator="right" defaultChecked={this.state.value}
                    disabled={this.state.disabled} readOnly={this.state.readOnly}
                    labelElement={(<span className={"bp5-label"} title={this.state.label}>{this.state.label}</span>)} onChange={this._onChange}
                    inline={false} large={false}
                    className="switch"/>
        )
    }

    render() {
        return !this.state.hidden ? (
            <div className="xPaddedContent folderContent"
                 style={{flexBasis: this.state.baseWidth ?? this.flexBasis}}
            >
                {this.renderInput()}
            </div>
        ) : null
    }
}
