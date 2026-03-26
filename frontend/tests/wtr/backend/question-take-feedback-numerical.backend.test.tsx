import { expect } from '@esm-bundle/chai'
import { clickElement, renderAppAt, setTextValue, textContent, waitFor } from '../support/test-harness.tsx'

const numericalQuestion = {
    question: 'How many regions does Czechia have?',
} as const

const cases = [
    { answer: '48', feedback: 'Incorrect!' },
    { answer: '14', feedback: 'Correct!' },
] as const

describe('Question.Take.Feedback.Numerical feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    for (const testCase of cases) {
        it(`shows ${testCase.feedback} for numerical answer ${testCase.answer}`, async () => {
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
