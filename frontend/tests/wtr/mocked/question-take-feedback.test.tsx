import { expect } from '@esm-bundle/chai'
import { buildQuestion } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const australiaQuestion = buildQuestion({
    id: 701,
    question: "What's the capital city of Australia?",
    answers: ['Sydney', 'Canberra', 'Melbourne'],
    correctAnswers: [1],
})

const planetsQuestion = buildQuestion({
    id: 702,
    question: 'Which of the following are planets?',
    answers: ['Mars', 'Pluto', 'Venus', 'Titan'],
    correctAnswers: [0, 2],
})

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

const installQuestionFeedbackMockApi = () => {
    const questionsById = new Map<number, typeof australiaQuestion>([
        [australiaQuestion.id, australiaQuestion],
        [planetsQuestion.id, planetsQuestion],
    ])

    const routes: readonly Route[] = [
        {
            method: 'GET',
            match: /^\/api\/question\/\d+$/,
            handle: request => {
                const questionId = Number.parseInt(request.path.split('/').pop() ?? '0')
                const question = questionsById.get(questionId)
                if (!question) throw new Error(`Question not found: ${questionId}`)
                return { body: question }
            },
        },
    ]

    return installApiMock(routes)
}

describe('Question.Take.Feedback feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    for (const testCase of singleChoiceCases) {
        it(`shows ${testCase.feedback} for single-choice answer ${testCase.answer}`, async () => {
            restoreFetch = installQuestionFeedbackMockApi()
            ;({ cleanup } = await renderAppAt(`/question/${australiaQuestion.id}`))

            await waitFor(() => textContent('#question') === australiaQuestion.question)
            await answerQuestion([testCase.answer])

            await waitFor(() => textContent('.question-feedback') === testCase.feedback)
            expect(textContent('.question-feedback')).to.equal(testCase.feedback)
        })
    }

    for (const testCase of multipleChoiceCases) {
        it(`shows ${testCase.feedback} and matching per-answer classes for ${testCase.answers.join(', ')}`, async () => {
            restoreFetch = installQuestionFeedbackMockApi()
            ;({ cleanup } = await renderAppAt(`/question/${planetsQuestion.id}`))

            await waitFor(() => textContent('#question') === planetsQuestion.question)
            await answerQuestion(testCase.answers)

            await waitFor(() => textContent('.question-feedback') === testCase.feedback)

            for (const [answer, expectedClass] of Object.entries(testCase.expectedClasses)) {
                expect(answerRowClasses(answer)).to.include(expectedClass)
            }
        })
    }
})
