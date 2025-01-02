import {useCallback, useState} from 'react'

export function useLoadingState(){
    const [loadingState, setLoadingState] = useState<Record<string, boolean>>({})
    const updateLoading = useCallback(async (key: string, promise?: Promise<any>|void) => {
        if(!promise || promise.then === undefined) return setLoadingState({...loadingState, [key]: false})
        setLoadingState({...loadingState, [key]: true})
        await promise.then(() => setLoadingState({...loadingState, [key]: false}))
    }, [loadingState])
    return {loadingState, updateLoading}
}
export function useLoadingStateKey(){
    const [loadingState, setLoadingState] = useState<boolean>(false)
    const updateLoading = useCallback(async (promise?: Promise<any>|void) => {
        if(!promise || promise.then === undefined) return setLoadingState(false)
        setLoadingState(true)
        await promise.then(() => setLoadingState(false))
    }, [loadingState])
    return {loadingState, updateLoading}
}
