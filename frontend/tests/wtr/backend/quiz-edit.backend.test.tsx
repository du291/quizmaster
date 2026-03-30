import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createQuizInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { waitForPathname } from '../support/question-form.ts'
import { clickElement, renderAppAt, setTextValue, textContent, waitFor } from '../support/test-harness.tsx'

const findQuizItemByTitle = async (title: string) => {
    await waitFor(() =>
        Array.from(document.querySelectorAll<HTMLElement>('.quiz-item')).some(item => item.textContent?.includes(title)),
    )

    const quizItem = Array.from(document.querySelectorAll<HTMLElement>('.quiz-item')).find(item =>
        item.textContent?.includes(title),
    )
    if (!quizItem) throw new Error(`Quiz item not found: ${title}`)
    return quizItem
}

const clickQuizButton = async (title: string, selector: string) => {
    const quizItem = await findQuizItemByTitle(title)
    const button = quizItem.querySelector<HTMLButtonElement>(selector)
    if (!button) throw new Error(`Button ${selector} not found for ${title}`)
    button.click()
}

const waitForQuizEditLoaded = async (expectedTitle: string, expectedDescription: string, expectedSelectedCount: string) => {
    await waitFor(() => {
        const titleInput = document.querySelector<HTMLInputElement>('#quiz-title')
        const descriptionInput = document.querySelector<HTMLTextAreaElement>('#quiz-description')

        return (
            titleInput?.value === expectedTitle &&
            descriptionInput?.value === expectedDescription &&
            textContent('#selected-question-count-for-quiz') === expectedSelectedCount
        )
    }, 5000)
}

describe('Quiz.Edit feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    it('edits quiz title and description from the workspace', async () => {
        const suffix = `${Date.now()}`
        const workspaceGuid = await createWorkspaceInBackend(`WTR quiz edit workspace ${suffix}`)
        const questionOne = await createQuestionInBackend(workspaceGuid, `WTR edit A ${suffix}`, ['A1', 'A2'])
        const questionTwo = await createQuestionInBackend(workspaceGuid, `WTR edit B ${suffix}`, ['B1', 'B2'])
        const questionThree = await createQuestionInBackend(workspaceGuid, `WTR edit C ${suffix}`, ['C1', 'C2'])

        const originalTitle = `Math Quiz ${suffix}`
        const originalDescription = `Standard mathematics questions ${suffix}`
        const quizId = await createQuizInBackend({
            workspaceGuid,
            questionIds: [questionOne.id, questionTwo.id, questionThree.id],
            title: originalTitle,
            description: originalDescription,
        })

        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await clickQuizButton(originalTitle, 'button.edit-quiz')
        await waitForPathname(`/quiz/${quizId}/edit`)
        await waitForQuizEditLoaded(originalTitle, originalDescription, '3')

        const quizTitleInput = document.querySelector<HTMLInputElement>('#quiz-title')
        const quizDescriptionInput = document.querySelector<HTMLTextAreaElement>('#quiz-description')
        expect(quizTitleInput?.value).to.equal(originalTitle)
        expect(quizDescriptionInput?.value).to.equal(originalDescription)

        const updatedTitle = `Advanced Math ${suffix}`
        const updatedDescription = `Challenging mathematics questions ${suffix}`
        await setTextValue('#quiz-title', updatedTitle)
        await setTextValue('#quiz-description', updatedDescription)
        await clickElement('button[type="submit"]')

        await waitForPathname(`/workspace/${workspaceGuid}`)
        await findQuizItemByTitle(updatedTitle)

        await clickQuizButton(updatedTitle, 'button.take-quiz')
        await waitForPathname(`/quiz/${quizId}`)
        await waitFor(() => textContent('#quiz-name') === updatedTitle)

        expect(textContent('#quiz-description')).to.equal(updatedDescription)
    })
})
