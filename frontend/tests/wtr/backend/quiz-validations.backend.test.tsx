import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { readValidationErrorCodes, waitForPathname, waitForValidationErrors } from '../support/question-form.ts'
import { readVisibleQuizQuestionLabels, selectQuizQuestionByLabel, waitForQuizCreateFormLoaded } from '../support/quiz-create-form.ts'
import { clickElement, renderAppAt, setElementValue, setTextValue, waitFor, waitForElement } from '../support/test-harness.tsx'

const prepareValidationWorkspace = async () => {
    const suffix = `${Date.now()}`
    const workspaceGuid = await createWorkspaceInBackend(`WTR quiz validations ${suffix}`)
    const questionTexts = [`2 + 2 = ? ${suffix}`, `3 * 3 = ? ${suffix}`, `4 / 2 = ? ${suffix}`]

    for (const questionText of questionTexts) {
        await createQuestionInBackend(workspaceGuid, questionText, ['A', 'B'])
    }

    return {
        workspaceGuid,
        questionTexts,
    }
}

describe('Quiz.Validations feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    it('shows default quiz-create values and workspace questions', async () => {
        const prepared = await prepareValidationWorkspace()
        ;({ cleanup } = await renderAppAt(`/quiz-create/new?workspaceguid=${prepared.workspaceGuid}`))

        await waitForQuizCreateFormLoaded(prepared.questionTexts.length)

        expect(document.querySelector<HTMLInputElement>('#quiz-title')?.value).to.equal('')
        expect(document.querySelector<HTMLTextAreaElement>('#quiz-description')?.value).to.equal('')
        expect(document.querySelector<HTMLInputElement>('#time-limit')?.value).to.equal('600')
        expect(document.querySelector<HTMLInputElement>('#pass-score')?.value).to.equal('80')
        expect(readVisibleQuizQuestionLabels()).to.have.members(prepared.questionTexts)
    })

    it('blocks empty submit and randomized count above the selected question count', async () => {
        const prepared = await prepareValidationWorkspace()
        ;({ cleanup } = await renderAppAt(`/quiz-create/new?workspaceguid=${prepared.workspaceGuid}`))

        await waitForQuizCreateFormLoaded(prepared.questionTexts.length)

        await clickElement('button[type="submit"]')
        await waitForPathname('/quiz-create/new')
        await waitForValidationErrors(['empty-title', 'few-questions'])

        await setTextValue('#quiz-title', 'Math Quiz')
        await selectQuizQuestionByLabel(prepared.questionTexts[0])
        await selectQuizQuestionByLabel(prepared.questionTexts[2])
        await clickElement('#isRandomized')
        await setTextValue('#quiz-finalCount', '3')
        await clickElement('button[type="submit"]')

        await waitForValidationErrors(['too-many-randomized-questions'])
    })

    it('shows score and time-limit validation errors for invalid numeric values', async () => {
        const prepared = await prepareValidationWorkspace()
        ;({ cleanup } = await renderAppAt(`/quiz-create/new?workspaceguid=${prepared.workspaceGuid}`))

        await waitForQuizCreateFormLoaded(prepared.questionTexts.length)

        await setTextValue('#quiz-title', 'Math Quiz')
        await selectQuizQuestionByLabel(prepared.questionTexts[0])
        await selectQuizQuestionByLabel(prepared.questionTexts[2])

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
        const prepared = await prepareValidationWorkspace()
        ;({ cleanup } = await renderAppAt(`/quiz-create/new?workspaceguid=${prepared.workspaceGuid}`))

        await waitForQuizCreateFormLoaded(prepared.questionTexts.length)

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
