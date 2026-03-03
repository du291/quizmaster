import { expect } from '@esm-bundle/chai'
import { clickElement, renderAppAt, setTextValue, textContent, waitFor } from '../support/test-harness.tsx'

describe('Workspace.Create feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    it('creates workspace and shows workspace page', async () => {
        const title = `WTR workspace ${Date.now()}`
        ;({ cleanup } = await renderAppAt('/workspace/new'))

        await setTextValue('#workspace-title', title)
        await clickElement('button[type="submit"]')

        await waitFor(() => window.location.pathname.startsWith('/workspace/'))
        await waitFor(() => textContent('[data-testid="workspace-title"]') === title)

        expect(window.location.pathname).to.match(/^\/workspace\/[0-9a-f-]+$/)
    })
})
