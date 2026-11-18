import {UiObjectConfig} from './types'
import {
    ActionUndoCommand,
    PrimitiveVal,
    SetValueUndoCommand,
    SetValueUndoCommandProps,
} from 'ts-browser-helpers'

export const undoCommandTypes = {
    setValue: 'UiConfigMethods_set' as const,
    action: 'UiConfigMethods_action' as const,
} as const

// a named type of uiconfig.js, that an app can extend
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SetValueCommandProps<T extends PrimitiveVal = PrimitiveVal> extends SetValueUndoCommandProps<T>{
}

// a named type of uiconfig.js, that an app can extend
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SetValueCommand<T extends PrimitiveVal = PrimitiveVal> extends SetValueUndoCommand<T, typeof undoCommandTypes.setValue, UiObjectConfig, SetValueCommandProps<T>>{
}

// a named type of uiconfig.js, that an app can extend
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ActionCommand<TA=any[]> extends ActionUndoCommand<typeof undoCommandTypes.action, UiObjectConfig, TA>{
}
