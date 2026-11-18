import {defineConfig} from 'vitest/config'

// the unit tests (Node, no DOM); separate from vite.config.js, which is the library build
export default defineConfig({
    test: {
        include: ['tests/**/*.test.ts'],
    },
})
