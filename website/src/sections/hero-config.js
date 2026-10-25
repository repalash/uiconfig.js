// Config of the hero panel. The page shows the part between #region and #endregion.

/**
 * @param {string} color - initial color of the heading
 * @param {(heading: any) => void} applyToPage - writes the values to the heading element
 */
export function createHeadingConfig(color, applyToPage) {
    // #region
    const heading = {
        text: 'uiconfig.js',
        weight: 700,
        tracking: -0.03,
        case: 'none',
        color,
        outline: false,
    }

    const config = {
        type: 'folder',
        label: 'Heading',
        expanded: true,
        children: [
            {
                type: 'input',
                label: 'Text',
                property: [heading, 'text'],
                liveUpdate: true, // set the value while typing
            },
            {
                type: 'slider',
                label: 'Weight',
                bounds: [100, 900],
                stepSize: 10,
                property: [heading, 'weight'],
            },
            {
                type: 'slider',
                label: 'Tracking',
                bounds: [-0.08, 0.12],
                stepSize: 0.01,
                property: [heading, 'tracking'],
            },
            {
                type: 'dropdown',
                label: 'Case',
                property: [heading, 'case'],
                children: [
                    {label: 'As typed', value: 'none'},
                    {label: 'lowercase', value: 'lowercase'},
                    {label: 'UPPERCASE', value: 'uppercase'},
                ],
            },
            {type: 'color', label: 'Color', property: [heading, 'color']},
            {
                type: 'checkbox',
                label: 'Outline',
                property: [heading, 'outline'],
            },
            {
                type: 'button',
                label: 'Randomize',
                onClick: () => {
                    heading.weight = 200 + Math.round(Math.random() * 70) * 10
                    heading.tracking = Math.round(Math.random() * 20 - 8) / 100
                    applyToPage(heading)
                    config.uiRefresh(true) // show the new values in the panel
                },
            },
        ],
        // called after a change in any child
        onChange: () => applyToPage(heading),
    }
    // #endregion
    return {heading, config}
}
