import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { readQuestionFormSnapshot, waitForQuestionEditLoaded } from '../support/question-form.ts'
import { renderAppAt, waitFor } from '../support/test-harness.tsx'

const initialQuestion = {
    question: 'What is the capital of Czech Republic?',
    answers: ['Brno', 'Prague', 'Berlin'],
    explanations: ['No Brno', 'Yes', 'Germany'],
    correctAnswers: [1] as const,
    questionExplanation: 'Czechia is a country in Europe. Czechs love beer.',
}

const deleteButtons = () => Array.from(document.querySelectorAll<HTMLButtonElement>('.answer-delete-button'))

describe('Question.Edit.GUI.DeleteAnswer feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    const prepareQuestion = async () => {
        const workspaceGuid = await createWorkspaceInBackend(`WTR edit delete answer ${Date.now()}`)
        const response = await createQuestionInBackend(workspaceGuid, initialQuestion.question, initialQuestion.answers, {
            correctAnswers: initialQuestion.correctAnswers,
            explanations: initialQuestion.explanations,
            questionExplanation: initialQuestion.questionExplanation,
        })

        return {
            workspaceGuid,
            editId: response.editId,
        }
    }

    it('deletes the third prepopulated answer from the edit form', async () => {
        const prepared = await prepareQuestion()
        ;({ cleanup } = await renderAppAt(`/question/${prepared.editId}/edit`))

        await waitForQuestionEditLoaded(initialQuestion.question)

        expect(deleteButtons()).to.have.length(3)
        expect(deleteButtons().every(button => button.disabled === false)).to.equal(true)

        deleteButtons()[2]?.click()
        await waitFor(() => document.querySelectorAll('.answer-row').length === 2)

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: initialQuestion.question,
            questionExplanation: initialQuestion.questionExplanation,
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
