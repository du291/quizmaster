import { expect } from '@esm-bundle/chai'
import type { QuizCreateRequest } from '../../../src/api/quiz.ts'
import type { Quiz } from '../../../src/model/quiz.ts'
import { buildQuizFixture, questionListItems, toQuizListItems, workspace, workspaceGuid } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { waitForPathname } from '../support/question-form.ts'
import { clickElement, renderAppAt, setTextValue, textContent, waitFor } from '../support/test-harness.tsx'

const quizId = 301

const buildSavedQuiz = (): Quiz =>
    buildQuizFixture({
        id: quizId,
        title: 'Math Quiz',
        description: 'Standard mathematics questions',
        questionIds: [1, 2, 3],
    })

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

describe('Quiz.Edit feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}
    let savedQuiz = buildSavedQuiz()

    beforeEach(() => {
        savedQuiz = buildSavedQuiz()

        const routes: readonly Route[] = [
            {
                method: 'GET',
                match: new RegExp(`^/api/workspaces/${workspaceGuid}$`),
                handle: () => ({ body: workspace }),
            },
            {
                method: 'GET',
                match: new RegExp(`^/api/workspaces/${workspaceGuid}/questions$`),
                handle: () => ({ body: questionListItems }),
            },
            {
                method: 'GET',
                match: new RegExp(`^/api/workspaces/${workspaceGuid}/quizzes$`),
                handle: () => ({ body: toQuizListItems([savedQuiz]) }),
            },
            {
                method: 'GET',
                match: new RegExp(`^/api/quiz/${quizId}$`),
                handle: () => ({ body: savedQuiz }),
            },
            {
                method: 'PUT',
                match: new RegExp(`^/api/quiz/${quizId}$`),
                handle: request => {
                    const payload = request.body as QuizCreateRequest

                    savedQuiz = buildQuizFixture({
                        id: quizId,
                        title: payload.title,
                        description: payload.description,
                        questionIds: payload.questionIds,
                        mode: payload.mode,
                        difficulty: payload.difficulty ?? 'keep-question',
                        passScore: payload.passScore,
                        timeLimit: payload.timeLimit,
                        size: payload.finalCount && payload.finalCount > 0 ? payload.finalCount : undefined,
                    })

                    return { body: String(quizId) }
                },
            },
        ]

        restoreFetch = installApiMock(routes)
    })

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    it('edits quiz title and description from the workspace', async () => {
        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await clickQuizButton(savedQuiz.title, 'button.edit-quiz')
        await waitForPathname(`/quiz/${quizId}/edit`)
        await waitForQuizEditLoaded(savedQuiz.title, savedQuiz.description, '3')

        const quizTitleInput = document.querySelector<HTMLInputElement>('#quiz-title')
        const quizDescriptionInput = document.querySelector<HTMLTextAreaElement>('#quiz-description')
        expect(quizTitleInput?.value).to.equal('Math Quiz')
        expect(quizDescriptionInput?.value).to.equal('Standard mathematics questions')

        const updatedTitle = 'Advanced Math'
        const updatedDescription = 'Challenging mathematics questions'
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
