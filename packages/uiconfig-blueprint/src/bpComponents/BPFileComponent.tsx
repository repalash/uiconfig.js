import {FileComponent} from "../components/FileComponent";
import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {BPValueComponent, BPValueComponentState} from "./BPValueComponent";
import {FormGroupComponent} from "../components/FormGroupComponent";

type StateValue = string | File | null
type FileImportType = any
export type BPFileComponentState = BPValueComponentState<StateValue> & {
    mode: 'url'|'file',
    preview?: string,
}

type BPFileComponentExtras = {fileLoader?: {load: (v: string|File|{path: string, file: File|Blob})=>Promise<FileImportType>}}
type BPFileComponentContextType = UiConfigRendererContextType & BPFileComponentExtras

// todo make this abstract?
// @ts-ignore
export class BPFileComponent<T extends FileImportType=FileImportType, TP = {}> extends BPValueComponent<T | null, BPFileComponentState, StateValue> {
    declare context: BPFileComponentContextType
    declare props: BPComponentProps<T | null> & BPFileComponentExtras & TP
    constructor(props: BPComponentProps<T | null> & BPFileComponentExtras & TP, context: BPFileComponentContextType) {
        super(props, context, {
            mode: 'url',
            value: null,
            label: 'File'
        });
        if(!context.fileLoader && !props.fileLoader) throw new Error('BPFileComponent requires fileLoader to be available in context')
    }

    // reimplemented in subclass
    convertValueToState(_val: T | null, _state: BPFileComponentState): BPFileComponentState {
        throw new Error('Not Implemented')
        // let mode: BPFileComponentState['mode'] = state.mode
        // let value = state.value
        // if (val) {
        //     if (val.userData) {
        //         if (val.userData.__sourceBlob) {
        //             value = val.userData.__sourceBlob
        //             mode = 'file'
        //         } else if (val.userData.rootPath?.length) {
        //             value = val.userData.rootPath
        //             mode = 'url'
        //         }
        //     }
        // }
        // return {...state, mode, value}
    }

    async convertStateToValue(state: BPFileComponentState): Promise<T|null> {
        const value = state.value
        let val: any
        const last = this.context.methods.getRawValue(this.props.config as any) ?? null
        const lastState = this.convertValueToState(last as any, {...this.state, value: null})
        if (value === null) {
            val = null
        } else if (typeof value === 'string') {
            val = value === lastState.value ? last : await (this.context.fileLoader ?? this.props.fileLoader)!.load(value);
        } else {
            // todo handle blob with no name
            val = value === lastState.value ? last : await (this.context.fileLoader ?? this.props.fileLoader)!.load({path: value.name || 'file', file: value});
        }
        // console.log(val)
        return val;
    }

    // doesNeedRefresh(state: BPFileComponentState): boolean {
    //     return super.doesNeedRefresh(state);
    // }

    renderPreviewSlot() {
        return <img src={"https://threepipe.org/logo.svg"}
                    style={{width: "100%", maxHeight: "80px", objectFit: "contain"}}/>
    }

    // async updateStateValue(state: BPFileComponentState, last?: boolean): Promise<void> {
    //     if(state.value !== this.state.value && state.preview) delete state.preview
    //     return super.updateStateValue(state, last);
    // }

    protected flexBasis = "100%"

    render() {
        let show = !this.state.hidden
        // todo - document hideOnEmpty. it hides the whole component if there is no value and no preview. (used in SSReflectionPlugin)
        if (show && this.props.config.hideOnEmpty && !this.state.preview && !this.state.value) {
            show = false
        }
        return show ? (
            <FormGroupComponent
                label={this.state.label}
                disabled={this.state.disabled}
                flexBasis={this.state.baseWidth ?? this.flexBasis}
            >
                <FileComponent previewSlot={this.renderPreviewSlot()} state={this.state} onChange={(s) =>
                    this.updateStateValue({...this.state, preview: undefined, ...s}) // todo: set loading while this promise is happening.
                } key={this.props.config.uuid}/>
            </FormGroupComponent>
        ) : null
    }
}
