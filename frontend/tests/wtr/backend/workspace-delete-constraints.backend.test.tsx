import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createQuizInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { renderAppAt, waitFor } from '../support/test-harness.tsx'
import {
    clickWorkspaceQuestionButton,
    readWorkspaceQuestionTexts,
    waitForWorkspaceLoaded,
    workspaceQuestionHasDeleteButton,
} from '../support/workspace-page.ts'

describe('Workspace delete constraints (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    it('deletes a standalone question and leaves the workspace empty', async () => {
        const suffix = `${Date.now()}`
        const workspaceTitle = `WTR workspace delete ${suffix}`
        const workspaceGuid = await createWorkspaceInBackend(workspaceTitle)
        const questionText = `WTR delete question ${suffix}`

        await createQuestionInBackend(workspaceGuid, questionText, ['A', 'B'])
        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await waitForWorkspaceLoaded({ title: workspaceTitle, questionCount: 1 })

        expect(readWorkspaceQuestionTexts()).to.deep.equal([questionText])
        expect(workspaceQuestionHasDeleteButton(questionText)).to.equal(true)

        await clickWorkspaceQuestionButton(questionText, 'button.delete-question')

        await waitFor(() => readWorkspaceQuestionTexts().length === 0, 5000)
        expect(readWorkspaceQuestionTexts()).to.deep.equal([])
    })

    it('hides the delete button for a question already used in a quiz', async () => {
        const suffix = `${Date.now()}`
        const workspaceTitle = `WTR workspace protected delete ${suffix}`
        const quizTitle = `Math Quiz ${suffix}`
        const workspaceGuid = await createWorkspaceInBackend(workspaceTitle)
        const protectedQuestionText = `WTR protected question ${suffix}`
        const standaloneQuestionText = `WTR standalone question ${suffix}`

        const protectedQuestion = await createQuestionInBackend(workspaceGuid, protectedQuestionText, ['A', 'B'])
        await createQuestionInBackend(workspaceGuid, standaloneQuestionText, ['C', 'D'])
        await createQuizInBackend({
            workspaceGuid,
            questionIds: [protectedQuestion.id],
            title: quizTitle,
        })

        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await waitForWorkspaceLoaded({ title: workspaceTitle, questionCount: 2 })
        await waitFor(
            () =>
                Array.from(document.querySelectorAll<HTMLElement>('.quiz-item')).some(item =>
                    item.textContent?.includes(quizTitle),
                ),
            5000,
        )

        expect(workspaceQuestionHasDeleteButton(protectedQuestionText)).to.equal(false)
        expect(workspaceQuestionHasDeleteButton(standaloneQuestionText)).to.equal(true)
    })
})
