import {BladeApi, FolderApi, TabPageApi} from 'tweakpane'
import {BladeController, View} from '@tweakpane/core'
import {UiObjectConfig} from 'uiconfig.js'

/**
 * Check if child.parent === parent
 * @param child
 * @param parent
 */
export const tweakpaneCheckParent = (child: BladeApi<BladeController<View>>, parent: FolderApi) => {
    return parent.controller_.rackController.rack === child.controller_.parent
}
/**
 * Index of a blade among the children of its parent (a folder or a tab page), or undefined.
 * @param child
 * @param parent
 */
export const tweakpaneChildIndex = (child: BladeApi<BladeController<View>>, parent: FolderApi | TabPageApi): number | undefined => {
    const rack = parent instanceof TabPageApi ? parent.controller_.contentController.rack : parent.controller_.rackController.rack
    const index = rack.children.indexOf(child.controller_)
    return index >= 0 ? index : undefined
}
/**
 * Move to a new parent or change index in the same parent.
 * @param child
 * @param newParent
 * @param index
 */
export const tweakPaneMoveToParentIndex = (child: BladeApi<BladeController<View>>, newParent: FolderApi, index: number): boolean => {
    // console.log('tweakpane moving', (child as any).title, newParent.title, index)
    const cont = child.controller_
    const ind = cont.parent?.children?.indexOf(cont)
    const sameParent = tweakpaneCheckParent(child, newParent)
    if (!sameParent) {
        if (ind !== undefined && ind >= 0) {
            cont.parent?.remove(cont)
        }
        newParent.add(child as any, index)
        return true
    } else {
        if (ind !== index) {
            const i = newParent.controller_.rackController.rack.children.indexOf(cont)
            if (i !== -1) {
                newParent.controller_.rackController.rack.children.splice(i, 1)
                newParent.controller_.rackController.rack.children.splice(index, 0, cont)
                return true
            }
        }
    }
    return false
}

/**
 * Set up property forwarding from parent config to child config
 * @param child - The child config that should inherit properties
 * @param parent - The parent config to inherit properties from
 */
export const setupPropertyForwarding = (child: UiObjectConfig, parent: UiObjectConfig): void => {
    if (child.property === undefined &&
        child.value === undefined &&
        child.getValue === undefined &&
        child.setValue === undefined &&
        child.type !== 'button' &&
        (parent.property !== undefined || parent.value !== undefined)
    ) {
        child.property = parent.property !== undefined ? parent.property : [parent, 'value']
    }
}
