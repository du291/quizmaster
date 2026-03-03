import { expect } from '@esm-bundle/chai'
import type { Quiz } from '../../../src/model/quiz.ts'
import { buildQuiz, questionListItems, toQuizListItems, workspace, workspaceGuid } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { clickElement, renderAppAt, setTextValue, textContent, waitFor, waitForElement } from '../support/test-harness.tsx'

const selectQuestionByLabel = async (questionText: string) => {
    await waitFor(() =>
        Array.from(document.querySelectorAll<HTMLLabelElement>('.question-select label')).some(
            label => label.textContent?.trim() === questionText,
        ),
    )
    const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('.question-select label'))
    const label = labels.find(item => item.textContent?.trim() === questionText)
    if (!label) throw new Error(`Question label not found: ${questionText}`)
    label.click()
}

const clickTakeQuizByTitle = async (title: string) => {
    await waitFor(() =>
        Array.from(document.querySelectorAll<HTMLElement>('.quiz-item')).some(item => item.textContent?.includes(title)),
    )

    const target = Array.from(document.querySelectorAll<HTMLElement>('.quiz-item')).find(item =>
        item.textContent?.includes(title),
    )
    if (!target) throw new Error(`Quiz item not found: ${title}`)

    const takeButton = target.querySelector<HTMLButtonElement>('button.take-quiz')
    if (!takeButton) throw new Error(`Take quiz button not found for ${title}`)
    takeButton.click()
}

const installQuizCreateMockApi = () => {
    let nextQuizId = 9001
    const quizzesById = new Map<number, Quiz>()

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
            handle: () => ({ body: toQuizListItems(Array.from(quizzesById.values())) }),
        },
        {
            method: 'POST',
            match: /^\/api\/quiz$/,
            handle: request => {
                const payload = request.body as {
                    title: string
                    description: string
                    questionIds: number[]
                    finalCount?: number
                }
                const quizId = nextQuizId++
                const quiz = buildQuiz(quizId, payload.title, payload.description, payload.questionIds, payload.finalCount)
                quizzesById.set(quizId, quiz)
                return { body: String(quizId) }
            },
        },
        {
            method: 'GET',
            match: /^\/api\/quiz\/\d+$/,
            handle: request => {
                const quizId = Number.parseInt(request.path.split('/').pop() ?? '0')
                const quiz = quizzesById.get(quizId)
                if (!quiz) throw new Error(`Quiz not found: ${quizId}`)
                return { body: quiz }
            },
        },
    ]

    return installApiMock(routes)
}

describe('Quiz.CreateNew feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    it('creates quiz, shows it in workspace and can take it', async () => {
        restoreFetch = installQuizCreateMockApi()
        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await clickElement('#create-quiz')
        await waitFor(() => window.location.pathname === '/quiz-create/new')

        await setTextValue('#quiz-title', 'Math Quiz')
        await setTextValue('#quiz-description', 'Very hard math quiz')
        await selectQuestionByLabel('2 + 2 = ?')
        await selectQuestionByLabel('4 / 2 = ?')

        await clickElement('button[type="submit"]')

        await waitFor(() => window.location.pathname === `/workspace/${workspaceGuid}`)
        await waitFor(() =>
            Array.from(document.querySelectorAll<HTMLElement>('.quiz-item')).some(item =>
                item.textContent?.includes('Math Quiz'),
            ),
        )

        await clickTakeQuizByTitle('Math Quiz')
        await waitFor(() => window.location.pathname === '/quiz/9001')
        await waitFor(() => textContent('#quiz-name') === 'Math Quiz')
    })

    it('creates randomized quiz and shows expected welcome page details', async () => {
        restoreFetch = installQuizCreateMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz-create/new?workspaceguid=${workspaceGuid}`))

        await setTextValue('#quiz-title', 'Math Quiz')
        await setTextValue('#quiz-description', 'Very hard math quiz')
        await selectQuestionByLabel('2 + 2 = ?')
        await selectQuestionByLabel('4 / 2 = ?')
        await selectQuestionByLabel('Jaký nábytek má Ikea?')
        await selectQuestionByLabel('Jaké nádobí má Ikea?')

        await waitFor(() => textContent('#selected-question-count-for-quiz') === '4')
        expect(textContent('#total-question-count-for-quiz')).to.equal('6')

        await clickElement('#isRandomized')
        await setTextValue('#quiz-finalCount', '3')
        await clickElement('button[type="submit"]')

        await waitFor(() => window.location.pathname === `/workspace/${workspaceGuid}`)
        await clickTakeQuizByTitle('Math Quiz')

        await waitFor(() => window.location.pathname === '/quiz/9001')
        await waitFor(() => textContent('#quiz-name') === 'Math Quiz')

        const description = await waitForElement<HTMLElement>('#quiz-description')
        const questionCount = await waitForElement<HTMLElement>('#question-count')

        expect(description.textContent?.trim()).to.equal('Very hard math quiz')
        expect(questionCount.textContent?.trim()).to.equal('3')
    })
})
