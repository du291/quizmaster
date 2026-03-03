import { expect } from '@esm-bundle/chai'
import { clickElement, renderAppAt, setElementValue, setTextValue, textContent, waitFor } from '../support/test-harness.tsx'

describe('Question.Create.GUI feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    it('creates question and navigates to edit page with URLs', async () => {
        const questionText = `WTR question ${Date.now()}`
        ;({ cleanup } = await renderAppAt('/question/new'))

        await setTextValue('#question-text', questionText)

        const answerInputs = Array.from(document.querySelectorAll<HTMLInputElement>('.answer-row input.text'))
        expect(answerInputs.length).to.equal(2)

        await setElementValue(answerInputs[0], 'Correct')
        await setElementValue(answerInputs[1], 'Incorrect')

        const correctnessInputs = Array.from(
            document.querySelectorAll<HTMLInputElement>('.answer-row input[type="checkbox"], .answer-row input[type="radio"]'),
        )
        expect(correctnessInputs.length).to.equal(2)
        correctnessInputs[0].click()

        await clickElement('button[type="submit"]')

        await waitFor(() => /^\/question\/.+\/edit$/.test(window.location.pathname))
        await waitFor(() => textContent('#question-link') !== '' && textContent('#question-edit-link') !== '')

        const questionEditLink = document.querySelector<HTMLAnchorElement>('#question-edit-link')
        expect(questionEditLink?.href ?? '').to.contain('/edit')
    })
})
