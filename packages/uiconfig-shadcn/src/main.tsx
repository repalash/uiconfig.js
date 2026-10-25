import {UiObjectConfig} from 'uiconfig.js';
import {createRoot} from "react-dom/client";
import React from "react";
import App from "@/App.tsx";

// const data = {
//     name: 'John',
//     age: 30,
//     accept: false,
//     city: 'Paris',
// };
// const uiConfig: UiObjectConfig = {
//     type: 'folder',
//     label: 'Person',
//     expanded: true,
//     children: [
//         {
//             type: 'input',
//             label: 'Name',
//             property: [data, 'name'],
//         },
//         {
//             type: 'number',
//             label: 'Age',
//             bounds: [0, 150],
//             stepSize: 1,
//             property: [data, 'age'],
//         },
//         {
//             type: 'slider',
//             label: 'Age',
//             bounds: [0, 150],
//             stepSize: 1,
//             property: [data, 'age'],
//         },
//         {
//             type: 'dropdown',
//             label: 'City',
//             property: [data, 'city'],
//             children: ['New York', 'Paris', 'London'].map((v) => ({label: v})),
//         },
//         {
//             type: 'checkbox',
//             label: 'Accept',
//             property: [data, 'accept'],
//         },
//         {
//             type: 'button',
//             label: 'Reset',
//             onClick: () => {
//                 data.name = 'John';
//                 data.age = 30;
//                 data.city = 'Paris';
//                 // Update/Re-render the UI so that the changes are reflected
//                 uiConfig.uiRefresh?.(true);
//             },
//         },
//     ],
// }

// const renderer = new UiConfigRendererReact(document.getElementById('root')!, uiConfig, shadCnCss)

// renderer.render()

createRoot(document.getElementById('root')!).render(
    // <React.StrictMode>
        <App />
    // </React.StrictMode>,
)
