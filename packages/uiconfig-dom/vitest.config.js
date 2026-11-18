import {defineConfig} from 'vitest/config'

// the unit tests (Node, with a small fake DOM in the test); separate from vite.config.js, which is the library build
export default defineConfig({
    test: {
        include: ['tests/**/*.test.ts'],
    },
})
