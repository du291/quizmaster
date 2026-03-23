import { existsSync } from 'node:fs'
import http from 'node:http'
import https from 'node:https'

import { createServer, mergeConfig } from 'vite'

const callWithFileNames = callback => ({
    name: 'file-name',
    transform(src, id) {
        callback(id)
    },
})

const markExternal = options => ({
    name: 'mark-external',
    resolveId(path) {
        if (!options.includes(path)) return

        return {
            id: path,
            external: true,
        }
    },
})

const get = (url, headers) =>
    new Promise((resolve, reject) => {
        const getByProtocol = url.startsWith('https') ? https.get : http.get
        const request = getByProtocol(url, { headers }, response => {
            const buffers = []
            let bufferLen = 0

            response.on('data', chunk => {
                bufferLen += chunk.length
                buffers.push(chunk)
            })

            response.on('end', () =>
                resolve({
                    body: Buffer.concat(buffers, bufferLen),
                    headers: response.headers,
                    status: response.statusCode,
                })
            )
        })

        request.on('error', err => reject(err))
    })

const proxy = url => async ctx => {
    const { body, headers, status } = await get(url + ctx.originalUrl, ctx.headers)
    ctx.set(headers)
    ctx.body = body
    ctx.status = status
}

const formatHostForUrl = host => (host.includes(':') && !host.startsWith('[') ? `[${host}]` : host)

const resolveProxyHost = config => {
    const configuredHost = config.server?.host
    return typeof configuredHost === 'string' && configuredHost.length > 0 ? configuredHost : '127.0.0.1'
}

// Mirror the upstream plugin, but keep the proxy target on the same explicit host
// that Vite binds to so backend WTR does not bounce between IPv4 and IPv6 localhost.
export const hostAwareVitePlugin = (config = {}) => {
    let viteServer

    return {
        name: 'host-aware-vite-plugin',

        async serverStart({ app, fileWatcher }) {
            const plugins = [
                callWithFileNames(id => {
                    const file = id.split('?')[0]
                    if (!file.startsWith('\0') && existsSync(file)) {
                        fileWatcher.add(id)
                    }
                }),
                markExternal(['/__web-dev-server__web-socket.js']),
            ]

            const proxyHost = resolveProxyHost(config)
            viteServer = await createServer(
                mergeConfig(config, {
                    clearScreen: false,
                    plugins,
                    server: {
                        hmr: false,
                        host: proxyHost,
                    },
                })
            )
            await viteServer.listen()

            const vitePort = viteServer.config.server.port
            const viteProtocol = viteServer.config.server.https ? 'https' : 'http'
            const proxyOrigin = `${viteProtocol}://${formatHostForUrl(proxyHost)}:${vitePort}`

            app.use(proxy(proxyOrigin))
        },

        async serverStop() {
            return viteServer.close()
        },
    }
}
