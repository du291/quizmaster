import { expect } from '@esm-bundle/chai'
import type { Question } from '../../../src/model/question.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import {
    readQuestionFormSnapshot,
    setCheckboxValue,
    waitForQuestionEditLoaded,
} from '../support/question-form.ts'
import { renderAppAt, waitFor } from '../support/test-harness.tsx'

const questionId = 101
const editId = 'wtr-edit-101'

const buildSavedQuestion = (explanations: readonly string[] = ['No Brno', 'Yes', 'Germany']): Question => ({
    id: questionId,
    editId,
    question: 'What is the capital of Kambodia?',
    answers: ['Brno', 'Prague', 'Berlin'],
    explanations: [...explanations],
    correctAnswers: [1],
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

const answerExplanationInputCount = () => document.querySelectorAll<HTMLInputElement>('.answer-row input.explanation').length

describe('Question.Edit.GUI.ShowHideExplanation feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}
    let savedQuestion = buildSavedQuestion()

    const routes = (): readonly Route[] => [
        {
            method: 'GET',
            match: new RegExp(`^/api/question/${editId}/edit$`),
            handle: () => ({ body: cloneQuestion(savedQuestion) }),
        },
    ]

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    beforeEach(() => {
        savedQuestion = buildSavedQuestion()
        restoreFetch = installApiMock(routes())
    })

    it('shows explanation fields by default when the saved question has explanations', async () => {
        ;({ cleanup } = await renderAppAt(`/question/${editId}/edit`))

        await waitForQuestionEditLoaded(savedQuestion.question)

        expect(readQuestionFormSnapshot().showExplanations).to.equal(true)
        expect(answerExplanationInputCount()).to.equal(3)
    })

    it('hides explanation fields when show explanation is unchecked', async () => {
        ;({ cleanup } = await renderAppAt(`/question/${editId}/edit`))

        await waitForQuestionEditLoaded(savedQuestion.question)

        await setCheckboxValue('#show-explanation', false)
        await waitFor(() => answerExplanationInputCount() === 0)

        expect(readQuestionFormSnapshot().showExplanations).to.equal(false)
        expect(answerExplanationInputCount()).to.equal(0)
    })

    it('keeps explanation fields hidden when the saved question explanations are empty', async () => {
        savedQuestion = buildSavedQuestion(['', '', ''])

        ;({ cleanup } = await renderAppAt(`/question/${editId}/edit`))

        await waitForQuestionEditLoaded(savedQuestion.question)

        expect(readQuestionFormSnapshot().showExplanations).to.equal(false)
        expect(answerExplanationInputCount()).to.equal(0)
    })
})
