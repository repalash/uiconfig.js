import {UiObjectConfig} from './types'
import {PrimitiveVal} from './primitive_value'
import {JSUndoManagerCommand2} from 'ts-browser-helpers'

export interface SetValueCommand extends JSUndoManagerCommand2{
    type: 'UiConfigMethods_set',
    config: UiObjectConfig,
    lastVal: PrimitiveVal
    val: PrimitiveVal
    final: boolean
    props: any
    time: number
}
export interface ActionCommand extends JSUndoManagerCommand2{
    type: 'UiConfigMethods_action',
    config: UiObjectConfig,
    target: object
    undo: ()=>any
    redo: ()=>any
    args: any[]
}
