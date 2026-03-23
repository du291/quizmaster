import { expect } from '@esm-bundle/chai'
import { buildQuestion } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const singleChoiceQuestion = buildQuestion({
    id: 601,
    question: 'What is capital of Italy?',
    answers: ['Rome', 'Naples', 'Florence', 'Palermo'],
    correctAnswers: [0],
    explanations: [
        'Rome is the capital of Italy.',
        'Naples is the capital of Campania region.',
        'Florence is the capital of Tuscany region.',
        'Palermo is the capital of Sicily region.',
    ],
    questionExplanation: 'Rome is the capital city of Italy. It is also the capital of the Lazio region.',
})

const multipleChoiceQuestion = buildQuestion({
    id: 602,
    question: 'Which of these countries are in Europe?',
    answers: ['Italy', 'France', 'Morocco', 'Spain', 'Canada'],
    correctAnswers: [0, 1, 3],
    explanations: [
        'Located on the Apennine Peninsula, which is part of the European continent.',
        'One of the founders of the European Union.',
        'This country is in Africa, not in Europe.',
        'Located on the Iberian Peninsula, which is part of the European continent.',
        'Located in America.',
    ],
    questionExplanation: 'Italy, France, and Spain are in Europe. Morocco is in Africa.',
})

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

const answerExplanationText = (answer: string) =>
    Array.from(document.querySelectorAll<HTMLLIElement>('#question-form li'))
        .find(item => item.querySelector('label')?.textContent?.trim() === answer)
        ?.querySelector('.explanation')
        ?.textContent?.trim() ?? ''

const displayedAnswerExplanations = () =>
    Array.from(document.querySelectorAll<HTMLElement>('#question-form .explanation')).map(node => node.textContent?.trim() ?? '')

const installQuestionExplanationMockApi = () => {
    const questionsById = new Map<number, typeof singleChoiceQuestion>([
        [singleChoiceQuestion.id, singleChoiceQuestion],
        [multipleChoiceQuestion.id, multipleChoiceQuestion],
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

describe('Question.Take.Explanation feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    it('shows the selected answer explanation and question explanation for a single-choice question', async () => {
        restoreFetch = installQuestionExplanationMockApi()
        ;({ cleanup } = await renderAppAt(`/question/${singleChoiceQuestion.id}`))

        await waitFor(() => textContent('#question') === singleChoiceQuestion.question)
        await answerQuestion(['Naples'])

        await waitFor(() => textContent('.question-feedback') === 'Incorrect!')
        await waitFor(() => displayedAnswerExplanations().length === 1)
        await waitFor(() => textContent('.question-explanation') === singleChoiceQuestion.questionExplanation)

        expect(displayedAnswerExplanations()).to.deep.equal([singleChoiceQuestion.explanations[1]])
        expect(answerExplanationText('Naples')).to.equal(singleChoiceQuestion.explanations[1])
        expect(textContent('.question-explanation')).to.equal(singleChoiceQuestion.questionExplanation)
    })

    it('shows per-answer explanations and the question explanation for a multiple-choice question', async () => {
        restoreFetch = installQuestionExplanationMockApi()
        ;({ cleanup } = await renderAppAt(`/question/${multipleChoiceQuestion.id}`))

        await waitFor(() => textContent('#question') === multipleChoiceQuestion.question)
        await answerQuestion(['France', 'Morocco', 'Spain'])

        await waitFor(() => textContent('.question-feedback') === 'Incorrect!')
        await waitFor(() => displayedAnswerExplanations().length === multipleChoiceQuestion.answers.length)
        await waitFor(() => textContent('.question-explanation') === multipleChoiceQuestion.questionExplanation)

        for (const [index, answer] of multipleChoiceQuestion.answers.entries()) {
            expect(answerExplanationText(answer)).to.equal(multipleChoiceQuestion.explanations[index])
        }
        expect(textContent('.question-explanation')).to.equal(multipleChoiceQuestion.questionExplanation)
    })
})
