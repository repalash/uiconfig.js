import React, {JSX, ReactNode, useEffect, useRef} from "react";
import {Button, ControlGroup, FileInput, HTMLSelect, InputGroup} from "@blueprintjs/core";
import {BPFileComponentState} from "../bpComponents/BPFileComponent";
import {useLoadingStateKey} from './loadingState'

export interface FileComponentProps<TSV = never> {
    state: BPFileComponentState<TSV>
    onChange: (state: Partial<BPFileComponentState<TSV>>)=>Promise<void>
    previewSlot?: ReactNode,
    uuid?: string
    AssetPicker?: (props: {
        state: BPFileComponentState<TSV>
        onChange: (state: Partial<BPFileComponentState<TSV>>)=>Promise<void>
        className?: string
        style?: React.CSSProperties
    })=>JSX.Element
    disableFileInput?: boolean // todo
}
export const FileComponent = <TSV,>({state, onChange, previewSlot, AssetPicker}: FileComponentProps<TSV>)=>{
    const fileInputRef = useRef<HTMLInputElement>()
    const textInputRef = useRef<HTMLInputElement>()
    // console.log('render file component', state)
    useEffect(() => {
        const fileElement = fileInputRef.current;
        const textElement = textInputRef.current;
        const val = state.value
        if(!val) {
            fileElement && (fileElement.value = '')
            textElement && (textElement.value = '')
            return
        }
        if(typeof val === 'string') {
            textElement && (textElement.value = val)
            return
        }
        if(!fileElement) return;
        // console.log(val)

        // it can be Blob also because of GLTF loaded...
        const file = val instanceof File ? val :
            typeof val === 'string' || typeof (val as any as Blob).arrayBuffer === 'function' ?
                new File([val as string | Blob], (val as any).name||('file'+((val as any).ext?'.'+(val as any).ext:'')))
                : null
        if(!file) return
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileElement!.files = dataTransfer.files
    }, [state.value]);
    // useEffect(() => {
    //     fileInputRef.current && (fileInputRef.current.placeholder = 'https://example.com/file.png')
    // }, []);

    // const hasValue = !!state.value || !!state.preview

    const dropdownOptions = ['url', 'file']
    if(AssetPicker) dropdownOptions.push('asset')

    const {loadingState, updateLoading} = useLoadingStateKey()

    return (
        <div style={{position: "relative", flexGrow: "1", display: "flex", height: "100%", flexDirection: "column"}}>
            {!!state.preview && (
                <>
                    {previewSlot}
                    <Button icon="small-cross"
                            size={"small"}
                            variant={"solid"}
                            disabled={state.disabled}
                            intent={"danger"}
                            style={{position: "absolute", top: 0, right: 0, opacity: 0.7}}
                            loading={loadingState}
                            onClick={() => updateLoading(onChange({value: null}))}></Button>
                </>
            )}
            <ControlGroup fill={false} vertical={false} style={{width: "100%"}}>
                {!state.readOnly && !state.value ? (<HTMLSelect options={dropdownOptions} minimal={true} fill={false}
                                                                disabled={state.disabled}
                                                                className={"file-component-select"}
                                                                value={state.mode} onChange={(e) => {
                    onChange({mode: e.target.value as BPFileComponentState['mode']})
                }}/>) : null}
                {state.mode === 'url' ? (
                    <InputGroup style={{flexGrow: "1", flexShrink: "1"}} inputRef={textInputRef as any} type="url"
                                defaultValue={typeof state.value === 'string' ? state.value : ''}
                                rightElement={(
                                    <Button disabled={state.readOnly} variant={"minimal"} icon="arrow-right" onClick={() => {
                                        onChange({mode: 'url', value: textInputRef.current?.value ?? ''})
                                    }}></Button>
                                )}
                                disabled={state.disabled} readOnly={state.readOnly}
                                onChange={(_) => {
                                }} placeholder="https://example.com/file.png"/>
                ) : state.mode === 'file' ? (
                    <FileInput inputProps={{ref: fileInputRef as any}}
                               style={{flexGrow: "1", flexShrink: "1", minWidth: "50px"}}
                               text={(state.value as File)?.name || 'No file'}
                               disabled={state.disabled}
                               onClick={(e) => {
                                   if (state.readOnly) {
                                       e.preventDefault()
                                       e.stopPropagation()
                                   }
                               }}
                               buttonText={state.readOnly ? '-' : state.value ? 'Change' : 'Choose'}
                               onChange={() => {
                                   onChange({mode: 'file', value: fileInputRef.current?.files?.[0] ?? null})
                               }} className="inputGroupFile"/>
                ) : state.mode === 'asset' && AssetPicker ? (
                    <AssetPicker state={state} onChange={onChange} className="inputGroupFile"/>
                ) : null}
                {!state.readOnly && state.value && !state.preview && (
                    <Button variant={"minimal"} icon="small-cross"
                            disabled={state.disabled}
                            loading={loadingState}
                            onClick={() => updateLoading(onChange({value: null}))
                            }></Button>
                )}
            </ControlGroup>
        </div>
    )
}
