import {BladeApi, FolderApi} from 'tweakpane'
import {BladeController, View} from '@tweakpane/core'

/**
 * Check if child.parent === parent
 * @param child
 * @param parent
 */
export const tweakpaneCheckParent = (child: BladeApi<BladeController<View>>, parent: FolderApi) => {
    return parent.controller_.rackController.rack === child.controller_.parent
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
    if (!sameParent || ind !== index) {
        if (ind !== undefined && ind >= 0) cont.parent?.remove(child as any)
        newParent.add(child as any, index)
        return true
    }
    return false
}
