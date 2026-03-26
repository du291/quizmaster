import { expect } from '@esm-bundle/chai'
import { buildQuestion } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { flushFrames, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const europeQuestion = buildQuestion({
    id: 703,
    question: 'Which country is in Europe?',
    answers: ['Italy', 'Mexico', 'Morocco', 'USA', 'Canada'],
    correctAnswers: [0],
})

const cases = [
    { key: 1, answer: 'Italy', feedback: 'Correct!' },
    { key: 2, answer: 'Mexico', feedback: 'Incorrect!' },
    { key: 3, answer: 'Morocco', feedback: 'Incorrect!' },
    { key: 4, answer: 'USA', feedback: 'Incorrect!' },
    { key: 5, answer: 'Canada', feedback: 'Incorrect!' },
] as const

const installQuestionNumPadMockApi = () => {
    const routes: readonly Route[] = [
        {
            method: 'GET',
            match: /^\/api\/question\/\d+$/,
            handle: request => {
                const questionId = Number.parseInt(request.path.split('/').pop() ?? '0')
                if (questionId !== europeQuestion.id) throw new Error(`Question not found: ${questionId}`)
                return { body: europeQuestion }
            },
        },
    ]

    return installApiMock(routes)
}

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

describe('Question.Take.NumPad feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    for (const testCase of cases) {
        it(`selects ${testCase.answer} and shows ${testCase.feedback} for Numpad${testCase.key}`, async () => {
            restoreFetch = installQuestionNumPadMockApi()
            ;({ cleanup } = await renderAppAt(`/question/${europeQuestion.id}`))

            await waitFor(() => textContent('#question') === europeQuestion.question)

            await pressNumpadKey(testCase.key)

            await waitFor(() => checkedAnswer() === testCase.answer)
            await waitFor(() => textContent('.question-feedback') === testCase.feedback)

            expect(checkedAnswer()).to.equal(testCase.answer)
            expect(textContent('.question-feedback')).to.equal(testCase.feedback)
        })
    }
})
