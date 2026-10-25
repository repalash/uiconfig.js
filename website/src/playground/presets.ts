// Starting points for the playground: the bodies of the functions in presets/, as text (see vite.config.js).
// Each gets `log` and returns a config.
import person from './presets/person.js?sample'
import hiddenDisabled from './presets/hidden-disabled.js?sample'
import colorsVectors from './presets/colors-vectors.js?sample'
import generated from './presets/generated.js?sample'

export const presets: {name: string, code: string}[] = [
    {name: 'Person', code: person},
    {name: 'Hidden and disabled', code: hiddenDisabled},
    {name: 'Colors and vectors', code: colorsVectors},
    {name: 'Generated from data', code: generated},
]
