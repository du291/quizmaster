import { expect } from '@esm-bundle/chai'
import { questionListItems, workspaceGuid } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { readValidationErrorCodes, waitForPathname, waitForValidationErrors } from '../support/question-form.ts'
import { readVisibleQuizQuestionLabels, selectQuizQuestionByLabel, waitForQuizCreateFormLoaded } from '../support/quiz-create-form.ts'
import { clickElement, renderAppAt, setElementValue, setTextValue, waitFor, waitForElement } from '../support/test-harness.tsx'

const validationQuestionListItems = questionListItems.slice(0, 3)
const validationQuestionTexts = validationQuestionListItems.map(item => item.question)

describe('Quiz.Validations feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    beforeEach(() => {
        const routes: readonly Route[] = [
            {
                method: 'GET',
                match: new RegExp(`^/api/workspaces/${workspaceGuid}/questions$`),
                handle: () => ({ body: validationQuestionListItems }),
            },
        ]

        restoreFetch = installApiMock(routes)
    })

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    it('shows default quiz-create values and workspace questions', async () => {
        ;({ cleanup } = await renderAppAt(`/quiz-create/new?workspaceguid=${workspaceGuid}`))

        await waitForQuizCreateFormLoaded(validationQuestionTexts.length)

        expect(document.querySelector<HTMLInputElement>('#quiz-title')?.value).to.equal('')
        expect(document.querySelector<HTMLTextAreaElement>('#quiz-description')?.value).to.equal('')
        expect(document.querySelector<HTMLInputElement>('#time-limit')?.value).to.equal('600')
        expect(document.querySelector<HTMLInputElement>('#pass-score')?.value).to.equal('80')
        expect(readVisibleQuizQuestionLabels()).to.have.members(validationQuestionTexts)
    })

    it('blocks empty submit and randomized count above the selected question count', async () => {
        ;({ cleanup } = await renderAppAt(`/quiz-create/new?workspaceguid=${workspaceGuid}`))

        await waitForQuizCreateFormLoaded(validationQuestionTexts.length)

        await clickElement('button[type="submit"]')
        await waitForPathname('/quiz-create/new')
        await waitForValidationErrors(['empty-title', 'few-questions'])

        await setTextValue('#quiz-title', 'Math Quiz')
        await selectQuizQuestionByLabel('2 + 2 = ?')
        await selectQuizQuestionByLabel('4 / 2 = ?')
        await clickElement('#isRandomized')
        await setTextValue('#quiz-finalCount', '3')
        await clickElement('button[type="submit"]')

        await waitForValidationErrors(['too-many-randomized-questions'])
    })

    it('shows score and time-limit validation errors for invalid numeric values', async () => {
        ;({ cleanup } = await renderAppAt(`/quiz-create/new?workspaceguid=${workspaceGuid}`))

        await waitForQuizCreateFormLoaded(validationQuestionTexts.length)

        await setTextValue('#quiz-title', 'Math Quiz')
        await selectQuizQuestionByLabel('2 + 2 = ?')
        await selectQuizQuestionByLabel('4 / 2 = ?')

        await setTextValue('#pass-score', '220')
        await clickElement('button[type="submit"]')
        await waitForValidationErrors(['scoreAboveMax'])

        await setTextValue('#pass-score', '80')
        await setTextValue('#time-limit', '-10')
        await clickElement('button[type="submit"]')
        await waitForValidationErrors(['negativeTimeLimit'])

        await setTextValue('#time-limit', '21601')
        await clickElement('button[type="submit"]')
        await waitForValidationErrors(['timeLimitAboveMax'])
    })

    it('clears time limit and pass score to zero without validation errors', async () => {
        ;({ cleanup } = await renderAppAt(`/quiz-create/new?workspaceguid=${workspaceGuid}`))

        await waitForQuizCreateFormLoaded(validationQuestionTexts.length)

        await setTextValue('#quiz-title', 'Math Quiz')

        const timeLimitInput = await waitForElement<HTMLInputElement>('#time-limit')
        await setElementValue(timeLimitInput, '')
        await waitFor(() => document.querySelector<HTMLInputElement>('#time-limit')?.value === '0')
        expect(readValidationErrorCodes()).to.deep.equal([])

        const passScoreInput = await waitForElement<HTMLInputElement>('#pass-score')
        await setElementValue(passScoreInput, '')
        await waitFor(() => document.querySelector<HTMLInputElement>('#pass-score')?.value === '0')
        expect(readValidationErrorCodes()).to.deep.equal([])
    })
})
