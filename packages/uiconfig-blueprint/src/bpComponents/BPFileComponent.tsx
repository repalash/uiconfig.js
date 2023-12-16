import React from "react";
import {FileComponent} from "../components/FileComponent";
import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {BPValueComponent, BPValueComponentState} from "./BPValueComponent";
import {FormGroupComponent} from "../components/FormGroupComponent";

type StateValue = string | File | null
type FileImportType = any
export type BPFileComponentState = BPValueComponentState<StateValue> & {
    mode: 'url'|'file',
}

type BPFileComponentExtras = {fileLoader?: {load: (v: string|File|{path: string, file: File|Blob})=>Promise<FileImportType>}}
type BPFileComponentContextType = UiConfigRendererContextType & BPFileComponentExtras

export class BPFileComponent extends BPValueComponent<FileImportType | null, BPFileComponentState, StateValue> {
    context!: BPFileComponentContextType
    props!: BPComponentProps<FileImportType | null> & BPFileComponentExtras
    constructor(props: BPComponentProps<FileImportType | null> & BPFileComponentExtras, context: BPFileComponentContextType) {
        super(props, context, {
            mode: 'file',
            value: null,
            label: 'File'
        });
        if(!context.fileLoader && !props.fileLoader) throw new Error('BPFileComponent requires fileLoader to be available in context')
    }

    convertValueToState(val: FileImportType | null, state: BPFileComponentState): BPFileComponentState {
        let mode: BPFileComponentState['mode'] = state.mode
        let value = state.value
        if (val) { // todo: move to subclass in threepipe
            if (val.userData) {
                if (val.userData.__sourceBlob) {
                    value = val.userData.__sourceBlob
                    mode = 'file'
                } else if (val.userData.rootPath?.length) {
                    value = val.userData.rootPath
                    mode = 'url'
                }
            }
        }
        return {...state, mode, value}
    }

    async convertStateToValue(state: BPFileComponentState): Promise<FileImportType|null> {
        const value = state.value
        let val: any
        if (value === null) {
            val = null
        } else if (typeof value === 'string') {
            val = await (this.context.fileLoader ?? this.props.fileLoader)!.load(value);
        } else {
            // todo handle blob with no name
            val = await (this.context.fileLoader ?? this.props.fileLoader)!.load({path: value.name || 'file', file: value});
        }
        // console.log(val)
        return val;
    }

    // doesNeedRefresh(state: BPFileComponentState): boolean {
    //     return super.doesNeedRefresh(state);
    // }

    render() {
        return !this.state.hidden ? (
            <FormGroupComponent label={this.state.label} flexBasis={"100%"} disabled={this.state.disabled}>
                <FileComponent state={this.state} onChange={(s) => {
                    this.updateStateValue({...this.state, ...s}); // todo: set loading while this promise is happening.
                }} key={this.props.config.uuid}/>
            </FormGroupComponent>
        ) : null
    }
}
