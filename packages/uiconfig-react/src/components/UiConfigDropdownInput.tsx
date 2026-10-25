import {UiConfigValueBaseState} from "./UiConfigValueBase.tsx";
import {UiConfigBaseProps2, UiConfigRendererContextType} from "./UiConfigBase.tsx";
import {UiConfigInput} from "./UiConfigInput.tsx";

export interface DropdownItem<T extends string|number=string|number>{
    label: string,
    value: T,
}

export type UiConfigDropdownState<T extends string|number=string|number> = UiConfigValueBaseState<T> & {
    options: DropdownItem<T>[]
}

export class UiConfigDropdownInput<T extends string|number=string|number> extends UiConfigInput<T, UiConfigDropdownState<T>> {
    constructor(props: UiConfigBaseProps2<T, UiConfigDropdownState<T>>, context: UiConfigRendererContextType) {
        super(props, context);
    }

    getUpdatedState(state: UiConfigDropdownState<T>): UiConfigDropdownState<T> {
        const children = this.context.methods.getChildren(this.props.config)
        let changed = state.options?.length !== children.length
        const options: DropdownItem<T>[] = children.map((value, i) => {
            const label = this.context.methods.getLabel(value)
            const last = state.options?.[i]
            const val = value!.value ?? label
            changed = changed || !last || label !== last.label || val !== last.value
            return {label, value: val}
        })
        if(changed) this.keyVersion++
        // const selected = options.find(o=>o.value===val)||options[0]
        return super.getUpdatedState({
            ...state, options
        });
    }

}
