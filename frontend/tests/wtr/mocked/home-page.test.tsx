import { expect } from '@esm-bundle/chai'
import { createRoot, type Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'

import { HomePage } from '../../../src/pages/make/home.tsx'

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

const getRequiredElement = async <T extends Element>(selector: string, timeoutMs = 1000): Promise<T> => {
    const start = performance.now()

    while (performance.now() - start < timeoutMs) {
        const element = document.querySelector<T>(selector)
        if (element) return element
        await nextFrame()
    }

    throw new Error(`Element not found: ${selector}`)
}

describe('Home page', () => {
    let host: HTMLDivElement | null = null
    let root: Root | null = null

    const renderHomePage = async () => {
        host = document.createElement('div')
        document.body.append(host)
        root = createRoot(host)
        root.render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>,
        )
        await nextFrame()
    }

    afterEach(async () => {
        root?.unmount()
        host?.remove()
        root = null
        host = null
        await nextFrame()
    })

    it('shows links to create a question and a workspace', async () => {
        await renderHomePage()

        const createQuestionLink = await getRequiredElement<HTMLAnchorElement>('a[href="/question/new"]')
        const createWorkspaceLink = await getRequiredElement<HTMLAnchorElement>('a[href="/workspace/new"]')

        expect(createQuestionLink.textContent).to.contain('Create new question')
        expect(createWorkspaceLink.textContent).to.contain('Create new workspace')
    })

    it('changes cube rotation on three clicks', async () => {
        await renderHomePage()

        const rotateButton = await getRequiredElement<HTMLButtonElement>('button[aria-label="Rotate cube"]')
        const cube = await getRequiredElement<HTMLElement>('[data-testid="home-cube"]')

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
