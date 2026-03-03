import { expect } from '@esm-bundle/chai'
import type { Question } from '../../../src/model/question.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import {
    clickElement,
    renderAppAt,
    setElementValue,
    setTextValue,
    textContent,
    waitFor,
    waitForElement,
} from '../support/test-harness.tsx'

describe('Question.Create.GUI feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    it('shows expected default values on create question form', async () => {
        ;({ cleanup } = await renderAppAt('/question/new'))

        await clickElement('#show-explanation')

        const questionText = await waitForElement<HTMLInputElement | HTMLTextAreaElement>('#question-text')
        const multipleChoiceCheckbox = await waitForElement<HTMLInputElement>('#is-multiple-choice')
        const questionExplanation = await waitForElement<HTMLInputElement | HTMLTextAreaElement>('#question-explanation')

        expect(questionText.value).to.equal('')
        expect(multipleChoiceCheckbox.checked).to.equal(false)
        expect(questionExplanation.value).to.equal('')

        const rows = Array.from(document.querySelectorAll<HTMLElement>('.answer-row'))
        expect(rows.length).to.equal(2)

        for (const row of rows) {
            const answerInput = row.querySelector<HTMLInputElement>('input.text')
            const correctnessInput = row.querySelector<HTMLInputElement>('input[type="checkbox"], input[type="radio"]')
            const explanationInput = row.querySelector<HTMLInputElement>('input.explanation')
            const deleteButton = row.querySelector<HTMLButtonElement>('.answer-delete-button')

            expect(answerInput?.value ?? '').to.equal('')
            expect(correctnessInput?.checked ?? true).to.equal(false)
            expect(explanationInput?.value ?? '').to.equal('')
            expect(deleteButton?.disabled ?? false).to.equal(true)
        }
    })

    it('creates question and shows question take/edit URLs', async () => {
        const editId = 'wtr-edit-101'
        const questionId = 101
        let savedQuestion: Question | null = null

        const routes: readonly Route[] = [
            {
                method: 'POST',
                match: /^\/api\/question$/,
                handle: request => {
                    const payload = request.body as {
                        question: string
                        answers: string[]
                        explanations: string[]
                        correctAnswers: number[]
                        questionExplanation: string
                    }

                    savedQuestion = {
                        id: questionId,
                        editId,
                        question: payload.question,
                        answers: payload.answers,
                        explanations: payload.explanations,
                        correctAnswers: payload.correctAnswers,
                        questionExplanation: payload.questionExplanation,
                        workspaceGuid: null,
                        easyMode: false,
                    }

                    return { body: { id: questionId, editId } }
                },
            },
            {
                method: 'GET',
                match: /^\/api\/question\/wtr-edit-101\/edit$/,
                handle: () => {
                    if (!savedQuestion) throw new Error('Expected saved question to be present')
                    return { body: savedQuestion }
                },
            },
        ]

        restoreFetch = installApiMock(routes)
        ;({ cleanup } = await renderAppAt('/question/new'))

        await clickElement('#show-explanation')
        await setTextValue('#question-text', '2 + 2 = ?')

        const answerTextInputs = document.querySelectorAll<HTMLInputElement>('.answer-row input.text')
        expect(answerTextInputs.length).to.equal(2)
        await setElementValue(answerTextInputs[0], '4')
        await setElementValue(answerTextInputs[1], '5')

        const correctnessInputs = document.querySelectorAll<HTMLInputElement>(
            '.answer-row input[type="checkbox"], .answer-row input[type="radio"]',
        )
        expect(correctnessInputs.length).to.equal(2)
        correctnessInputs[0].click()

        await clickElement('button[type="submit"]')

        await waitFor(() => window.location.pathname === `/question/${editId}/edit`)
        await waitFor(() => textContent('#question-link') !== '' && textContent('#question-edit-link') !== '')

        const questionTakeLink = await waitForElement<HTMLAnchorElement>('#question-link')
        const questionEditLink = await waitForElement<HTMLAnchorElement>('#question-edit-link')

        expect(questionTakeLink.href).to.contain(`/question/${questionId}`)
        expect(questionEditLink.href).to.contain(`/question/${editId}/edit`)
    })
})
