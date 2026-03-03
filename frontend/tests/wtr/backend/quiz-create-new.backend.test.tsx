import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { clickElement, renderAppAt, setTextValue, textContent, waitFor } from '../support/test-harness.tsx'

const selectQuestionByLabel = async (questionText: string) => {
    await waitFor(() =>
        Array.from(document.querySelectorAll<HTMLLabelElement>('.question-select label')).some(
            label => label.textContent?.trim() === questionText,
        ),
    )

    const label = Array.from(document.querySelectorAll<HTMLLabelElement>('.question-select label')).find(
        item => item.textContent?.trim() === questionText,
    )
    if (!label) throw new Error(`Question label not found: ${questionText}`)
    label.click()
}

describe('Quiz.CreateNew feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    it('creates quiz from workspace questions and reaches welcome page', async () => {
        const suffix = `${Date.now()}`
        const workspaceGuid = await createWorkspaceInBackend(`WTR workspace ${suffix}`)
        const questionA = `WTR A ${suffix}`
        const questionB = `WTR B ${suffix}`

        await createQuestionInBackend(workspaceGuid, questionA, ['A1', 'A2'])
        await createQuestionInBackend(workspaceGuid, questionB, ['B1', 'B2'])

        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await clickElement('#create-quiz')
        await waitFor(() => window.location.pathname === '/quiz-create/new')

        const quizTitle = `WTR Quiz ${suffix}`
        await setTextValue('#quiz-title', quizTitle)
        await setTextValue('#quiz-description', 'Backend smoke quiz')

        await selectQuestionByLabel(questionA)
        await selectQuestionByLabel(questionB)
        await clickElement('button[type="submit"]')

        await waitFor(() => window.location.pathname === `/workspace/${workspaceGuid}`)
        await waitFor(() =>
            Array.from(document.querySelectorAll<HTMLElement>('.quiz-item')).some(item =>
                item.textContent?.includes(quizTitle),
            ),
        )

        const quizItem = Array.from(document.querySelectorAll<HTMLElement>('.quiz-item')).find(item =>
            item.textContent?.includes(quizTitle),
        )
        const takeButton = quizItem?.querySelector<HTMLButtonElement>('button.take-quiz')
        if (!takeButton) throw new Error('Take button not found for created quiz')
        takeButton.click()

        await waitFor(() => /^\/quiz\/\d+$/.test(window.location.pathname))
        await waitFor(() => textContent('#quiz-name') === quizTitle)

        expect(textContent('#quiz-description')).to.equal('Backend smoke quiz')
    })
})
