import { expect } from '@esm-bundle/chai'
import { questionListItems, workspaceGuid } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { readVisibleQuizQuestionLabels, waitForQuizCreateFormLoaded } from '../support/quiz-create-form.ts'
import { renderAppAt, setTextValue, waitFor } from '../support/test-harness.tsx'

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

describe('Quiz.FilterQuestions feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    beforeEach(() => {
        const routes: readonly Route[] = [
            {
                method: 'GET',
                match: new RegExp(`^/api/workspaces/${workspaceGuid}/questions$`),
                handle: () => ({ body: questionListItems }),
            },
        ]

        restoreFetch = installApiMock(routes)
    })

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    it('filters visible questions in the quiz create form', async () => {
        ;({ cleanup } = await renderAppAt(`/quiz-create/new?workspaceguid=${workspaceGuid}`))

        await waitForQuizCreateFormLoaded(questionListItems.length)

        for (const testCase of filterCases) {
            await setTextValue('#question-filter', testCase.filter)
            await expectVisibleQuestions(testCase.visible, testCase.hidden)
        }
    })
})
