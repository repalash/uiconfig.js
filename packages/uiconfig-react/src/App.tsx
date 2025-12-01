import './App.css'
import {ConfigObject} from "./components/ConfigObject.tsx";
import {RendererSample} from './lib/ui-components.tsx';
import {UiObjectConfig} from "uiconfig.js";

const people = [{
    name: 'John',
    age: 30,
    city: 'Paris',
    location: [50, 60, 53],
    accept: false,
    color: '#ff00f0',
}, {
    name: 'Jane',
    age: 25,
    city: 'New York',
    location: [150, 12, 52],
    accept: true,
    color: '#ff00f0',
},{
    name: 'Doe',
    age: 40,
    city: 'London',
    location: [100, 100, 100],
    accept: false,
    color: '#ff00f0',
},{
    name: 'Smith',
    age: 35,
    city: 'Paris',
    location: [50, 150, 53],
    accept: true,
    color: '#ff00f0',
}]

const uiConfig: UiObjectConfig = {
    type: 'folder',
    label: 'People',
    uuid: 'people',
    expanded: true,
    onChange: (ev) => {
        console.log(ev)
    },
    children: [{
        type: 'button',
        label: 'Add Person',
        uuid: 'addPerson',
        order: 1000,
        onClick: () => {
            const newPerson = {
                name: 'New Person',
                age: 20,
                city: 'New City',
                location: [0, 0, 0],
                accept: false,
                color: '#000000',
            }
            people.push(newPerson)
            uiConfig.uiRefresh?.(true)
        }
    },()=>people.map((p,i)=>{
        const ui = {
            type: 'folder',
            value: p,
            uuid: 'person'+i,
            label: ()=>`${p.name} (${p.age})`,
            onChange: () => ui.uiRefresh?.(false),
            children: [
                {
                    type: 'input',
                    label: 'Name',
                    uuid: 'name',
                    path: 'name',
                },
                {
                    type: 'slider',
                    label: 'Age',
                    bounds: [50, 150],
                    stepSize: 1,
                    uuid: 'age',
                    path: 'age',
                },
                // {
                //     type: 'number',
                //     label: 'Age2',
                //     bounds: [50, 150],
                //     stepSize: 1,
                //     uuid: 'age2',
                //     path: 'age',
                // },
                {
                    type: 'vector',
                    label: 'Location',
                    bounds: [50, 150],
                    stepSize: 1,
                    uuid: 'location',
                    path: 'location',
                },
                {
                    type: 'dropdown',
                    label: 'City',
                    children: ['New York', 'Paris', 'London'].map((v) => ({label: v})),
                    uuid: 'city',
                    path: 'city',
                },
                {
                    type: 'checkbox',
                    label: 'Accept',
                    uuid: 'accept',
                    path: 'accept',
                },
                {
                    type: 'color',
                    label: 'Color',
                    uuid: 'color',
                    path: 'color',
                },
                {
                    type: 'button',
                    label: 'Reset',
                    uuid: 'reset',
                    onClick: () => {
                        p.name = 'John';
                        p.age = 30;
                        p.city = 'Paris';
                        p.accept = false;
                        // Update/Re-render the UI so that the changes are reflected
                        ui.uiRefresh?.(true);
                    },
                } as UiObjectConfig,
            ]} as UiObjectConfig
        return ui
    })],
}

function App() {
    return (
        <>
            <div>
                <RendererSample.Provider>
                    <ConfigObject config={uiConfig}/>
                </RendererSample.Provider>
            </div>
        </>
    )
}

export default App
