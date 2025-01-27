import {BPValueComponentState} from "./BPValueComponent.tsx";
import {BPComponentProps2, UiConfigRendererContextType} from "./BPComponent.tsx";
import {BPInputComponent} from "./BPInputComponent.tsx";

export interface DropdownItem<T extends string|number=string|number>{
    label: string,
    value: T,
}

export type BPDropdownComponentState<T extends string|number=string|number> = BPValueComponentState<T> & {
    options: DropdownItem<T>[]
}

export class BPDropdownInputComponent<T extends string|number=string|number> extends BPInputComponent<T, BPDropdownComponentState<T>> {
    constructor(props: BPComponentProps2<T, BPDropdownComponentState<T>>, context: UiConfigRendererContextType) {
        super(props, context);
    }

    getUpdatedState(state: BPDropdownComponentState<T>): BPDropdownComponentState<T> {
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
