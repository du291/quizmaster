import { removeViteLogging, vitePlugin } from '@remcovaes/web-test-runner-vite-plugin'
import { playwrightLauncher } from '@web/test-runner-playwright'

export default {
    files: ['tests/wtr/**/*.test.tsx'],
    concurrentBrowsers: 2,
    concurrency: 2,
    plugins: [
        vitePlugin(),
    ],
    browsers: [
        playwrightLauncher({
            product: 'chromium',
            launchOptions: { headless: true },
        }),
        playwrightLauncher({
            product: 'firefox',
            launchOptions: { headless: true },
        }),
    ],
    testFramework: {
        config: {
            timeout: 10000,
        },
    },
    filterBrowserLogs: removeViteLogging,
}
