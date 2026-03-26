import { expect } from '@esm-bundle/chai'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { clickElement, renderAppAt, setTextValue, textContent, waitFor } from '../support/test-harness.tsx'

const numericalQuestion = {
    question: 'How many regions does Czechia have?',
    correctAnswer: '14',
} as const

const cases = [
    { answer: '48', feedback: 'Incorrect!' },
    { answer: '14', feedback: 'Correct!' },
] as const

const installNumericalQuestionMockApi = () => {
    const routes: readonly Route[] = [
        {
            method: 'GET',
            match: /^\/api\/test-numerical-question$/,
            handle: () => ({
                body: numericalQuestion,
            }),
        },
    ]

    return installApiMock(routes)
}

describe('Question.Take.Feedback.Numerical feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    for (const testCase of cases) {
        it(`shows ${testCase.feedback} for numerical answer ${testCase.answer}`, async () => {
            restoreFetch = installNumericalQuestionMockApi()
            ;({ cleanup } = await renderAppAt('/test-numerical-question'))

            await waitFor(() => textContent('[data-testid="question-title"]') === numericalQuestion.question)
            await waitFor(() => document.querySelector('input[type="number"]') !== null)

            await setTextValue('input[type="number"]', testCase.answer)
            await clickElement('#submit-answer')

            await waitFor(() => textContent('.question-feedback') === testCase.feedback)

            expect(textContent('.question-feedback')).to.equal(testCase.feedback)
        })
    }
})
