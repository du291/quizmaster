import { expect } from '@esm-bundle/chai'
import { readQuestionFormSnapshot, setCheckboxValue } from '../support/question-form.ts'
import { renderAppAt, waitFor, waitForElement } from '../support/test-harness.tsx'

const answerExplanationInputCount = () => document.querySelectorAll<HTMLInputElement>('.answer-row input.explanation').length

describe('Question.Create.GUI.ShowHideExplanation feature (WTR mocked API)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    it('hides explanation fields by default', async () => {
        ;({ cleanup } = await renderAppAt('/question/new'))

        await waitForElement<HTMLInputElement | HTMLTextAreaElement>('#question-text')

        expect(readQuestionFormSnapshot().showExplanations).to.equal(false)
        expect(answerExplanationInputCount()).to.equal(0)
    })

    it('shows explanation fields when show explanation is checked', async () => {
        ;({ cleanup } = await renderAppAt('/question/new'))

        await waitForElement<HTMLInputElement | HTMLTextAreaElement>('#question-text')

        await setCheckboxValue('#show-explanation', true)
        await waitFor(() => answerExplanationInputCount() === 2)

        expect(readQuestionFormSnapshot().showExplanations).to.equal(true)
        expect(answerExplanationInputCount()).to.equal(2)
    })
})
