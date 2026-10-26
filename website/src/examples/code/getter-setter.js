export default function example(ui, {log}) {
    // #region
    // the data is in Celsius; the panel shows Fahrenheit
    const room = {celsius: 21}

    const config = {
        type: 'folder',
        label: 'Room',
        expanded: true,
        children: [
            {
                type: 'slider',
                label: 'Temperature (°F)',
                bounds: [32, 104],
                stepSize: 0.5,
                getValue: () => room.celsius * 9 / 5 + 32,
                setValue: (fahrenheit) => {
                    room.celsius = (fahrenheit - 32) * 5 / 9
                    log('celsius', room.celsius.toFixed(2))
                },
            },
            {
                type: 'number',
                label: 'Temperature (°C)',
                property: [room, 'celsius'],
            },
            {
                type: 'button',
                label: 'Warmer by 1 °C',
                onClick: () => {
                    room.celsius += 1
                    config.uiRefresh(true)
                },
            },
        ],
        // show the change in the other component
        onChange: () => config.uiRefresh(true),
    }

    ui.appendChild(config)
    // #endregion
}
