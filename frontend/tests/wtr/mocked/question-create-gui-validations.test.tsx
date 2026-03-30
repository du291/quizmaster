import { expect } from '@esm-bundle/chai'
import { installApiMock, type Route, type RouteResponse } from '../support/mock-api.ts'
import {
    addAnswer,
    readValidationErrorCodes,
    selectAnswerAsCorrect,
    setAnswerCorrect,
    setAnswerExplanation,
    setAnswerText,
    setCheckboxValue,
    setQuestionText,
    waitForValidationErrors,
} from '../support/question-form.ts'
import { clickElement, renderAppAt, waitForElement } from '../support/test-harness.tsx'

const createPendingSave = () => new Promise<RouteResponse>(() => {})

const prepareSingleChoiceDraft = async () => {
    await waitForElement<HTMLInputElement | HTMLTextAreaElement>('#question-text')
    await setCheckboxValue('#show-explanation', true)
    await setAnswerText(0, '4')
    await setAnswerText(1, '5')
}

const prepareMultipleChoiceDraft = async () => {
    await prepareSingleChoiceDraft()
    await addAnswer()
    await addAnswer()
    await setQuestionText('What are cities of Czech Republic?')
    await setAnswerText(0, 'Brno')
    await setAnswerExplanation(0, 'No Brno')
    await setAnswerText(1, 'Brussels')
    await setAnswerExplanation(1, 'Yes')
    await setAnswerText(2, 'Prague')
    await setAnswerExplanation(2, 'Yes')
    await setAnswerText(3, 'Berlin')
    await setAnswerExplanation(3, 'Germany')
}

describe('Question.Create.GUI.Validations feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}
    let postCallCount = 0

    const routes = (): readonly Route[] => [
        {
            method: 'POST',
            match: /^\/api\/question$/,
            handle: () => {
                postCallCount += 1
                return createPendingSave()
            },
        },
    ]

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    beforeEach(() => {
        postCallCount = 0
        restoreFetch = installApiMock(routes())
    })

    it('shows empty-form and added-empty-answer validation errors without submitting', async () => {
        ;({ cleanup } = await renderAppAt('/question/new'))

        await waitForElement<HTMLInputElement | HTMLTextAreaElement>('#question-text')

        await clickElement('button[type="submit"]')
        await waitForValidationErrors(['empty-answer', 'empty-question', 'no-correct-answer'])

        expect(readValidationErrorCodes()).to.deep.equal(['empty-answer', 'empty-question', 'no-correct-answer'])
        expect(window.location.pathname).to.equal('/question/new')
        expect(postCallCount).to.equal(0)

        await setCheckboxValue('#show-explanation', true)
        await setQuestionText('What is 2 + 2?')
        await setAnswerText(0, '4')
        await selectAnswerAsCorrect(0)
        await setAnswerText(1, '5')
        await addAnswer()

        await clickElement('button[type="submit"]')
        await waitForValidationErrors(['empty-answer'])

        expect(readValidationErrorCodes()).to.deep.equal(['empty-answer'])
        expect(window.location.pathname).to.equal('/question/new')
        expect(postCallCount).to.equal(0)
    })

    it('clears single-choice validation errors after the draft becomes valid', async () => {
        ;({ cleanup } = await renderAppAt('/question/new'))

        await prepareSingleChoiceDraft()

        await clickElement('button[type="submit"]')
        await waitForValidationErrors(['empty-question', 'no-correct-answer'])

        expect(readValidationErrorCodes()).to.deep.equal(['empty-question', 'no-correct-answer'])
        expect(window.location.pathname).to.equal('/question/new')
        expect(postCallCount).to.equal(0)

        await setQuestionText('What is 2 + 2?')

        await clickElement('button[type="submit"]')
        await waitForValidationErrors(['no-correct-answer'])

        expect(readValidationErrorCodes()).to.deep.equal(['no-correct-answer'])
        expect(window.location.pathname).to.equal('/question/new')
        expect(postCallCount).to.equal(0)

        await selectAnswerAsCorrect(0)
        await setAnswerExplanation(0, '4 is the answer')

        await clickElement('button[type="submit"]')
        await waitForValidationErrors(['empty-answer-explanation'])

        expect(readValidationErrorCodes()).to.deep.equal(['empty-answer-explanation'])
        expect(window.location.pathname).to.equal('/question/new')
        expect(postCallCount).to.equal(0)

        await setAnswerExplanation(1, '5 is the answer, but in another universe')

        await clickElement('button[type="submit"]')
        await waitForValidationErrors([])

        expect(readValidationErrorCodes()).to.deep.equal([])
        expect(window.location.pathname).to.equal('/question/new')
        expect(postCallCount).to.equal(1)
    })

    it('shows and clears multiple-choice cardinality errors', async () => {
        ;({ cleanup } = await renderAppAt('/question/new'))

        await prepareMultipleChoiceDraft()
        await selectAnswerAsCorrect(1)
        await setCheckboxValue('#is-multiple-choice', true)

        await clickElement('button[type="submit"]')
        await waitForValidationErrors(['few-correct-answers'])

        expect(readValidationErrorCodes()).to.deep.equal(['few-correct-answers'])
        expect(window.location.pathname).to.equal('/question/new')
        expect(postCallCount).to.equal(0)

        await setAnswerCorrect(0, true)
        await setAnswerCorrect(2, true)
        await setAnswerCorrect(3, true)

        await clickElement('button[type="submit"]')
        await waitForValidationErrors([])

        expect(readValidationErrorCodes()).to.deep.equal([])
        expect(window.location.pathname).to.equal('/question/new')
        expect(postCallCount).to.equal(1)
    })
})
