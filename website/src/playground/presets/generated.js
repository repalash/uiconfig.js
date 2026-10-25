// Playground preset. The page shows the code between #region and #endregion: the body of a function
// that gets `log` and returns a config.
export default function preset(log) {
    // #region
    // Configs are plain objects, so code can build them: one slider for each key
    const mixer = {master: 0.8, drums: 0.6, bass: 0.7, keys: 0.4, vocals: 0.9}

    const config = {
        type: 'folder',
        label: 'Mixer',
        expanded: true,
        children: Object.keys(mixer).map((key) => ({
            type: 'slider',
            label: key,
            bounds: [0, 1],
            stepSize: 0.01,
            property: [mixer, key],
        })),
    }

    config.children.push({
        type: 'button',
        label: 'Mute all',
        onClick: () => {
            for (const key in mixer) mixer[key] = 0
            config.uiRefresh(true)
            log('muted', mixer)
        },
    })

    return config
    // #endregion
}
