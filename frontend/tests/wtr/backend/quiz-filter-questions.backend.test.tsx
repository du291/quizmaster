import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { readVisibleQuizQuestionLabels, waitForQuizCreateFormLoaded } from '../support/quiz-create-form.ts'
import { renderAppAt, setTextValue, waitFor } from '../support/test-harness.tsx'

const backendQuestionTexts = [
    '2 + 2 = ?',
    '3 * 3 = ?',
    '4 / 2 = ?',
    'Jaký nábytek má Ikea?',
    'Jaké nádobí má Ikea?',
    'Jaký venkovní Nábytek má Ikea?',
] as const

const filterCases = [
    {
        filter: '2',
        visible: ['2 + 2 = ?', '4 / 2 = ?'],
        hidden: ['3 * 3 = ?', 'Jaký nábytek má Ikea?'],
    },
    {
        filter: 'Ikea',
        visible: ['Jaký nábytek má Ikea?', 'Jaké nádobí má Ikea?'],
        hidden: ['2 + 2 = ?', '3 * 3 = ?'],
    },
    {
        filter: 'nábytek',
        visible: ['Jaký nábytek má Ikea?', 'Jaký venkovní Nábytek má Ikea?'],
        hidden: ['2 + 2 = ?', '4 / 2 = ?'],
    },
] as const

const expectVisibleQuestions = async (visible: readonly string[], hidden: readonly string[]) => {
    await waitFor(() => {
        const labels = readVisibleQuizQuestionLabels()
        return visible.every(question => labels.includes(question)) && hidden.every(question => !labels.includes(question))
    })

    const labels = readVisibleQuizQuestionLabels()
    expect(labels).to.include.members(visible)
    expect(labels).not.to.include.members(hidden)
}

const prepareWorkspace = async () => {
    const workspaceGuid = await createWorkspaceInBackend(`WTR quiz filters ${Date.now()}`)

    for (const questionText of backendQuestionTexts) {
        await createQuestionInBackend(workspaceGuid, questionText, ['A', 'B'])
    }

    return workspaceGuid
}

describe('Quiz.FilterQuestions feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    it('filters visible questions in the quiz create form', async () => {
        const workspaceGuid = await prepareWorkspace()
        ;({ cleanup } = await renderAppAt(`/quiz-create/new?workspaceguid=${workspaceGuid}`))

        await waitForQuizCreateFormLoaded(backendQuestionTexts.length)

        for (const testCase of filterCases) {
            await setTextValue('#question-filter', testCase.filter)
            await expectVisibleQuestions(testCase.visible, testCase.hidden)
        }
    })
})
