import { expect } from '@esm-bundle/chai'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { clickElement, renderAppAt, setTextValue, textContent, waitFor } from '../support/test-harness.tsx'

describe('Workspace.Create feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    it('creates workspace and shows empty workspace page', async () => {
        const workspaceGuid = 'workspace-wtr-created-1'
        let title = ''

        const routes: readonly Route[] = [
            {
                method: 'POST',
                match: /^\/api\/workspaces$/,
                handle: request => {
                    title = String((request.body as { title?: string })?.title ?? '')
                    return { body: { guid: workspaceGuid } }
                },
            },
            {
                method: 'GET',
                match: /^\/api\/workspaces\/workspace-wtr-created-1$/,
                handle: () => ({ body: { guid: workspaceGuid, title } }),
            },
            {
                method: 'GET',
                match: /^\/api\/workspaces\/workspace-wtr-created-1\/questions$/,
                handle: () => ({ body: [] }),
            },
            {
                method: 'GET',
                match: /^\/api\/workspaces\/workspace-wtr-created-1\/quizzes$/,
                handle: () => ({ body: [] }),
            },
        ]

        restoreFetch = installApiMock(routes)
        ;({ cleanup } = await renderAppAt('/workspace/new'))

        await setTextValue('#workspace-title', 'My List')
        await clickElement('button[type="submit"]')

        await waitFor(() => window.location.pathname === `/workspace/${workspaceGuid}`)
        await waitFor(() => textContent('[data-testid="workspace-title"]') === 'My List')

        expect(document.querySelectorAll('.question-holder .question-item').length).to.equal(0)
    })
})
