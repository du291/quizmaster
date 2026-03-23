import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const singleChoiceCases = [
    { answer: 'Sydney', feedback: 'Incorrect!' },
    { answer: 'Canberra', feedback: 'Correct!' },
] as const

const multipleChoiceCases = [
    {
        answers: ['Mars', 'Venus'],
        feedback: 'Correct!',
        expectedClasses: {
            Mars: 'correctly-selected',
            Pluto: 'correctly-not-selected',
            Venus: 'correctly-selected',
            Titan: 'correctly-not-selected',
        },
    },
    {
        answers: ['Mars', 'Venus', 'Titan'],
        feedback: 'Incorrect!',
        expectedClasses: {
            Mars: 'correctly-selected',
            Pluto: 'correctly-not-selected',
            Venus: 'correctly-selected',
            Titan: 'incorrect',
        },
    },
    {
        answers: ['Mars', 'Pluto'],
        feedback: 'Incorrect!',
        expectedClasses: {
            Mars: 'correctly-selected',
            Pluto: 'incorrect',
            Venus: 'correctly-selected',
            Titan: 'correctly-not-selected',
        },
    },
    {
        answers: ['Mars', 'Pluto', 'Venus', 'Titan'],
        feedback: 'Incorrect!',
        expectedClasses: {
            Mars: 'correctly-selected',
            Pluto: 'incorrect',
            Venus: 'correctly-selected',
            Titan: 'incorrect',
        },
    },
    {
        answers: ['Pluto', 'Titan'],
        feedback: 'Incorrect!',
        expectedClasses: {
            Mars: 'correctly-selected',
            Pluto: 'incorrect',
            Venus: 'correctly-selected',
            Titan: 'incorrect',
        },
    },
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

const answerRowClasses = (answer: string) =>
    Array.from(document.querySelectorAll<HTMLLIElement>('#question-form li'))
        .find(item => item.querySelector('label')?.textContent?.trim() === answer)
        ?.querySelector<HTMLElement>('.answer-input-row')
        ?.className.split(/\s+/)
        .filter(Boolean) ?? []

const prepareSingleChoiceQuestion = async () => {
    const suffix = `${Date.now()}-single`
    const workspaceGuid = await createWorkspaceInBackend(`WTR Question Feedback Workspace ${suffix}`)
    const questionText = `What's the capital city of Australia? ${suffix}`
    const answers = ['Sydney', 'Canberra', 'Melbourne'] as const
    const question = await createQuestionInBackend(workspaceGuid, questionText, answers, { correctAnswers: [1] })

    return { questionId: question.id, questionText, answers }
}

const prepareMultipleChoiceQuestion = async () => {
    const suffix = `${Date.now()}-multi`
    const workspaceGuid = await createWorkspaceInBackend(`WTR Question Feedback Workspace ${suffix}`)
    const questionText = `Which of the following are planets? ${suffix}`
    const answers = ['Mars', 'Pluto', 'Venus', 'Titan'] as const
    const question = await createQuestionInBackend(workspaceGuid, questionText, answers, { correctAnswers: [0, 2] })

    return { questionId: question.id, questionText, answers }
}

describe('Question.Take.Feedback feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    for (const testCase of singleChoiceCases) {
        it(`shows ${testCase.feedback} for single-choice answer ${testCase.answer}`, async () => {
            const prepared = await prepareSingleChoiceQuestion()
            ;({ cleanup } = await renderAppAt(`/question/${prepared.questionId}`))

            await waitFor(() => textContent('#question') === prepared.questionText)
            await answerQuestion([testCase.answer])

            await waitFor(() => textContent('.question-feedback') === testCase.feedback)
            expect(textContent('.question-feedback')).to.equal(testCase.feedback)
        })
    }

    for (const testCase of multipleChoiceCases) {
        it(`shows ${testCase.feedback} and matching per-answer classes for ${testCase.answers.join(', ')}`, async () => {
            const prepared = await prepareMultipleChoiceQuestion()
            ;({ cleanup } = await renderAppAt(`/question/${prepared.questionId}`))

            await waitFor(() => textContent('#question') === prepared.questionText)
            await answerQuestion(testCase.answers)

            await waitFor(() => textContent('.question-feedback') === testCase.feedback)

            for (const [answer, expectedClass] of Object.entries(testCase.expectedClasses)) {
                expect(answerRowClasses(answer)).to.include(expectedClass)
            }
        })
    }
})
