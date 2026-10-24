import {createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useState} from 'react'
import {Button, Dialog, DialogBody, DialogFooter, FormGroup, InputGroup} from '@blueprintjs/core'
import {useLoadingState} from './loadingState'
import {Intent} from '@blueprintjs/core/src/common/intent'

export type DialogStateType = {
    isOpen: boolean,
    title: string,
    content: ReactNode,
    actions: ReactNode,
    state: any,
    canClose: boolean // if true, dialog can be closed by clicking outside of it
}
export const defaultDialogContext = {
    isOpen: false, title: '',
    content: null as ReactNode,
    actions: null as ReactNode,
    state: {} as any, canClose: true,
}
export function setupDialog(){
    const [dialog, setDialog] = useState<DialogStateType>(defaultDialogContext)
    const open = useCallback((d: Partial<DialogStateType>)=>{
        setDialog((d1)=>({...d1, ...d, isOpen: true}))
    }, [])
    const close = useCallback(()=>setDialog((d1)=>({...d1, isOpen: false})), [])
    const setDialogState = useCallback((state: any)=>{
        setDialog((d1)=>({...d1, state}))
    }, [])
    return {dialog, open, close, setDialog, state: dialog.state, setState: setDialogState}
}
export const DialogContext = createContext<{
    dialog: DialogStateType,
    open: (d: Partial<DialogStateType>)=>void,
    close: ()=>void,
    setDialog: Dispatch<SetStateAction<DialogStateType>>,
    setState: Dispatch<SetStateAction<any>>,
    state: any
}>(
    {dialog: defaultDialogContext, open: ()=>{}, close: ()=>{}, setDialog: ()=>{}, setState: ()=>{}, state: {}}
)
export const useDialog = () => useContext(DialogContext)

export function DialogProvider({children}: {children: ReactNode}){
    const dialog = setupDialog()
    return <DialogContext.Provider value={{...dialog}}>
        {children}
    </DialogContext.Provider>
}

export function DialogComponent(){
    const {dialog, close} = useDialog()
    return (
        <Dialog title={dialog.title}
                isOpen={dialog.isOpen}
                usePortal={false}
                isCloseButtonShown={dialog.canClose}
                onClose={() => {dialog.canClose && close()}}>
        <DialogBody>
            {dialog.content}
        </DialogBody>
        <DialogFooter actions={dialog.actions}/>
    </Dialog>)
}

interface DialogPromptState {
    value: string,
    intent: Intent,
    helperText: string,
    key: string,
}
interface DialogPromptProps extends Partial<DialogStateType>, Partial<DialogPromptState>{
    closeButtonText?: string,
    submitButtonText?: string,
    message?: string,
    placeholder?: string,
    showInput?: boolean,
    onClose?: (value: string)=>boolean|undefined|Promise<boolean|undefined>, // does not close if false
    onSubmit?: (value: string)=>boolean|undefined|any|Promise<boolean|undefined|any>, // does not close if false
}
/**
 * Usage:
 * ```tsx
 * const {prompt, close} = useDialogPrompt()
 * const text = await prompt({
 *    title: 'Enter some text',
 *    message: 'Enter some text: ',
 *    placeholder: 'Enter some text',
 *    value: 'Default Value',
 *    onClose: ()=>{console.log('close'); return true},
 *    onSubmit: ()=>{console.log('submit'); return true},
 *    closeButtonText: 'Close',
 *    submitButtonText: 'Okay',
 * })
 * ```
 */
export function useDialogPrompt(){
    const {open, close} = useDialog()
    const prompt = useCallback(({
        closeButtonText = 'Close',
        submitButtonText = 'Okay',
        message = 'Enter some text: ',
        placeholder = '',
        value = '',
        showInput = true,
        onClose, onSubmit,
        helperText = '',
        intent = Intent.NONE,
        ...props}: DialogPromptProps) => {
        return new Promise<string|null>((resolve)=>{
            open({
                canClose: false,
                state: {
                    value,
                    intent,
                    helperText,
                    key: Math.random().toString(36).slice(2, 10),
                } as DialogPromptState,
                content: (
                    <DialogPromptContent message={message} showInput={showInput} placeholder={placeholder}/>
                ),
                actions: (
                    <DialogPromptButtons closeButtonText={closeButtonText} submitButtonText={submitButtonText} onClose={onClose} onSubmit={onSubmit} resolve={resolve}/>
                ),
                ...props,
            })
        })
    }, [open, close])
    return {prompt, close, open}
}

function DialogPromptButtons({
    closeButtonText = 'Close',
    submitButtonText = 'Okay',
    onClose, onSubmit, resolve
 }:{
    closeButtonText?: string,
    submitButtonText?: string,
    onClose?: (value: string)=>boolean|undefined|Promise<boolean|undefined>, // does not close if false
    onSubmit?: (value: string)=>boolean|undefined|{error: string}|Promise<boolean|undefined|{error: string}>, // does not close if false
    resolve: (value: string|null)=>void,
}){
    const {loadingState, updateLoading} = useLoadingState()
    const {state, setState, close} = useDialog() as {state: DialogPromptState, setState: Dispatch<SetStateAction<DialogPromptState>>, close: ()=>void}
    const doClose = async()=> {
        if (onClose && (await onClose(state.value)) !== true) return
        close()
        resolve(null)
    }
    const doSubmit = async()=> {
        if (onSubmit) {
            const res = await onSubmit(state.value)
            if(res && (res as any).error){
                setState({...state, intent: Intent.DANGER, helperText: (res as any).error})
            }
            if(res !== true) return
        }
        close()
        resolve(state.value)
    }
    return <>
        <Button text={closeButtonText}
                loading={loadingState['popup-close']}
                onClick={() => updateLoading('popup-close', doClose())}/>
        <Button text={submitButtonText}
                intent="primary"
                data-dialog-submit="true"
                loading={loadingState['popup-submit']}
                onClick={() => updateLoading('popup-submit', doSubmit())}/>
    </>

}

function DialogPromptContent({
    message = 'Enter some text: ',
    placeholder = '',
    showInput = true,
}: {
    message?: string,
    placeholder?: string,
    showInput?: boolean,
}){
    const {state, setState} = useDialog() as {state: DialogPromptState, setState: Dispatch<SetStateAction<DialogPromptState>>}
    const {loadingState} = useLoadingState()

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            // Get the submit button using the data attribute and simulate a click
            const submitButton = document.querySelector('[data-dialog-submit="true"]') as HTMLButtonElement;
            if (submitButton && !loadingState['popup-submit']) {
                submitButton.click();
            }
        }
    }

    return <FormGroup
        helperText={state.helperText||undefined}
        intent={state.intent}
        label={message}
        labelFor="dialog-prompt-text-input"
    >
        <InputGroup
            key={state.key}
            intent={state.intent}
            id="dialog-prompt-text-input"
            placeholder={placeholder}
            defaultValue={state.value}
            style={{display: showInput ? 'block' : 'none'}}
            autoFocus={true}
            onChange={(e: any) => {
                state.value = e.target.value
                state.helperText = ''
                state.intent = Intent.NONE
                setState({...state})
            }}
            onKeyDown={handleKeyDown}
        />
    </FormGroup>
}
