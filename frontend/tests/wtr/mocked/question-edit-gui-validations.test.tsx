import { expect } from '@esm-bundle/chai'
import type { Question } from '../../../src/model/question.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
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

const singleChoiceEditId = 'wtr-edit-201'
const multipleChoiceEditId = 'wtr-edit-202'

const buildSingleChoiceQuestion = (): Question => ({
    id: 201,
    editId: singleChoiceEditId,
    question: 'What is the capital of Czech Republic?',
    answers: ['Brno', 'Prague', 'Berlin'],
    explanations: ['No Brno', 'Yes', 'Germany'],
    correctAnswers: [1],
    questionExplanation: 'Czechia is a country in Europe. Czechs love beer.',
    workspaceGuid: 'workspace-edit-wtr',
    easyMode: false,
})

const buildMultipleChoiceQuestion = (): Question => ({
    id: 202,
    editId: multipleChoiceEditId,
    question: 'What are cities of Czech Republic?',
    answers: ['Brno', 'Brussels', 'Prague', 'Berlin'],
    explanations: ['No Brno', 'Yes', 'Yes', 'Germany'],
    correctAnswers: [0, 2],
    questionExplanation: '',
    workspaceGuid: 'workspace-edit-wtr',
    easyMode: false,
})

const cloneQuestion = (question: Question): Question => ({
    ...question,
    answers: [...question.answers],
    explanations: [...question.explanations],
    correctAnswers: [...question.correctAnswers],
})

describe('Question.Edit.GUI.Validations feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}
    let patchCallCount = 0
    let savedQuestions: Record<string, Question> = {}

    const routes = (): readonly Route[] => [
        {
            method: 'GET',
            match: /^\/api\/question\/.+\/edit$/,
            handle: request => {
                const editId = request.path.match(/^\/api\/question\/(.+)\/edit$/)?.[1] ?? ''
                const question = savedQuestions[editId]
                if (!question) throw new Error(`Missing mocked question for ${editId}`)
                return { body: cloneQuestion(question) }
            },
        },
        {
            method: 'PATCH',
            match: /^\/api\/question\/.+$/,
            handle: () => {
                patchCallCount += 1
                return { body: 999 }
            },
        },
    ]

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    beforeEach(() => {
        patchCallCount = 0
        savedQuestions = {
            [singleChoiceEditId]: buildSingleChoiceQuestion(),
            [multipleChoiceEditId]: buildMultipleChoiceQuestion(),
        }
        restoreFetch = installApiMock(routes())
    })

    it('shows the expected validation errors for an empty single-choice edit submission', async () => {
        ;({ cleanup } = await renderAppAt(`/question/${singleChoiceEditId}/edit`))

        await waitForQuestionEditLoaded(savedQuestions[singleChoiceEditId]?.question)

        await setQuestionText('')
        await setAnswerText(0, '')
        await setAnswerExplanation(0, '')
        await setQuestionExplanation('')

        await clickElement('button[type="submit"]')
        await waitForValidationErrors(['empty-answer', 'empty-answer-explanation', 'empty-question'])

        expect(readValidationErrorCodes()).to.deep.equal(['empty-answer', 'empty-answer-explanation', 'empty-question'])
        expect(window.location.pathname).to.equal(`/question/${singleChoiceEditId}/edit`)
        expect(patchCallCount).to.equal(0)
    })

    it('shows the expected validation errors for an empty multiple-choice edit submission', async () => {
        ;({ cleanup } = await renderAppAt(`/question/${multipleChoiceEditId}/edit`))

        await waitForQuestionEditLoaded(savedQuestions[multipleChoiceEditId]?.question)

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
        expect(window.location.pathname).to.equal(`/question/${multipleChoiceEditId}/edit`)
        expect(patchCallCount).to.equal(0)
    })
})
