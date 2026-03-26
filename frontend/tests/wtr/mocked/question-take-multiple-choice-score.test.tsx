import { expect } from '@esm-bundle/chai'
import { buildQuestion } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const partialScoreQuestion = buildQuestion({
    id: 703,
    question: 'Which of the following are planets? (Partial Score)',
    answers: ['Mars', 'Pluto', 'Titan', 'Venus', 'Earth'],
    correctAnswers: [0, 3, 4],
})

const cases = [
    { answers: ['Mars', 'Venus', 'Earth'], feedback: 'Correct!', score: '1' },
    { answers: ['Mars', 'Venus', 'Titan', 'Earth'], feedback: 'Partially correct! (1 error)', score: '0.5' },
    { answers: ['Mars', 'Venus'], feedback: 'Partially correct! (1 error)', score: '0.5' },
    { answers: ['Mars', 'Pluto'], feedback: 'Incorrect!', score: '0' },
    { answers: ['Mars', 'Pluto', 'Venus', 'Titan'], feedback: 'Incorrect!', score: '0' },
    { answers: ['Pluto', 'Titan'], feedback: 'Incorrect!', score: '0' },
] as const

const questionLabels = () =>
    Array.from(document.querySelectorAll<HTMLLabelElement>('#question-form [id^="answer-label-"]'))

const findAnswerLabel = (answer: string) => questionLabels().find(label => label.textContent?.trim() === answer)

const selectAnswer = async (answer: string) => {
    const label = findAnswerLabel(answer)
    if (!label) throw new Error(`Answer label not found for ${answer}`)

    await clickElement(`input#${label.htmlFor}`)
    await waitFor(() => document.querySelector<HTMLInputElement>(`#question-form input#${label.htmlFor}`)?.checked ?? false)
}

const submitQuestion = async () => {
    await waitFor(() => {
        const submitButton = document.querySelector<HTMLInputElement>('input.submit-btn')
        return submitButton !== null && !submitButton.disabled
    })

    await clickElement('input.submit-btn')
}

const answerQuestion = async (answers: readonly string[]) => {
    for (const answer of answers) {
        await selectAnswer(answer)
    }

    await submitQuestion()
}

const installQuestionScoreMockApi = () => {
    const routes: readonly Route[] = [
        {
            method: 'GET',
            match: /^\/api\/question\/\d+$/,
            handle: request => {
                const questionId = Number.parseInt(request.path.split('/').pop() ?? '0')
                if (questionId !== partialScoreQuestion.id) throw new Error(`Question not found: ${questionId}`)
                return { body: partialScoreQuestion }
            },
        },
    ]

    return installApiMock(routes)
}

describe('Question.Take.MultipleChoice.Score feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    for (const testCase of cases) {
        it(`shows ${testCase.feedback} and score ${testCase.score} for ${testCase.answers.join(', ')}`, async () => {
            restoreFetch = installQuestionScoreMockApi()
            ;({ cleanup } = await renderAppAt(`/question/${partialScoreQuestion.id}`))

            await waitFor(() => textContent('#question') === partialScoreQuestion.question)
            await answerQuestion(testCase.answers)

            await waitFor(() => textContent('.question-feedback') === testCase.feedback)
            await waitFor(() => textContent('.question-score') === `Score: ${testCase.score}`)

            expect(textContent('.question-feedback')).to.equal(testCase.feedback)
            expect(textContent('.question-score')).to.equal(`Score: ${testCase.score}`)
        })
    }
})
