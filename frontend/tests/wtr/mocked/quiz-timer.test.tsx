import { expect } from '@esm-bundle/chai'
import type { Question } from '../../../src/model/question.ts'
import type { Quiz } from '../../../src/model/quiz.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const question = (
    id: number,
    title: string,
    answers: readonly string[],
    correctAnswers: readonly number[],
): Question => ({
    id,
    editId: `edit-${id}`,
    question: title,
    answers: [...answers],
    explanations: answers.map(() => ''),
    correctAnswers: [...correctAnswers],
    questionExplanation: '',
    workspaceGuid: null,
    easyMode: false,
})

const quizA: Quiz = {
    id: 3301,
    title: 'Quiz A',
    description: 'Description A',
    mode: 'exam',
    difficulty: 'keep-question',
    passScore: 85,
    timeLimit: 2,
    questions: [
        question(1, 'Which planet is known as the Red Planet?', ['Mars', 'Venus'], [0]),
        question(2, "What's the capital city of Australia?", ['Sydney', 'Canberra'], [1]),
    ],
}

const quizB: Quiz = {
    id: 3302,
    title: 'Quiz B',
    description: 'Description B',
    mode: 'exam',
    difficulty: 'keep-question',
    passScore: 85,
    timeLimit: 1,
    questions: [
        question(11, 'Which planet is known as the Red Planet?', ['Mars', 'Venus'], [0]),
        question(12, "What's the capital city of Australia?", ['Sydney', 'Canberra'], [1]),
    ],
}

const quizzesById = new Map<number, Quiz>([
    [quizA.id, quizA],
    [quizB.id, quizB],
])

const installTimerMockApi = () => {
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

const timerText = () => document.querySelector<HTMLElement>('[data-testid="timerID"]')?.textContent?.trim() ?? ''

const waitForTimeoutDialog = async () => {
    await waitFor(() => document.querySelector('dialog p')?.textContent?.includes('Game over time') ?? false, 6000)
}

const answerCurrentQuestion = async (answer: string) => {
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
    if (!answerId) throw new Error(`Missing answer input id for ${answer}`)
    await clickElement(`input#${answerId}`)
    await clickElement('input.submit-btn')
}

const startQuiz = async (quizId: number) => {
    await clickElement('#start')
    await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)
}

describe('Quiz.Timer feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        sessionStorage.clear()
        await cleanup()
    })

    it('displays countdown timer for configured short limits', async () => {
        restoreFetch = installTimerMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${quizA.id}`))

        await startQuiz(quizA.id)
        await waitFor(() => timerText() === '00:02')

        await cleanup()
        ;({ cleanup } = await renderAppAt(`/quiz/${quizB.id}`))
        await startQuiz(quizB.id)
        await waitFor(() => timerText() === '00:01')
    })

    it('shows result table with 0 score when timeout happens before any answer', async () => {
        restoreFetch = installTimerMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${quizA.id}`))

        await startQuiz(quizA.id)
        await waitForTimeoutDialog()
        await clickElement('dialog #evaluate')
        await waitFor(() => document.querySelector('#results') !== null, 5000)

        expect(textContent('#correct-answers')).to.equal('0')
        expect(textContent('#total-questions')).to.equal('2')
        expect(textContent('#percentage-result')).to.equal('0')
        expect(textContent('#text-result')).to.equal('failed')
    })

    it('shows score 1/2 when one correct answer was submitted before timeout', async () => {
        restoreFetch = installTimerMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${quizA.id}`))

        await startQuiz(quizA.id)
        await answerCurrentQuestion('Mars')

        await waitFor(() => textContent('#question').includes("capital city of Australia"))
        await waitForTimeoutDialog()
        await clickElement('dialog #evaluate')
        await waitFor(() => document.querySelector('#results') !== null, 5000)

        expect(textContent('#correct-answers')).to.equal('1')
        expect(textContent('#total-questions')).to.equal('2')
        expect(textContent('#percentage-result')).to.equal('50')
        expect(textContent('#text-result')).to.equal('failed')
    })
})
