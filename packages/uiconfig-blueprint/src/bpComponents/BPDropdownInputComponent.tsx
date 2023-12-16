import React from "react";
import {BPComponentProps, UiConfigRendererContextType} from "./BPComponent";
import {Button, MenuItem} from "@blueprintjs/core";
import {BPInputComponent} from "./BPInputComponent";
import {BPValueComponentState} from "./BPValueComponent";
import {ItemRenderer, Select} from "@blueprintjs/select";

export interface DropdownItem{
    label: string,
    value: string|number,
}

export type BPDropdownComponentState = BPValueComponentState<string|number> & {
    options: DropdownItem[]
}
const renderDropdownItem: ItemRenderer<DropdownItem> = (item, { handleClick, handleFocus, modifiers }) => {
    if (!modifiers.matchesPredicate) {
        return null;
    }
    return (
        <MenuItem
            text={item.label}
            label={''}
            roleStructure="listoption"
            active={modifiers.active}
            key={item.value}
            onClick={handleClick}
            onFocus={handleFocus}
        />
    );
};

export class BPDropdownInputComponent extends BPInputComponent<string|number, BPDropdownComponentState> {
    constructor(props: BPComponentProps<string|number>, context: UiConfigRendererContextType) {
        super(props, context, {
            value: '0',
            label: 'Dropdown',
            options: [{label: 'none', value: ''}]
        });
    }

    getUpdatedState(state: BPDropdownComponentState): BPDropdownComponentState {
        const children = this.context.methods.getChildren(this.props.config)
        const options: DropdownItem[] = children.map(value => {
            const label = this.context.methods.getLabel(value)
            return {label, value: value!.value ?? label}
        })

        // const selected = options.find(o=>o.value===val)||options[0]
        return super.getUpdatedState({
            ...state, options
        });
    }

    renderInput() {
        const item = this.state.options.find(o=>o.value===this.state.value)||this.state.options[0]
        return (
            <Select<DropdownItem>
                filterable={false}
                activeItem={item}
                key={this.props.config.uuid}
                disabled={this.state.disabled}
                popoverProps={{
                    minimal: true
                }}
                noResults={<MenuItem disabled={true} text="No results."  roleStructure="listoption" />}
                items={this.state.options}
                onItemSelect={(item)=> {
                    if(this.state.readOnly) return
                    this.setValue(item.value)
                }}
                itemRenderer={renderDropdownItem}
            >
                {/* children become the popover target; render value here */}
                <Button rightIcon="double-caret-vertical" small={true}
                        style={{whiteSpace: 'nowrap', textOverflow: "ellipsis"}}>{item.label}</Button>
            </Select>
        )
    }
}
