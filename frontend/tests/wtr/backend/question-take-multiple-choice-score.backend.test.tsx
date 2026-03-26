import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const answers = ['Mars', 'Pluto', 'Titan', 'Venus', 'Earth'] as const

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

const answerQuestion = async (selectedAnswers: readonly string[]) => {
    for (const answer of selectedAnswers) {
        await selectAnswer(answer)
    }

    await submitQuestion()
}

const preparePartialScoreQuestion = async () => {
    const suffix = `${Date.now()}-question-score`
    const workspaceGuid = await createWorkspaceInBackend(`WTR Question Score Workspace ${suffix}`)
    const questionText = `Which of the following are planets? (Partial Score) ${suffix}`
    const question = await createQuestionInBackend(workspaceGuid, questionText, answers, { correctAnswers: [0, 3, 4] })

    return { questionId: question.id, questionText }
}

describe('Question.Take.MultipleChoice.Score feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    for (const testCase of cases) {
        it(`shows ${testCase.feedback} and score ${testCase.score} for ${testCase.answers.join(', ')}`, async () => {
            const prepared = await preparePartialScoreQuestion()
            ;({ cleanup } = await renderAppAt(`/question/${prepared.questionId}`))

            await waitFor(() => textContent('#question') === prepared.questionText)
            await answerQuestion(testCase.answers)

            await waitFor(() => textContent('.question-feedback') === testCase.feedback)
            await waitFor(() => textContent('.question-score') === `Score: ${testCase.score}`)

            expect(textContent('.question-feedback')).to.equal(testCase.feedback)
            expect(textContent('.question-score')).to.equal(`Score: ${testCase.score}`)
        })
    }
})
