import React from 'react'
import {Classes, Menu, MenuItem} from '@blueprintjs/core'

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

const localStoragePrefix = 'bpUi'
const localStorageIds = {
    'darkMode': localStoragePrefix + 'DarkMode',
    'theme': localStoragePrefix + 'Theme',
}
/**
 * The kept choices, in localStorage when the page has it. A sandboxed document (an opaque origin, like a page served with
 * `CSP: sandbox`) throws a SecurityError on any access to localStorage: there the defaults apply and a choice lasts until
 * reload.
 */
const visualStyleStorage = {
    get(key: string): string | null {
        try {
            return localStorage.getItem(key)
        } catch {
            return null
        }
    },
    set(key: string, value: string) {
        try {
            localStorage.setItem(key, value)
        } catch {
            // no storage on this page
        }
    },
}
export function setupVisualStyle(){
    const [darkMode, setDarkMode] = React.useState(visualStyleStorage.get(localStorageIds.darkMode) !== (defaultVisualStyle.darkMode ? 'false' : 'true'))
    React.useEffect(() => {
        visualStyleStorage.set(localStorageIds.darkMode, darkMode ? 'true' : 'false')
        const clas = Classes.DARK
        if(!darkMode)  document.body.classList.remove(clas)
        else document.body.classList.add(clas)
    }, [darkMode])
    const [theme, setTheme] = React.useState(visualStyleStorage.get(localStorageIds.theme) || defaultVisualStyle.theme)
    React.useEffect(() => {
        visualStyleStorage.set(localStorageIds.theme, theme)
        document.documentElement.classList.remove(...Object.keys(defaultVisualStyle.themes).map(k => k))
        document.documentElement.classList.add(theme)
    }, [theme])
    return {darkMode, setDarkMode, theme, setTheme}
}

export function VisualStyleProvider({children}: {children: React.ReactNode}) {
    const visualStyle = setupVisualStyle()
    return <VisualStyleContext.Provider value={{...defaultVisualStyle, ...visualStyle}}>
        {children}
    </VisualStyleContext.Provider>
}

export function ThemeSettingsMenuComponent() {
    const visualStyle = useVisualStyle()
    return <Menu className={Classes.ELEVATION_0}>
        <MenuItem
            icon="contrast"
            text="Color"
            // intent={intent}
            // labelElement={"⌘,"}
            roleStructure="menuitem"
            popoverProps={{
                hoverOpenDelay: 150,
                hoverCloseDelay: 300,
            }}
            children={
                <>
                    <MenuItem icon="flash" text="Light Mode"
                              shouldDismissPopover={false}
                              key="light"
                              selected={!visualStyle.darkMode}
                              onClick={() => visualStyle.setDarkMode(false)}
                              roleStructure="listoption"/>
                    <MenuItem icon="moon" text="Dark Mode"
                              shouldDismissPopover={false}
                              key="dark"
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
            popoverProps={{
                hoverOpenDelay: 150,
                hoverCloseDelay: 300,
            }}
            children={
                <>
                    {Object.entries(visualStyle.themes).map(([key, value]) => (
                        <MenuItem
                                  shouldDismissPopover={false}
                                  key={key}
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
