import { expect } from '@esm-bundle/chai'
import type { Question } from '../../../src/model/question.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { readQuestionFormSnapshot, waitForQuestionEditLoaded } from '../support/question-form.ts'
import { renderAppAt, waitFor } from '../support/test-harness.tsx'

const questionId = 101
const editId = 'wtr-edit-101'

const buildSavedQuestion = (): Question => ({
    id: questionId,
    editId,
    question: 'What is the capital of Czech Republic?',
    answers: ['Brno', 'Prague', 'Berlin'],
    explanations: ['No Brno', 'Yes', 'Germany'],
    correctAnswers: [1],
    questionExplanation: 'Czechia is a country in Europe. Czechs love beer.',
    workspaceGuid: 'workspace-edit-wtr',
    easyMode: false,
})

const cloneQuestion = (question: Question): Question => ({
    ...question,
    answers: [...question.answers],
    explanations: [...question.explanations],
    correctAnswers: [...question.correctAnswers],
})

const deleteButtons = () => Array.from(document.querySelectorAll<HTMLButtonElement>('.answer-delete-button'))

describe('Question.Edit.GUI.DeleteAnswer feature (WTR mocked API)', () => {
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

    it('deletes the third prepopulated answer from the edit form', async () => {
        ;({ cleanup } = await renderAppAt(`/question/${editId}/edit`))

        await waitForQuestionEditLoaded(savedQuestion.question)

        expect(deleteButtons()).to.have.length(3)
        expect(deleteButtons().every(button => button.disabled === false)).to.equal(true)

        deleteButtons()[2]?.click()
        await waitFor(() => document.querySelectorAll('.answer-row').length === 2)

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: 'What is the capital of Czech Republic?',
            questionExplanation: 'Czechia is a country in Europe. Czechs love beer.',
            isMultipleChoice: false,
            showExplanations: true,
            easyModeVisible: false,
            easyModeChecked: false,
            answers: [
                { text: 'Brno', isCorrect: false, explanation: 'No Brno' },
                { text: 'Prague', isCorrect: true, explanation: 'Yes' },
            ],
        })
    })
})
