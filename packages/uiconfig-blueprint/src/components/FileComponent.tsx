import React, {useEffect, useRef} from "react";
import {Button, ControlGroup, FileInput, HTMLSelect, InputGroup} from "@blueprintjs/core";
import {BPFileComponentState} from "../bpComponents/BPFileComponent";

export interface FileComponentProps {
    state: BPFileComponentState
    onChange: (state: Partial<BPFileComponentState>)=>void
}
export const FileComponent: React.FC<FileComponentProps> = ({state, onChange})=>{
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
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(val instanceof File ? val : new File([val], (val as any).name||('file'+((val as any).ext?'.'+(val as any).ext:'')))); // it can be Blob also because of GLTF loaded...
        fileElement!.files = dataTransfer.files
    }, [state.value]);
    // useEffect(() => {
    //     fileInputRef.current && (fileInputRef.current.placeholder = 'https://example.com/file.png')
    // }, []);

    return (
        <div style={{flexGrow: "1", display: "flex", height: "100%"}}>
            <ControlGroup fill={false} vertical={false} style={{width: "100%"}}>
                {!state.readOnly ? (<HTMLSelect options={['url', 'file']} minimal={true} fill={false}
                            disabled={state.disabled}
                            value={state.mode} onChange={(e)=>{
                    onChange({mode: e.target.value as 'url'|'file'})
                }} /> ) : null}
                {state.mode === 'url' ? (
                    <InputGroup style={{flexGrow: "1", flexShrink: "1"}} inputRef={textInputRef as any} type="url" defaultValue={typeof state.value === 'string' ? state.value : ''}
                                rightElement={(
                                    <Button disabled={state.readOnly} minimal={true} icon="arrow-right" onClick={()=>{
                                        onChange({mode:'url', value: textInputRef.current?.value??''})
                                    }} ></Button>
                                )}
                                disabled={state.disabled} readOnly={state.readOnly}
                                onChange={(_)=>{
                                }} placeholder="https://example.com/file.png"/>
                ) : (
                    <FileInput inputProps={{ref: fileInputRef as any}} style={{flexGrow: "1", flexShrink: "1", minWidth: "50px"}}
                               text={(state.value as File)?.name || 'No file'}
                               disabled={state.disabled}
                               onClick={(e)=>{
                                   if(state.readOnly) {
                                       e.preventDefault()
                                       e.stopPropagation()
                                   }
                               }}
                               buttonText={state.readOnly ? '-' : state.value ? 'Change' : 'Choose'}
                               onChange={()=>{
                                   onChange({mode: 'file', value: fileInputRef.current?.files?.[0]??null})
                               }} className="inputGroupFile" />
                )}
                {!state.readOnly && state.value && (
                <Button minimal={true} icon="small-cross"
                        disabled={state.disabled}
                        onClick={()=>{
                    onChange({value: null})
                }}></Button>
                )}
            </ControlGroup>
        </div>
    )
}
