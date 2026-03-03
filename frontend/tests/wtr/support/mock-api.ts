type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

type RouteRequest = {
    readonly method: string
    readonly url: URL
    readonly path: string
    readonly body: Json | undefined
}

type RouteResponse = {
    readonly status?: number
    readonly body?: Json
}

type Route = {
    readonly method: string
    readonly match: RegExp
    readonly handle: (request: RouteRequest) => RouteResponse | Promise<RouteResponse>
}

const toJson = async (request: RequestInit): Promise<Json | undefined> => {
    const rawBody = request.body
    if (!rawBody || typeof rawBody !== 'string' || rawBody === '') return undefined
    return JSON.parse(rawBody) as Json
}

export const jsonResponse = (body: Json, status = 200): Response =>
    new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
        },
    })

export const installApiMock = (routes: readonly Route[]) => {
    const originalFetch = window.fetch.bind(window)

    window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
        const requestMethod = (init.method ?? 'GET').toUpperCase()
        const requestUrl = new URL(typeof input === 'string' ? input : input.toString(), window.location.origin)
        const path = requestUrl.pathname

        const route = routes.find(candidate => candidate.method === requestMethod && candidate.match.test(path))
        if (!route) {
            const availableRoutes = routes.map(candidate => `${candidate.method} ${candidate.match}`).join(', ')
            console.error(`[mock-api] No route for ${requestMethod} ${path}. Available: ${availableRoutes}`)
            return jsonResponse({ message: `No route for ${requestMethod} ${path}` }, 500)
        }

        const body = await toJson(init)
        let response: RouteResponse
        try {
            response = await Promise.resolve(
                route.handle({
                    method: requestMethod,
                    url: requestUrl,
                    path,
                    body,
                }),
            )
        } catch (error) {
            console.error(`[mock-api] Route handler failed for ${requestMethod} ${path}`, error)
            throw error
        }

        return jsonResponse(response.body ?? {}, response.status ?? 200)
    }

    return () => {
        window.fetch = originalFetch
    }
}

export type { Json, Route, RouteRequest, RouteResponse }
