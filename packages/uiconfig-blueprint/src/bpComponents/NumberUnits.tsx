export interface NumberUnit{
    name: string;
    symbol: string;
    from: (value: number) => number;
    to: (value: number) => number;
}
export const NumberUnits: Record<string, Record<string, NumberUnit>> = {
    'distance': {
        'm': {
            'name': 'Meters',
            'symbol': 'm',
            from: (v: number) => v,
            to: (v: number) => v,
        },
        'cm': {
            'name': 'Centimeters',
            'symbol': 'cm',
            from: (v: number) => v / 100,
            to: (v: number) => v * 100,
        },
        'mm': {
            'name': 'Millimeters',
            'symbol': 'mm',
            from: (v: number) => v / 1000,
            to: (v: number) => v * 1000,
        },
        'in': {
            'name': 'Inches',
            'symbol': 'in',
            from: (v: number) => v * 0.0254,
            to: (v: number) => v / 0.0254,
        },
        'ft': {
            'name': 'Feet',
            'symbol': 'ft',
            from: (v: number) => v * 0.3048,
            to: (v: number) => v / 0.3048,
        },
        'km': {
            'name': 'Kilometers',
            'symbol': 'km',
            from: (v: number) => v * 1000,
            to: (v: number) => v / 1000,
        },
        'mi': {
            'name': 'Miles',
            'symbol': 'mi',
            from: (v: number) => v * 1609.34,
            to: (v: number) => v / 1609.34,
        },
    },
    'angle': {
        'rad': {
            'name': 'Radians',
            'symbol': 'rad',
            from: (v: number) => v,
            to: (v: number) => v,
        },
        'deg': {
            'name': 'Degrees',
            'symbol': 'deg',
            from: (v: number) => v * Math.PI / 180,
            to: (v: number) => v * 180 / Math.PI,
        },
        'grad': {
            'name': 'Gradians',
            'symbol': 'grad',
            from: (v: number) => v * Math.PI / 200,
            to: (v: number) => v * 200 / Math.PI,
        },
    },
    'temperature': {
        'celsius': {
            'name': 'Celsius',
            'symbol': '°C',
            from: (v: number) => v,
            to: (v: number) => v,
        },
        'fahrenheit': {
            'name': 'Fahrenheit',
            'symbol': '°F',
            from: (v: number) => (v - 32) * 5 / 9,
            to: (v: number) => v * 9 / 5 + 32,
        },
        'kelvin': {
            'name': 'Kelvin',
            'symbol': 'K',
            from: (v: number) => v - 273.15,
            to: (v: number) => v + 273.15,
        },
    },
    'pixel': {
        'px': {
            'name': 'Pixels',
            'symbol': 'px',
            from: (v: number) => v,
            to: (v: number) => v,
        },
        'dp': {
            'name': 'Density-independent Pixels',
            'symbol': 'dp',
            from: (v: number) => v * window.devicePixelRatio,
            to: (v: number) => v / window.devicePixelRatio,
        },
        // todo
        // 'sp': {
        //     'name': 'Scale-independent Pixels',
        //     'symbol': 'sp',
        //     from: (v: number) => {
        //         const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
        //         return v * fontSize * window.devicePixelRatio;
        //     }
        // },
        // 'rem': {
        //     'name': 'Root em',
        //     'symbol': 'rem',
        //     from: (v: number) => {
        //         const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) / 16;
        //         return v * fontSize * window.devicePixelRatio;
        //     }
        // }
    }
}
