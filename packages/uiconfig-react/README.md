# uiconfig-react

Base classes, sample react renderer and components for [uiconfig.js](https://github.com/repalash/uiconfig.js)

Checkout the renderers using `uiconfig-react`

- Un-styled JSX - [uiconfig-react](https://github.com/repalash/uiconfig.js/tree/master/packages/uiconfig-react) (This package)
- [shadcn/ui](https://ui.shadcn.com/) - [uiconfig-shadcn](https://github.com/repalash/uiconfig.js/tree/master/packages/uiconfig-shadcn)
- [Blueprint JS](https://blueprintjs.com/) - [uiconfig-blueprint](https://github.com/repalash/uiconfig.js/tree/master/packages/uiconfig-blueprint)
- [HeroUI/NextUI](https://www.heroui.com/) - [uiconfig-heroui](https://github.com/repalash/uiconfig-heroui)

## Installation

```bash
npm install uiconfig-react
```

## Usage

RendererSample with example UI components defined in - [ui-components.tsx](src/lib/ui-components.tsx)

Define a `uiconfig`
```tsx
const data: UiConfigContainer = {
    name: 'John',
    age: 30,
    city: 'Paris',
    
    uiConfig: {
        type: 'folder',
        label: 'Person',
        expanded: true,
        children: [
            {
                type: 'input',
                label: 'Name',
                property: [data, 'name'],
            },
            {
                type: 'number',
                label: 'Age',
                bounds: [0, 150],
                stepSize: 1,
                property: [data, 'age'],
            },
            {
                type: 'dropdown',
                label: 'City',
                property: [data, 'city'],
                children: ['New York', 'Paris', 'London'].map((v) => ({label: v})),
            },
            {
                type: 'button',
                label: 'Reset',
                onClick: () => {
                    data.name = 'John';
                    data.age = 30;
                    data.city = 'Paris';
                    // Update/Re-render the UI so that the changes are reflected
                    data.uiConfig.uiRefresh?.(true);
                },
            },
        ],
    },
};
```

Use the `ConfigObject` component to render the `uiconfig` inside React component - 
```tsx
// Component
function App() {
    return (
        <>
            <div>
                <RendererSample.Provider>
                    <ConfigObject config={data.uiConfig}/>
                </RendererSample.Provider>
            </div>
        </>
    )
}
// ReactDOM
createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
```

Or render the `uiconfig` directly in the HTML DOM - 
```tsx
const renderer = new RendererSample()
renderer.render(data.uiConfig, document.getElementById('root')!)

// when done, unmount the renderer
renderer.unmount()
```

This will create a container inside `root` element and render the `uiconfig` inside it.