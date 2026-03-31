import { expect } from '@esm-bundle/chai'
import type { QuestionListItem } from '../../../src/model/question-list-item.ts'
import type { QuizListItem } from '../../../src/model/quiz-list-item.ts'
import { workspace, workspaceGuid } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { waitFor } from '../support/test-harness.tsx'
import {
    clickWorkspaceQuestionButton,
    readWorkspaceQuestionTexts,
    waitForWorkspaceLoaded,
    workspaceQuestionHasDeleteButton,
} from '../support/workspace-page.ts'
import { renderAppAt } from '../support/test-harness.tsx'

const deletableQuestion: QuestionListItem = {
    id: 1,
    editId: 'workspace-delete-1',
    question: '2 + 2 = ?',
    isInAnyQuiz: false,
}

const protectedQuestion: QuestionListItem = {
    id: 2,
    editId: 'workspace-delete-2',
    question: 'Jaký nábytek má Ikea?',
    isInAnyQuiz: true,
}

const buildWorkspaceRoutes = (
    initialQuestions: readonly QuestionListItem[],
    quizzes: readonly QuizListItem[] = [],
): readonly Route[] => {
    let workspaceQuestions = [...initialQuestions]

    return [
        {
            method: 'GET',
            match: new RegExp(`^/api/workspaces/${workspaceGuid}$`),
            handle: () => ({ body: workspace }),
        },
        {
            method: 'GET',
            match: new RegExp(`^/api/workspaces/${workspaceGuid}/questions$`),
            handle: () => ({ body: workspaceQuestions }),
        },
        {
            method: 'GET',
            match: new RegExp(`^/api/workspaces/${workspaceGuid}/quizzes$`),
            handle: () => ({ body: quizzes }),
        },
        {
            method: 'DELETE',
            match: /^\/api\/question\/\d+$/,
            handle: request => {
                const questionId = Number.parseInt(request.path.split('/').pop() ?? '0')
                workspaceQuestions = workspaceQuestions.filter(question => question.id !== questionId)
                return { body: {} }
            },
        },
    ]
}

describe('Workspace delete constraints (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    it('deletes a standalone question and leaves the workspace empty', async () => {
        restoreFetch = installApiMock(buildWorkspaceRoutes([deletableQuestion]))
        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await waitForWorkspaceLoaded({ title: workspace.title, questionCount: 1 })

        expect(readWorkspaceQuestionTexts()).to.deep.equal([deletableQuestion.question])
        expect(workspaceQuestionHasDeleteButton(deletableQuestion.question)).to.equal(true)

        await clickWorkspaceQuestionButton(deletableQuestion.question, 'button.delete-question')

        await waitFor(() => readWorkspaceQuestionTexts().length === 0, 5000)
        expect(readWorkspaceQuestionTexts()).to.deep.equal([])
    })

    it('hides the delete button for a question already used in a quiz', async () => {
        restoreFetch = installApiMock(
            buildWorkspaceRoutes([protectedQuestion, deletableQuestion], [{ id: 9001, title: 'Math Quiz' }]),
        )
        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await waitForWorkspaceLoaded({ title: workspace.title, questionCount: 2 })
        await waitFor(
            () =>
                Array.from(document.querySelectorAll<HTMLElement>('.quiz-item')).some(item =>
                    item.textContent?.includes('Math Quiz'),
                ),
            5000,
        )

        expect(workspaceQuestionHasDeleteButton(protectedQuestion.question)).to.equal(false)
        expect(workspaceQuestionHasDeleteButton(deletableQuestion.question)).to.equal(true)
    })
})
