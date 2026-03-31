import { expect } from '@esm-bundle/chai'

import { nextFrame, renderAppAt, waitForElement } from '../support/test-harness.tsx'

describe('Home page (WTR routed browser proof)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    it('shows links to create a question and a workspace from the routed app', async () => {
        ;({ cleanup } = await renderAppAt('/'))

        const createQuestionLink = await waitForElement<HTMLAnchorElement>('a[href="/question/new"]')
        const createWorkspaceLink = await waitForElement<HTMLAnchorElement>('a[href="/workspace/new"]')

        expect(createQuestionLink.textContent).to.contain('Create new question')
        expect(createWorkspaceLink.textContent).to.contain('Create new workspace')
    })

    it('changes cube rotation on three clicks from the routed app', async () => {
        ;({ cleanup } = await renderAppAt('/'))

        const rotateButton = await waitForElement<HTMLButtonElement>('button[aria-label="Rotate cube"]')
        const cube = await waitForElement<HTMLElement>('[data-testid="home-cube"]')

        const transforms = new Set<string>()
        let previousTransform = cube.style.transform
        transforms.add(previousTransform)

        for (let i = 0; i < 3; i += 1) {
            rotateButton.click()
            await nextFrame()

            const nextTransform = cube.style.transform
            expect(nextTransform).not.to.equal(previousTransform)
            transforms.add(nextTransform)
            previousTransform = nextTransform
        }

        expect(transforms.size).to.equal(4)
    })
})
