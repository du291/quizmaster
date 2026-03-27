import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import {
    readQuestionFormSnapshot,
    selectAnswerAsCorrect,
    setAnswerExplanation,
    setAnswerText,
    setCheckboxValue,
    setQuestionExplanation,
    setQuestionText,
    waitForPathname,
    waitForQuestionEditLoaded,
} from '../support/question-form.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const initialQuestion = {
    question: 'What is the capital of Czech Republic?',
    answers: ['Brno', 'Prague', 'Berlin'],
    explanations: ['No Brno', 'Yes', 'Germany'],
    correctAnswers: [1] as const,
    questionExplanation: 'Czechia is a country in Europe. Czechs love beer.',
}

describe('Question.Edit.GUI feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    const prepareQuestion = async () => {
        const workspaceGuid = await createWorkspaceInBackend(`WTR edit workspace ${Date.now()}`)
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

    const reopenEditedQuestion = async (editId: string, expectedQuestionText: string) => {
        await clickElement('.edit-question')
        await waitForPathname(`/question/${editId}/edit`)
        await waitForQuestionEditLoaded(expectedQuestionText)
    }

    it('shows prepopulated form fields for an existing question', async () => {
        const prepared = await prepareQuestion()
        ;({ cleanup } = await renderAppAt(`/question/${prepared.editId}/edit`))

        await waitForQuestionEditLoaded(initialQuestion.question)

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
                { text: 'Berlin', isCorrect: false, explanation: 'Germany' },
            ],
        })
    })

    it('persists edited question fields after save and reopen', async () => {
        const prepared = await prepareQuestion()
        ;({ cleanup } = await renderAppAt(`/question/${prepared.editId}/edit`))

        await waitForQuestionEditLoaded(initialQuestion.question)

        await setQuestionText('What is the capital of Slovakia?')
        await setAnswerText(0, "It's Brno")
        await setAnswerExplanation(0, "No, it's not Brno")
        await setAnswerText(1, "It's Prague")
        await setAnswerExplanation(1, "No, it's not Prague")
        await setAnswerText(2, "It's Bratislava")
        await selectAnswerAsCorrect(2)
        await setAnswerExplanation(2, 'Yes!')
        await setQuestionExplanation('Slovakia is a country in Europe. Slovaks love borovicka.')

        await clickElement('button[type="submit"]')

        await waitForPathname(`/workspace/${prepared.workspaceGuid}`)
        await waitFor(() => textContent('.question-item #question-text') === 'What is the capital of Slovakia?', 5000)

        await reopenEditedQuestion(prepared.editId, 'What is the capital of Slovakia?')

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: 'What is the capital of Slovakia?',
            questionExplanation: 'Slovakia is a country in Europe. Slovaks love borovicka.',
            isMultipleChoice: false,
            showExplanations: true,
            easyModeVisible: false,
            easyModeChecked: false,
            answers: [
                { text: "It's Brno", isCorrect: false, explanation: "No, it's not Brno" },
                { text: "It's Prague", isCorrect: false, explanation: "No, it's not Prague" },
                { text: "It's Bratislava", isCorrect: true, explanation: 'Yes!' },
            ],
        })
    })

    it('persists changing a single-choice question to multiple choice', async () => {
        const prepared = await prepareQuestion()
        ;({ cleanup } = await renderAppAt(`/question/${prepared.editId}/edit`))

        await waitForQuestionEditLoaded(initialQuestion.question)

        await setCheckboxValue('#is-multiple-choice', true)
        await selectAnswerAsCorrect(0)

        await clickElement('button[type="submit"]')

        await waitForPathname(`/workspace/${prepared.workspaceGuid}`)
        await waitFor(() => textContent('.question-item #question-text') === initialQuestion.question, 5000)

        await reopenEditedQuestion(prepared.editId, initialQuestion.question)

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: initialQuestion.question,
            questionExplanation: initialQuestion.questionExplanation,
            isMultipleChoice: true,
            showExplanations: true,
            easyModeVisible: true,
            easyModeChecked: false,
            answers: [
                { text: 'Brno', isCorrect: true, explanation: 'No Brno' },
                { text: 'Prague', isCorrect: true, explanation: 'Yes' },
                { text: 'Berlin', isCorrect: false, explanation: 'Germany' },
            ],
        })
    })
})
