import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

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

describe('Question.Take.Explanation feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    it('shows the selected answer explanation and question explanation for a single-choice question', async () => {
        const suffix = `${Date.now()}-single`
        const workspaceGuid = await createWorkspaceInBackend(`WTR Question Explanation Workspace ${suffix}`)
        const questionText = `What is capital of Italy? ${suffix}`
        const answers = ['Rome', 'Naples', 'Florence', 'Palermo'] as const
        const explanations = [
            'Rome is the capital of Italy.',
            'Naples is the capital of Campania region.',
            'Florence is the capital of Tuscany region.',
            'Palermo is the capital of Sicily region.',
        ] as const
        const questionExplanation = 'Rome is the capital city of Italy. It is also the capital of the Lazio region.'
        const question = await createQuestionInBackend(workspaceGuid, questionText, answers, {
            correctAnswers: [0],
            explanations,
            questionExplanation,
        })
        ;({ cleanup } = await renderAppAt(`/question/${question.id}`))

        await waitFor(() => textContent('#question') === questionText)
        await answerQuestion(['Naples'])

        await waitFor(() => textContent('.question-feedback') === 'Incorrect!')
        await waitFor(() => displayedAnswerExplanations().length === 1)
        await waitFor(() => textContent('.question-explanation') === questionExplanation)

        expect(displayedAnswerExplanations()).to.deep.equal([explanations[1]])
        expect(answerExplanationText('Naples')).to.equal(explanations[1])
        expect(textContent('.question-explanation')).to.equal(questionExplanation)
    })

    it('shows per-answer explanations and the question explanation for a multiple-choice question', async () => {
        const suffix = `${Date.now()}-multi`
        const workspaceGuid = await createWorkspaceInBackend(`WTR Question Explanation Workspace ${suffix}`)
        const questionText = `Which of these countries are in Europe? ${suffix}`
        const answers = ['Italy', 'France', 'Morocco', 'Spain', 'Canada'] as const
        const explanations = [
            'Located on the Apennine Peninsula, which is part of the European continent.',
            'One of the founders of the European Union.',
            'This country is in Africa, not in Europe.',
            'Located on the Iberian Peninsula, which is part of the European continent.',
            'Located in America.',
        ] as const
        const questionExplanation = 'Italy, France, and Spain are in Europe. Morocco is in Africa.'
        const question = await createQuestionInBackend(workspaceGuid, questionText, answers, {
            correctAnswers: [0, 1, 3],
            explanations,
            questionExplanation,
        })
        ;({ cleanup } = await renderAppAt(`/question/${question.id}`))

        await waitFor(() => textContent('#question') === questionText)
        await answerQuestion(['France', 'Morocco', 'Spain'])

        await waitFor(() => textContent('.question-feedback') === 'Incorrect!')
        await waitFor(() => displayedAnswerExplanations().length === answers.length)
        await waitFor(() => textContent('.question-explanation') === questionExplanation)

        for (const [index, answer] of answers.entries()) {
            expect(answerExplanationText(answer)).to.equal(explanations[index])
        }
        expect(textContent('.question-explanation')).to.equal(questionExplanation)
    })
})
