import { expect } from '@esm-bundle/chai'
import { buildQuestion, workspace, workspaceGuid } from '../support/fixtures.ts'
import { installClipboardHarness } from '../support/clipboard-harness.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { readQuestionFormSnapshot, waitForPathname, waitForQuestionEditLoaded } from '../support/question-form.ts'
import { waitForQuestionTakeLoaded } from '../support/question-take-page.ts'
import { renderAppAt, waitFor } from '../support/test-harness.tsx'
import { clickWorkspaceQuestionButton, waitForWorkspaceLoaded } from '../support/workspace-page.ts'

const question = buildQuestion({
    id: 301,
    editId: 'workspace-copy-301',
    question: '2 + 2 = ?',
    answers: ['4', '5'],
    correctAnswers: [0],
    explanations: ['Yes', 'No'],
    questionExplanation: 'Simple arithmetic.',
    workspaceGuid,
})

const routes: readonly Route[] = [
    {
        method: 'GET',
        match: new RegExp(`^/api/workspaces/${workspaceGuid}$`),
        handle: () => ({ body: workspace }),
    },
    {
        method: 'GET',
        match: new RegExp(`^/api/workspaces/${workspaceGuid}/questions$`),
        handle: () => ({
            body: [
                {
                    id: question.id,
                    editId: question.editId,
                    question: question.question,
                    isInAnyQuiz: false,
                },
            ],
        }),
    },
    {
        method: 'GET',
        match: new RegExp(`^/api/workspaces/${workspaceGuid}/quizzes$`),
        handle: () => ({ body: [] }),
    },
    {
        method: 'GET',
        match: new RegExp(`^/api/question/${question.id}$`),
        handle: () => ({ body: question }),
    },
    {
        method: 'GET',
        match: new RegExp(`^/api/question/${question.editId}/edit$`),
        handle: () => ({ body: question }),
    },
]

describe('Workspace copied links (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}
    let restoreClipboard = () => {}

    beforeEach(() => {
        restoreFetch = installApiMock(routes)
        const clipboard = installClipboardHarness()
        restoreClipboard = clipboard.restore
        ;(window as Window & { __wtrClipboard?: typeof clipboard }).__wtrClipboard = clipboard
    })

    afterEach(async () => {
        restoreClipboard()
        restoreFetch()
        delete (window as Window & { __wtrClipboard?: unknown }).__wtrClipboard
        await cleanup()
    })

    it('copies a take-question URL and follows it to the question page', async () => {
        const clipboard = (window as Window & { __wtrClipboard: ReturnType<typeof installClipboardHarness> }).__wtrClipboard
        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await waitForWorkspaceLoaded({ title: workspace.title, questionCount: 1 })

        await clickWorkspaceQuestionButton(question.question, '.copy-take-button button.copy-question')
        await waitFor(() => clipboard.readText() !== '', 5000)

        expect(clipboard.readText()).to.equal(`${window.location.origin}/question/${question.id}`)
        expect(clipboard.readAlerts()).to.deep.equal([])

        await cleanup()
        ;({ cleanup } = await renderAppAt(new URL(clipboard.readText()).pathname))

        await waitForPathname(`/question/${question.id}`)
        await waitForQuestionTakeLoaded({
            questionText: question.question,
            answers: question.answers,
        })
    })

    it('copies an edit-question URL and follows it to the edit page', async () => {
        const clipboard = (window as Window & { __wtrClipboard: ReturnType<typeof installClipboardHarness> }).__wtrClipboard
        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await waitForWorkspaceLoaded({ title: workspace.title, questionCount: 1 })

        await clickWorkspaceQuestionButton(question.question, '.copy-edit-button button.copy-question')
        await waitFor(() => clipboard.readText() !== '', 5000)

        expect(clipboard.readText()).to.equal(`${window.location.origin}/question/${question.editId}/edit`)
        expect(clipboard.readAlerts()).to.deep.equal(['link copied'])

        await cleanup()
        ;({ cleanup } = await renderAppAt(new URL(clipboard.readText()).pathname))

        await waitForPathname(`/question/${question.editId}/edit`)
        await waitForQuestionEditLoaded(question.question)

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: question.question,
            questionExplanation: question.questionExplanation,
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
