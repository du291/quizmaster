import { expect } from '@esm-bundle/chai'
import {
    readQuestionFormSnapshot,
    selectAnswerAsCorrect,
    setAnswerText,
    setCheckboxValue,
} from '../support/question-form.ts'
import { clickElement, renderAppAt, waitFor, waitForElement } from '../support/test-harness.tsx'

const deleteButtons = () => Array.from(document.querySelectorAll<HTMLButtonElement>('.answer-delete-button'))

describe('Question.Create.GUI.DeleteAnswer feature (WTR mocked API)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    it('deletes the second answer from a three-answer draft', async () => {
        ;({ cleanup } = await renderAppAt('/question/new'))

        await waitForElement<HTMLInputElement | HTMLTextAreaElement>('#question-text')

        await setCheckboxValue('#show-explanation', true)
        await setAnswerText(0, 'AA')
        await selectAnswerAsCorrect(0)
        await setAnswerText(1, 'BB')
        await clickElement('#add-answer')
        await waitFor(() => document.querySelectorAll('.answer-row').length === 3)
        await setAnswerText(2, 'CC')

        expect(deleteButtons()).to.have.length(3)
        expect(deleteButtons().every(button => button.disabled === false)).to.equal(true)

        deleteButtons()[1]?.click()
        await waitFor(() => document.querySelectorAll('.answer-row').length === 2)

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: '',
            questionExplanation: '',
            isMultipleChoice: false,
            showExplanations: true,
            easyModeVisible: false,
            easyModeChecked: false,
            answers: [
                { text: 'AA', isCorrect: true, explanation: '' },
                { text: 'CC', isCorrect: false, explanation: '' },
            ],
        })
    })
})
