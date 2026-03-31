import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { readQuestionFormSnapshot, waitForPathname, waitForQuestionEditLoaded } from '../support/question-form.ts'
import { waitForQuestionTakeLoaded } from '../support/question-take-page.ts'
import { renderAppAt } from '../support/test-harness.tsx'
import {
    clickWorkspaceQuestionButton,
    readWorkspaceQuestionTexts,
    waitForWorkspaceLoaded,
} from '../support/workspace-page.ts'

describe('Workspace row navigation (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    it('takes a question from the workspace list', async () => {
        const suffix = `${Date.now()}`
        const workspaceTitle = `WTR workspace row take ${suffix}`
        const workspaceGuid = await createWorkspaceInBackend(workspaceTitle)
        const questionText = `WTR take question ${suffix}`
        const answers = ['A', 'B'] as const

        const question = await createQuestionInBackend(workspaceGuid, questionText, answers, { correctAnswers: [0] })
        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await waitForWorkspaceLoaded({ title: workspaceTitle, questionCount: 1 })
        expect(readWorkspaceQuestionTexts()).to.deep.equal([questionText])

        await clickWorkspaceQuestionButton(questionText, 'button.take-question')
        await waitForPathname(`/question/${question.id}`)
        await waitForQuestionTakeLoaded({
            questionText,
            answers,
        })
    })

    it('edits a question from the workspace list', async () => {
        const suffix = `${Date.now()}`
        const workspaceTitle = `WTR workspace row edit ${suffix}`
        const workspaceGuid = await createWorkspaceInBackend(workspaceTitle)
        const questionText = `What is the capital of Czech Republic? ${suffix}`
        const answers = ['Brno', 'Prague', 'Berlin'] as const
        const explanations = ['No Brno', 'Yes', 'Germany'] as const
        const questionExplanation = 'Czechia is a country in Europe. Czechs love beer.'

        const question = await createQuestionInBackend(workspaceGuid, questionText, answers, {
            correctAnswers: [1],
            explanations,
            questionExplanation,
        })
        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await waitForWorkspaceLoaded({ title: workspaceTitle, questionCount: 1 })

        await clickWorkspaceQuestionButton(questionText, 'button.edit-question')
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
                { text: 'Brno', isCorrect: false, explanation: 'No Brno' },
                { text: 'Prague', isCorrect: true, explanation: 'Yes' },
                { text: 'Berlin', isCorrect: false, explanation: 'Germany' },
            ],
        })
    })
})
