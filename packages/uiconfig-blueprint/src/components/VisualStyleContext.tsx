import React from 'react'
import {Menu, MenuItem} from '@blueprintjs/core'
import {Classes} from '@blueprintjs/core/src/common'

export const defaultVisualStyle = {
    darkMode: true,
    setDarkMode: (_: boolean) => {},
    themes: {
        // https://github.com/pnnl/blueprint-styler/blob/9a2f5461f6e8682f829bd9e1722c5c4c051f7c0f/src/styles/style-manifest.ts#L12
        'bpx-default': { label: 'Blueprint Default', link: 'https://blueprintjs.com/docs/#blueprint' },
        'bpx-bpv3': { label: 'Blueprint v3', link: 'https://blueprintjs.com/docs/versions/3/' },
        'bpx-flat': { label: 'Flat', link: 'https://pnnl.github.io/blueprint-styler/?style=bpx-flat' },
        'bpx-carbon': { label: 'IBM Carbon', link: 'https://carbondesignsystem.com/components/overview/' },
        'bpx-antd': { label: 'Ant Design', link: 'https://ant.design/components/overview/' },
        'bpx-fluent': { label: 'Microsoft Fluent', link: 'https://fluentuipr.z22.web.core.windows.net/heads/master/theming-designer/index.html' },
        'bpx-pnnl': { label: 'PNNL v3', link: 'https://forgedev.pnnl.gov/prc3/' },
        // 'bpx-static': { label: 'None', link: 'https://blueprintjs.com/docs/#blueprint' },
    },
    theme: 'bpx-default',
    setTheme: (_: string) => {},
}
export const VisualStyleContext = React.createContext<typeof defaultVisualStyle>(defaultVisualStyle)
export const useVisualStyle = () => React.useContext(VisualStyleContext)

export function ThemeSettingsMenuComponent() {
    const visualStyle = useVisualStyle()
    return <Menu className={Classes.ELEVATION_0}  >
        <MenuItem
            icon="contrast"
            text="Color"
            // intent={intent}
            // labelElement={"⌘,"}
            roleStructure="menuitem"
            children={
                <>
                    <MenuItem icon="flash" text="Light Mode"
                              shouldDismissPopover={false}
                              selected={!visualStyle.darkMode}
                              onClick={() => visualStyle.setDarkMode(false)}
                              roleStructure="listoption"/>
                    <MenuItem icon="moon" text="Dark Mode"
                              shouldDismissPopover={false}
                              selected={visualStyle.darkMode}
                              onClick={() => visualStyle.setDarkMode(true)}
                              roleStructure="listoption"/>
                </>
            }
        />
        <MenuItem
            icon="style"
            text="Theme"
            // intent={intent}
            // labelElement={"⌘,"}
            roleStructure="menuitem"
            children={
                <>
                    {Object.entries(visualStyle.themes).map(([key, value]) => (
                        <MenuItem
                                  shouldDismissPopover={false}
                                  text={value.label}
                                  selected={visualStyle.theme === key}
                                  onClick={() => visualStyle.setTheme(key)}
                                  roleStructure="listoption"/>
                    ))}
                </>
            }
        />
    </Menu>
}
