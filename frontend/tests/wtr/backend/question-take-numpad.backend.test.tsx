import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { flushFrames, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const answers = ['Italy', 'Mexico', 'Morocco', 'USA', 'Canada'] as const

const cases = [
    { key: 1, answer: 'Italy', feedback: 'Correct!' },
    { key: 2, answer: 'Mexico', feedback: 'Incorrect!' },
    { key: 3, answer: 'Morocco', feedback: 'Incorrect!' },
    { key: 4, answer: 'USA', feedback: 'Incorrect!' },
    { key: 5, answer: 'Canada', feedback: 'Incorrect!' },
] as const

const checkedAnswer = () => document.querySelector<HTMLInputElement>('#question-form input[type="radio"]:checked')?.value ?? ''

const createNumpadKeyEvent = (key: number) => {
    const event = new KeyboardEvent('keydown', {
        key: String(key),
        bubbles: true,
        cancelable: true,
        location: 3,
    })

    Object.defineProperties(event, {
        code: {
            configurable: true,
            value: `Numpad${key}`,
        },
        keyCode: {
            configurable: true,
            value: 96 + key,
        },
        which: {
            configurable: true,
            value: 96 + key,
        },
    })

    return event
}

const pressNumpadKey = async (key: number) => {
    await flushFrames()
    window.dispatchEvent(createNumpadKeyEvent(key))
    await waitFor(() => checkedAnswer() !== '')
}

const prepareQuestion = async (suffix: string) => {
    const workspaceGuid = await createWorkspaceInBackend(`WTR Question NumPad Workspace ${suffix}`)
    const questionText = `Which country is in Europe? ${suffix}`
    const question = await createQuestionInBackend(workspaceGuid, questionText, answers, { correctAnswers: [0] })

    return { questionId: question.id, questionText }
}

describe('Question.Take.NumPad feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    for (const testCase of cases) {
        it(`selects ${testCase.answer} and shows ${testCase.feedback} for Numpad${testCase.key}`, async () => {
            const prepared = await prepareQuestion(`${Date.now()}-${testCase.key}`)
            ;({ cleanup } = await renderAppAt(`/question/${prepared.questionId}`))

            await waitFor(() => textContent('#question') === prepared.questionText)

            await pressNumpadKey(testCase.key)

            await waitFor(() => checkedAnswer() === testCase.answer)
            await waitFor(() => textContent('.question-feedback') === testCase.feedback)

            expect(checkedAnswer()).to.equal(testCase.answer)
            expect(textContent('.question-feedback')).to.equal(testCase.feedback)
        })
    }
})
