import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import {
    readQuestionFormSnapshot,
    setCheckboxValue,
    waitForQuestionEditLoaded,
} from '../support/question-form.ts'
import { renderAppAt, waitFor } from '../support/test-harness.tsx'

const initialQuestion = {
    question: 'What is the capital of Kambodia?',
    answers: ['Brno', 'Prague', 'Berlin'],
    correctAnswers: [1] as const,
}

const answerExplanationInputCount = () => document.querySelectorAll<HTMLInputElement>('.answer-row input.explanation').length

describe('Question.Edit.GUI.ShowHideExplanation feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    const prepareQuestion = async (explanations: readonly string[] = ['No Brno', 'Yes', 'Germany']) => {
        const workspaceGuid = await createWorkspaceInBackend(`WTR edit show explanations ${Date.now()}`)
        const response = await createQuestionInBackend(workspaceGuid, initialQuestion.question, initialQuestion.answers, {
            correctAnswers: initialQuestion.correctAnswers,
            explanations,
        })

        return {
            workspaceGuid,
            editId: response.editId,
        }
    }

    it('shows explanation fields by default when the saved question has explanations', async () => {
        const prepared = await prepareQuestion()
        ;({ cleanup } = await renderAppAt(`/question/${prepared.editId}/edit`))

        await waitForQuestionEditLoaded(initialQuestion.question)

        expect(readQuestionFormSnapshot().showExplanations).to.equal(true)
        expect(answerExplanationInputCount()).to.equal(3)
    })

    it('hides explanation fields when show explanation is unchecked', async () => {
        const prepared = await prepareQuestion()
        ;({ cleanup } = await renderAppAt(`/question/${prepared.editId}/edit`))

        await waitForQuestionEditLoaded(initialQuestion.question)

        await setCheckboxValue('#show-explanation', false)
        await waitFor(() => answerExplanationInputCount() === 0)

        expect(readQuestionFormSnapshot().showExplanations).to.equal(false)
        expect(answerExplanationInputCount()).to.equal(0)
    })

    it('keeps explanation fields hidden when the saved question explanations are empty', async () => {
        const prepared = await prepareQuestion(['', '', ''])
        ;({ cleanup } = await renderAppAt(`/question/${prepared.editId}/edit`))

        await waitForQuestionEditLoaded(initialQuestion.question)

        expect(readQuestionFormSnapshot().showExplanations).to.equal(false)
        expect(answerExplanationInputCount()).to.equal(0)
    })
})
