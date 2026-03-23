import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const imageUrlFragment = 'photo-1529778873920-4da4926a72c2'

const questionImage = () => document.querySelector<HTMLImageElement>('img.question-image')

describe('Question.Take.Image feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    it('shows the configured cat image when the question text contains the cat marker', async () => {
        const suffix = `${Date.now()}`
        const workspaceGuid = await createWorkspaceInBackend(`WTR Question Image Workspace ${suffix}`)
        const questionText = `Which animal is on the picture? 😺 ${suffix}`
        const question = await createQuestionInBackend(workspaceGuid, questionText, ['Cat', 'Dog', 'Mouse', 'Swan'])
        ;({ cleanup } = await renderAppAt(`/question/${question.id}`))

        await waitFor(() => textContent('#question') === questionText)
        await waitFor(() => questionImage()?.src.includes(imageUrlFragment) ?? false)

        expect(questionImage()?.src).to.contain(imageUrlFragment)
    })

    it('does not show the cat image when the question text does not contain the cat marker', async () => {
        const suffix = `${Date.now()}`
        const workspaceGuid = await createWorkspaceInBackend(`WTR Question Image Workspace ${suffix}`)
        const questionText = `Which animal is on the picture? ${suffix}`
        const question = await createQuestionInBackend(workspaceGuid, questionText, ['Cat', 'Dog', 'Mouse', 'Swan'])
        ;({ cleanup } = await renderAppAt(`/question/${question.id}`))

        await waitFor(() => textContent('#question') === questionText)
        await waitFor(() => questionImage() === null)

        expect(questionImage()).to.equal(null)
    })
})
