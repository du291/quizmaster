import type { Quiz } from '../../../src/model/quiz.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { clickElement, renderAppAt, textContent, waitFor, waitForElement } from '../support/test-harness.tsx'

const question = (id: number, title: string) => ({
    id,
    editId: `edit-${id}`,
    question: title,
    answers: ['Correct', 'Wrong'],
    explanations: ['', ''],
    correctAnswers: [0],
    questionExplanation: '',
    workspaceGuid: null,
    easyMode: false,
})

const quizzesById = new Map<number, Quiz>([
    [
        3001,
        {
            id: 3001,
            title: 'Exam',
            description: 'Exam mode quiz',
            mode: 'exam',
            difficulty: 'keep-question',
            passScore: 85,
            timeLimit: 120,
            questions: [question(1, 'Exam Question 1'), question(2, 'Exam Question 2'), question(3, 'Exam Question 3')],
        },
    ],
    [
        3002,
        {
            id: 3002,
            title: 'Learn',
            description: 'Learn mode quiz',
            mode: 'learn',
            difficulty: 'keep-question',
            passScore: 85,
            timeLimit: 120,
            questions: [
                question(11, 'Learn Question 1'),
                question(12, 'Learn Question 2'),
                question(13, 'Learn Question 3'),
            ],
        },
    ],
])

const installQuizProgressMockApi = () => {
    const routes: readonly Route[] = [
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

const expectProgress = async (current: number, total: number) => {
    await waitFor(() => {
        const progressBar = document.querySelector<HTMLProgressElement>('#progress-bar')
        if (!progressBar) return false
        const currentValue = Number.parseInt(progressBar.getAttribute('value') ?? '0')
        const totalValue = Number.parseInt(progressBar.getAttribute('max') ?? '0')
        return currentValue === current && totalValue === total
    })
}

const answerQuestion = async (answer = 'Correct') => {
    await waitFor(() =>
        Array.from(document.querySelectorAll<HTMLLabelElement>('[id^="answer-label-"]')).some(
            label => label.textContent?.trim() === answer,
        ),
    )
    const label = Array.from(document.querySelectorAll<HTMLLabelElement>('[id^="answer-label-"]')).find(
        item => item.textContent?.trim() === answer,
    )
    if (!label) throw new Error(`Answer label not found: ${answer}`)
    const answerId = label.htmlFor
    if (!answerId) throw new Error(`Missing answer input id for: ${answer}`)
    await clickElement(`input#${answerId}`)
    await waitFor(() => document.querySelector<HTMLInputElement>(`input#${answerId}`)?.checked ?? false)
    await clickElement('input.submit-btn')
}

describe('Quiz.Progress feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        sessionStorage.clear()
        await cleanup()
    })

    it('exam mode advances progress immediately after each answer', async () => {
        restoreFetch = installQuizProgressMockApi()
        ;({ cleanup } = await renderAppAt('/quiz/3001'))

        await clickElement('#start')
        await waitFor(() => window.location.pathname === '/quiz/3001/questions')
        await waitFor(() => textContent('#question') === 'Exam Question 1')
        await expectProgress(1, 3)

        await answerQuestion()
        await waitFor(() => textContent('#question') === 'Exam Question 2')
        await expectProgress(2, 3)

        await answerQuestion()
        await waitFor(() => textContent('#question') === 'Exam Question 3')
        await expectProgress(3, 3)
    })

    it('learn mode advances progress only after navigating next question', async () => {
        restoreFetch = installQuizProgressMockApi()
        ;({ cleanup } = await renderAppAt('/quiz/3002'))

        await clickElement('#start')
        await waitFor(() => window.location.pathname === '/quiz/3002/questions')
        await waitFor(() => textContent('#question') === 'Learn Question 1')
        await expectProgress(1, 3)

        await answerQuestion()
        await waitFor(() => textContent('#question') === 'Learn Question 1')
        await expectProgress(1, 3)

        await clickElement('#next')
        await waitFor(() => textContent('#question') === 'Learn Question 2')
        await expectProgress(2, 3)
    })
})
