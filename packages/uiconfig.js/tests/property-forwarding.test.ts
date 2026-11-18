import {describe, expect, test} from 'vitest'
import {UiConfigMethods, UiObjectConfig} from '../src'

describe('SetupPropertyForwarding', () => {
    test('a child with no binding gets the property of its parent, or [parent, "value"]', () => {
        const target = {a: 1}
        const viaProperty: UiObjectConfig = {type: 'number', path: 'a'}
        UiConfigMethods.SetupPropertyForwarding(viaProperty, {type: 'folder', property: [target, 'obj']})
        expect(viaProperty.property).toEqual([target, 'obj'])
        const folder: UiObjectConfig = {type: 'folder', value: target}
        const viaValue: UiObjectConfig = {type: 'number', path: 'a'}
        UiConfigMethods.SetupPropertyForwarding(viaValue, folder)
        expect(viaValue.property).toEqual([folder, 'value'])
    })

    test('a child with its own binding, a button, or a parent without a binding is left as it is', () => {
        const parent: UiObjectConfig = {type: 'folder', value: {}}
        const own: UiObjectConfig = {type: 'number', property: [{}, 'x']}
        const getter: UiObjectConfig = {type: 'number', getValue: () => 1}
        const button: UiObjectConfig = {type: 'button'}
        for (const c of [own, getter, button]) UiConfigMethods.SetupPropertyForwarding(c, parent)
        expect(own.property).toEqual([{}, 'x'])
        expect(getter.property).toBeUndefined()
        expect(button.property).toBeUndefined()
        const child: UiObjectConfig = {type: 'number'}
        UiConfigMethods.SetupPropertyForwarding(child, {type: 'folder'})
        expect(child.property).toBeUndefined()
    })
})
