import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { removeViteLogging } from '@remcovaes/web-test-runner-vite-plugin'
import { playwrightLauncher } from '@web/test-runner-playwright'

import { hostAwareVitePlugin } from './tests/wtr/support/host-aware-vite-plugin.mjs'

const apiProxyTarget = process.env.WTR_API_PROXY_TARGET
const concurrentBrowsers = Number(process.env.WTR_CONCURRENT_BROWSERS || 2)
const concurrency = Number(process.env.WTR_CONCURRENCY || 2)
const testTimeout = Number(process.env.WTR_TEST_TIMEOUT || 10000)
const viteHost = process.env.WTR_VITE_HOST || '127.0.0.1'
const frontendRoot = dirname(fileURLToPath(import.meta.url))
const wtrCacheDir = join(frontendRoot, 'node_modules/.vite-wtr')

const copyHeaders = headers => {
    const forwarded = {}
    for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() === 'host') continue
        if (value === undefined) continue
        if (Array.isArray(value)) forwarded[key] = value.join(',')
        else forwarded[key] = value
    }
    return forwarded
}

const readRequestBody = async request => {
    const chunks = []
    for await (const chunk of request) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    if (chunks.length === 0) return undefined
    return Buffer.concat(chunks)
}

const apiProxyMiddleware =
    apiProxyTarget &&
    (async (context, next) => {
        if (!context.path.startsWith('/api/')) {
            await next()
            return
        }

        const targetUrl = new URL(context.url, apiProxyTarget).toString()
        const body = ['GET', 'HEAD'].includes(context.method) ? undefined : await readRequestBody(context.req)
        const response = await fetch(targetUrl, {
            method: context.method,
            headers: copyHeaders(context.headers),
            body,
        })

        context.status = response.status
        response.headers.forEach((value, key) => {
            if (key.toLowerCase() === 'transfer-encoding') return
            context.set(key, value)
        })

        const responseBody = await response.arrayBuffer()
        context.body = Buffer.from(responseBody)
    })

export default {
    files: ['tests/wtr/**/*.test.tsx'],
    concurrentBrowsers,
    concurrency,
    plugins: [
        hostAwareVitePlugin({
            root: frontendRoot,
            cacheDir: wtrCacheDir,
            server: {
                host: viteHost,
            },
        }),
    ],
    middleware: apiProxyMiddleware ? [apiProxyMiddleware] : [],
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
            timeout: testTimeout,
        },
    },
    filterBrowserLogs: removeViteLogging,
}
