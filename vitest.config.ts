import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default defineConfig(({ mode }) =>
  mergeConfig(
    typeof viteConfig === 'function' ? viteConfig({ mode, command: 'serve' }) : viteConfig,
    defineConfig({
      test: {
        environment: 'happy-dom',
        exclude: [...configDefaults.exclude, 'e2e/*'],
        root: fileURLToPath(new URL('./', import.meta.url)),
        globals: true,
        setupFiles: ['./src/__tests__/setup.ts'],
        coverage: {
          provider: 'v8',
          reporter: ['text', 'json', 'html'],
          exclude: ['node_modules/', 'src/**/*.spec.ts', 'src/**/__tests__/', '*.config.*'],
        },
      },
    }),
  ),
)
