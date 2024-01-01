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
        setDialog({...dialog, isOpen: true, ...d})
    }, [dialog, setDialog])
    const close = useCallback(()=>setDialog({...dialog, isOpen: false}), [dialog, setDialog])
    return {dialog, open, close, setDialog}
}
export const DialogContext = createContext<{dialog: DialogStateType, open: (d: Partial<DialogStateType>)=>void, close: ()=>void, setDialog: Dispatch<SetStateAction<DialogStateType>>}>(
    {dialog: defaultDialogContext, open: ()=>{}, close: ()=>{}, setDialog: ()=>{}}
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
        <Dialog title={dialog.title} isOpen={dialog.isOpen} isCloseButtonShown={dialog.canClose} onClose={() => {dialog.canClose && close()}}>
        <DialogBody>
            {dialog.content}
        </DialogBody>
        <DialogFooter actions={dialog.actions}/>
    </Dialog>)
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
    const {loadingState, updateLoading} = useLoadingState()
    const [intent, setIntent] = useState<Intent>(Intent.NONE)
    const [helperText, setHelperText] = useState('')
    const prompt = useCallback(({
        closeButtonText = 'Close',
        submitButtonText = 'Okay',
        message = 'Enter some text: ',
        placeholder = '',
        value = '',
        showInput = true,
        onClose, onSubmit,
        ...props}: Partial<DialogStateType> &
        {
            closeButtonText?: string,
            submitButtonText?: string,
            message?: string,
            placeholder?: string,
            value?: string,
            showInput?: boolean,
            onClose?: (value: string)=>boolean|undefined|Promise<boolean|undefined>, // does not close if false
            onSubmit?: (value: string)=>boolean|undefined|any|Promise<boolean|undefined|any>, // does not close if false
    }) => {
        return new Promise<string|null>((resolve)=>{
            const state = {value}
            const doClose = async()=> {
                if (onClose && (await onClose(state.value)) !== false) return
                close()
                resolve(null)
            }
            const doSubmit = async()=> {
                if (onSubmit) {
                    const res = await onSubmit(state.value)
                    if(res.error){
                        setIntent(Intent.DANGER)
                        setHelperText(res.error)
                    }
                    if(res !== false) return
                }
                close()
                resolve(state.value)
            }
            open({
                canClose: false,
                ...props,
                state,
                content: (
                    <FormGroup
                        helperText={helperText||undefined}
                        intent={intent}
                        label={message}
                        labelFor="dialog-prompt-text-input"
                    >
                        <InputGroup
                            intent={intent}
                            id="dialog-prompt-text-input"
                            placeholder={placeholder}
                            defaultValue={state.value}
                            style={{display: showInput ? 'block' : 'none'}}
                            onChange={(e: any) => {
                                state.value = e.target.value
                                if(helperText) setHelperText('')
                                if(intent !== Intent.NONE) setIntent(Intent.NONE)
                            }} // todo: submit on enter
                        />
                    </FormGroup>
                ),
                actions: (
                    <>
                        <Button text={closeButtonText}
                                loading={loadingState['popup-close']}
                                onClick={() => updateLoading('popup-close', doClose())}/>
                        <Button text={submitButtonText}
                                intent="primary"
                                loading={loadingState['popup-submit']}
                                onClick={() => updateLoading('popup-submit', doSubmit())}/>
                    </>
                ),
            })
        })
    }, [open, close, loadingState, updateLoading])
    return {prompt, close}
}
