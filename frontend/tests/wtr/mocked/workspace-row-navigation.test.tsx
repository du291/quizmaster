import { expect } from '@esm-bundle/chai'
import { buildQuestion, workspace, workspaceGuid } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { waitForQuestionEditLoaded, readQuestionFormSnapshot, waitForPathname } from '../support/question-form.ts'
import { waitForQuestionTakeLoaded } from '../support/question-take-page.ts'
import { renderAppAt } from '../support/test-harness.tsx'
import {
    clickWorkspaceQuestionButton,
    readWorkspaceQuestionTexts,
    waitForWorkspaceLoaded,
} from '../support/workspace-page.ts'

const takeQuestion = buildQuestion({
    id: 201,
    editId: 'workspace-row-take-201',
    question: '2 + 2 = ?',
    answers: ['4', '5'],
    correctAnswers: [0],
    workspaceGuid,
})

const editQuestion = buildQuestion({
    id: 202,
    editId: 'workspace-row-edit-202',
    question: 'What is the capital of Czech Republic?',
    answers: ['Brno', 'Prague', 'Berlin'],
    correctAnswers: [1],
    explanations: ['No Brno', 'Yes', 'Germany'],
    questionExplanation: 'Czechia is a country in Europe. Czechs love beer.',
    workspaceGuid,
})

const questionListItems = [
    {
        id: takeQuestion.id,
        editId: takeQuestion.editId,
        question: takeQuestion.question,
        isInAnyQuiz: false,
    },
    {
        id: editQuestion.id,
        editId: editQuestion.editId,
        question: editQuestion.question,
        isInAnyQuiz: false,
    },
] as const

const routes: readonly Route[] = [
    {
        method: 'GET',
        match: new RegExp(`^/api/workspaces/${workspaceGuid}$`),
        handle: () => ({ body: workspace }),
    },
    {
        method: 'GET',
        match: new RegExp(`^/api/workspaces/${workspaceGuid}/questions$`),
        handle: () => ({ body: questionListItems }),
    },
    {
        method: 'GET',
        match: new RegExp(`^/api/workspaces/${workspaceGuid}/quizzes$`),
        handle: () => ({ body: [] }),
    },
    {
        method: 'GET',
        match: new RegExp(`^/api/question/${takeQuestion.id}$`),
        handle: () => ({ body: takeQuestion }),
    },
    {
        method: 'GET',
        match: new RegExp(`^/api/question/${editQuestion.editId}/edit$`),
        handle: () => ({ body: editQuestion }),
    },
]

describe('Workspace row navigation (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    beforeEach(() => {
        restoreFetch = installApiMock(routes)
    })

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    it('takes a question from the workspace list', async () => {
        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await waitForWorkspaceLoaded({ title: workspace.title, questionCount: questionListItems.length })
        expect(readWorkspaceQuestionTexts()).to.include.members([takeQuestion.question, editQuestion.question])

        await clickWorkspaceQuestionButton(takeQuestion.question, 'button.take-question')
        await waitForPathname(`/question/${takeQuestion.id}`)
        await waitForQuestionTakeLoaded({
            questionText: takeQuestion.question,
            answers: takeQuestion.answers,
        })
    })

    it('edits a question from the workspace list', async () => {
        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await waitForWorkspaceLoaded({ title: workspace.title, questionCount: questionListItems.length })

        await clickWorkspaceQuestionButton(editQuestion.question, 'button.edit-question')
        await waitForPathname(`/question/${editQuestion.editId}/edit`)
        await waitForQuestionEditLoaded(editQuestion.question)

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: editQuestion.question,
            questionExplanation: editQuestion.questionExplanation,
            isMultipleChoice: false,
            showExplanations: true,
            easyModeVisible: false,
            easyModeChecked: false,
            answers: [
                { text: 'Brno', isCorrect: false, explanation: 'No Brno' },
                { text: 'Prague', isCorrect: true, explanation: 'Yes' },
                { text: 'Berlin', isCorrect: false, explanation: 'Germany' },
            ],
        })
    })
})
