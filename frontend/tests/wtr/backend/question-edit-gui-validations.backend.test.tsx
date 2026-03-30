import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import {
    readValidationErrorCodes,
    setAnswerCorrect,
    setAnswerExplanation,
    setAnswerText,
    setQuestionExplanation,
    setQuestionText,
    waitForQuestionEditLoaded,
    waitForValidationErrors,
} from '../support/question-form.ts'
import { clickElement, renderAppAt } from '../support/test-harness.tsx'

const singleChoiceQuestion = {
    question: 'What is the capital of Czech Republic?',
    answers: ['Brno', 'Prague', 'Berlin'],
    explanations: ['No Brno', 'Yes', 'Germany'],
    correctAnswers: [1] as const,
    questionExplanation: 'Czechia is a country in Europe. Czechs love beer.',
}

const multipleChoiceQuestion = {
    question: 'What are cities of Czech Republic?',
    answers: ['Brno', 'Brussels', 'Prague', 'Berlin'],
    explanations: ['No Brno', 'Yes', 'Yes', 'Germany'],
    correctAnswers: [0, 2] as const,
    questionExplanation: '',
}

describe('Question.Edit.GUI.Validations feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    const prepareQuestion = async ({
        question,
        answers,
        explanations,
        correctAnswers,
        questionExplanation,
    }: {
        readonly question: string
        readonly answers: readonly string[]
        readonly explanations: readonly string[]
        readonly correctAnswers: readonly number[]
        readonly questionExplanation: string
    }) => {
        const workspaceGuid = await createWorkspaceInBackend(`WTR edit validations ${Date.now()}`)
        const response = await createQuestionInBackend(workspaceGuid, question, answers, {
            correctAnswers,
            explanations,
            questionExplanation,
        })

        return {
            editId: response.editId,
        }
    }

    it('shows the expected validation errors for an empty single-choice edit submission', async () => {
        const prepared = await prepareQuestion(singleChoiceQuestion)
        ;({ cleanup } = await renderAppAt(`/question/${prepared.editId}/edit`))

        await waitForQuestionEditLoaded(singleChoiceQuestion.question)

        await setQuestionText('')
        await setAnswerText(0, '')
        await setAnswerExplanation(0, '')
        await setQuestionExplanation('')

        await clickElement('button[type="submit"]')
        await waitForValidationErrors(['empty-answer', 'empty-answer-explanation', 'empty-question'])

        expect(readValidationErrorCodes()).to.deep.equal(['empty-answer', 'empty-answer-explanation', 'empty-question'])
        expect(window.location.pathname).to.equal(`/question/${prepared.editId}/edit`)
    })

    it('shows the expected validation errors for an empty multiple-choice edit submission', async () => {
        const prepared = await prepareQuestion(multipleChoiceQuestion)
        ;({ cleanup } = await renderAppAt(`/question/${prepared.editId}/edit`))

        await waitForQuestionEditLoaded(multipleChoiceQuestion.question)

        await setQuestionText('')
        await setAnswerText(0, '')
        await setAnswerCorrect(0, false)
        await setAnswerExplanation(0, '')
        await setAnswerText(2, '')
        await setAnswerCorrect(2, false)
        await setAnswerExplanation(2, '')
        await setQuestionExplanation('')

        await clickElement('button[type="submit"]')
        await waitForValidationErrors([
            'empty-answer',
            'empty-answer-explanation',
            'empty-question',
            'few-correct-answers',
            'no-correct-answer',
        ])

        expect(readValidationErrorCodes()).to.deep.equal([
            'empty-answer',
            'empty-answer-explanation',
            'empty-question',
            'few-correct-answers',
            'no-correct-answer',
        ])
        expect(window.location.pathname).to.equal(`/question/${prepared.editId}/edit`)
    })
})
