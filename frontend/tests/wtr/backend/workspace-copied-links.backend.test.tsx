import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { installClipboardHarness } from '../support/clipboard-harness.ts'
import { readQuestionFormSnapshot, waitForPathname, waitForQuestionEditLoaded } from '../support/question-form.ts'
import { waitForQuestionTakeLoaded } from '../support/question-take-page.ts'
import { renderAppAt, waitFor } from '../support/test-harness.tsx'
import { clickWorkspaceQuestionButton, waitForWorkspaceLoaded } from '../support/workspace-page.ts'

describe('Workspace copied links (WTR real backend)', () => {
    let cleanup = async () => {}
    let restoreClipboard = () => {}

    beforeEach(() => {
        const clipboard = installClipboardHarness()
        restoreClipboard = clipboard.restore
        ;(window as Window & { __wtrClipboard?: typeof clipboard }).__wtrClipboard = clipboard
    })

    afterEach(async () => {
        restoreClipboard()
        delete (window as Window & { __wtrClipboard?: unknown }).__wtrClipboard
        await cleanup()
    })

    it('copies a take-question URL and follows it to the question page', async () => {
        const suffix = `${Date.now()}`
        const workspaceTitle = `WTR workspace copy take ${suffix}`
        const workspaceGuid = await createWorkspaceInBackend(workspaceTitle)
        const questionText = `WTR copy take ${suffix}`
        const answers = ['A', 'B'] as const
        const clipboard = (window as Window & { __wtrClipboard: ReturnType<typeof installClipboardHarness> }).__wtrClipboard

        const question = await createQuestionInBackend(workspaceGuid, questionText, answers, { correctAnswers: [0] })
        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await waitForWorkspaceLoaded({ title: workspaceTitle, questionCount: 1 })

        await clickWorkspaceQuestionButton(questionText, '.copy-take-button button.copy-question')
        await waitFor(() => clipboard.readText() !== '', 5000)

        expect(clipboard.readText()).to.equal(`${window.location.origin}/question/${question.id}`)
        expect(clipboard.readAlerts()).to.deep.equal([])

        await cleanup()
        ;({ cleanup } = await renderAppAt(new URL(clipboard.readText()).pathname))

        await waitForPathname(`/question/${question.id}`)
        await waitForQuestionTakeLoaded({
            questionText,
            answers,
        })
    })

    it('copies an edit-question URL and follows it to the edit page', async () => {
        const suffix = `${Date.now()}`
        const workspaceTitle = `WTR workspace copy edit ${suffix}`
        const workspaceGuid = await createWorkspaceInBackend(workspaceTitle)
        const questionText = `WTR copy edit ${suffix}`
        const answers = ['4', '5'] as const
        const explanations = ['Yes', 'No'] as const
        const questionExplanation = 'Simple arithmetic.'
        const clipboard = (window as Window & { __wtrClipboard: ReturnType<typeof installClipboardHarness> }).__wtrClipboard

        const question = await createQuestionInBackend(workspaceGuid, questionText, answers, {
            correctAnswers: [0],
            explanations,
            questionExplanation,
        })
        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await waitForWorkspaceLoaded({ title: workspaceTitle, questionCount: 1 })

        await clickWorkspaceQuestionButton(questionText, '.copy-edit-button button.copy-question')
        await waitFor(() => clipboard.readText() !== '', 5000)

        expect(clipboard.readText()).to.equal(`${window.location.origin}/question/${question.editId}/edit`)
        expect(clipboard.readAlerts()).to.deep.equal(['link copied'])

        await cleanup()
        ;({ cleanup } = await renderAppAt(new URL(clipboard.readText()).pathname))

        await waitForPathname(`/question/${question.editId}/edit`)
        await waitForQuestionEditLoaded(questionText)

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText,
            questionExplanation,
            isMultipleChoice: false,
            showExplanations: true,
            easyModeVisible: false,
            easyModeChecked: false,
            answers: [
                { text: '4', isCorrect: true, explanation: 'Yes' },
                { text: '5', isCorrect: false, explanation: 'No' },
            ],
        })
    })
})
