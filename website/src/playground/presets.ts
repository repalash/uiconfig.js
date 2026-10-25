// Starting points for the playground. Each one is the body of a function: it gets `log`
// and must return a config.

export const presets: {name: string, code: string}[] = [
    {
        name: 'Person',
        code: `// The panel rebuilds as you type. Return a config; log() prints under the panel.
const data = {
  name: 'Ada',
  age: 36,
  city: 'London',
}

const config = {
  type: 'folder',
  label: 'Person',
  expanded: true,
  children: [
    {type: 'input', label: 'Name', property: [data, 'name']},
    {type: 'slider', label: 'Age', bounds: [0, 120], stepSize: 1, property: [data, 'age']},
    {
      type: 'dropdown',
      label: 'City',
      property: [data, 'city'],
      children: ['London', 'Paris', 'Tokyo'].map((v) => ({label: v})),
    },
    {type: 'button', label: 'Log data', onClick: () => log(data)},
  ],
}

return config
`,
    },
    {
        name: 'Hidden and disabled',
        code: `// hidden, disabled and label can be functions: the renderer calls them on each refresh
const shadows = {
  enabled: true,
  quality: 'high',
  resolution: 2048,
  softness: 0.5,
}

const config = {
  type: 'folder',
  label: 'Shadows',
  expanded: true,
  children: [
    {type: 'checkbox', label: 'Enabled', property: [shadows, 'enabled']},
    {
      type: 'dropdown',
      label: 'Quality',
      property: [shadows, 'quality'],
      children: ['low', 'high', 'custom'].map((v) => ({label: v})),
      disabled: () => !shadows.enabled,
    },
    {
      type: 'slider',
      label: 'Resolution',
      bounds: [256, 4096],
      stepSize: 256,
      property: [shadows, 'resolution'],
      hidden: () => shadows.quality !== 'custom',
    },
    {
      type: 'slider',
      label: () => 'Softness ' + Math.round(shadows.softness * 100) + '%',
      bounds: [0, 1],
      stepSize: 0.01,
      property: [shadows, 'softness'],
      disabled: () => !shadows.enabled,
    },
  ],
  // after any change, refresh the panel so that the functions run again
  onChange: () => config.uiRefresh(true),
}

return config
`,
    },
    {
        name: 'Colors and vectors',
        code: `// Colors can be '#rrggbb' strings or numbers; vectors are {x, y, z, w} objects
// (three.js Color and Vector objects work as well).
const material = {
  color: '#d4af37',
  emissive: 0x1a0d00,
  roughness: 0.3,
  metalness: 1,
  offset: {x: 0, y: 0},
  scale: {x: 1, y: 1, z: 1},
}

return {
  type: 'folder',
  label: 'Material',
  expanded: true,
  children: [
    {type: 'color', label: 'Color', property: [material, 'color']},
    {type: 'color', label: 'Emissive', property: [material, 'emissive']},
    {type: 'slider', label: 'Roughness', bounds: [0, 1], stepSize: 0.01, property: [material, 'roughness']},
    {type: 'slider', label: 'Metalness', bounds: [0, 1], stepSize: 0.01, property: [material, 'metalness']},
    {type: 'vec2', label: 'UV offset', property: [material, 'offset']},
    {type: 'vec3', label: 'Scale', property: [material, 'scale']},
    {type: 'button', label: 'Log material', onClick: () => log(material)},
  ],
}
`,
    },
    {
        name: 'Generated from data',
        code: `// Configs are plain objects, so code can build them: one slider for each key
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
`,
    },
]
