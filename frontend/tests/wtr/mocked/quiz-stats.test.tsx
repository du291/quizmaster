import { expect } from '@esm-bundle/chai'
import { createSimulatedClock } from '../../../src/infrastructure/clock.tsx'
import { buildQuestion, buildQuizFixture } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { answerQuestion, goToResultsPage, waitForQuestionReady } from '../support/quiz-flow.ts'
import { advanceClockBy, clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const workspaceGuid = 'workspace-wtr-stats-1'

const questionA = buildQuestion({
    id: 81,
    question: 'What color is the sky?',
    answers: ['Blue', 'Green'],
})

const questionB = buildQuestion({
    id: 82,
    question: 'What is the capital of France?',
    answers: ['Paris', 'Lyon'],
})

const statsQuiz = buildQuizFixture({
    id: 4001,
    title: 'Stats Quiz',
    description: 'Statistics coverage',
    mode: 'exam',
    difficulty: 'keep-question',
    passScore: 85,
    timeLimit: 120,
    questions: [questionA, questionB],
})

const installQuizStatsMockApi = () => {
    const routes: readonly Route[] = [
        {
            method: 'GET',
            match: new RegExp(`^/api/workspaces/${workspaceGuid}$`),
            handle: () => ({ body: { guid: workspaceGuid, title: 'Stats Workspace' } }),
        },
        {
            method: 'GET',
            match: new RegExp(`^/api/workspaces/${workspaceGuid}/questions$`),
            handle: () => ({ body: [] }),
        },
        {
            method: 'GET',
            match: new RegExp(`^/api/workspaces/${workspaceGuid}/quizzes$`),
            handle: () => ({ body: [{ id: statsQuiz.id, title: statsQuiz.title }] }),
        },
        {
            method: 'GET',
            match: /^\/api\/quiz\/\d+$/,
            handle: request => {
                const quizId = Number.parseInt(request.path.split('/').pop() ?? '0')
                if (quizId !== statsQuiz.id) throw new Error(`Quiz not found: ${quizId}`)
                return { body: statsQuiz }
            },
        },
    ]

    return installApiMock(routes)
}

const waitForStatsPage = async () => {
    await waitFor(
        () =>
            window.location.pathname === `/quiz/${statsQuiz.id}/stats` &&
            textContent('.quiz-stats h2') === `Statistics for quiz: ${statsQuiz.title}`,
    )
}

const statsRows = () =>
    Array.from(document.querySelectorAll<HTMLTableRowElement>('table tbody tr')).map(row =>
        Array.from(row.querySelectorAll<HTMLTableCellElement>('td')).map(cell => cell.textContent?.trim() ?? ''),
    )

const waitForStatsRows = async (count: number) => {
    await waitFor(() => statsRows().length === count)
}

const clickStatsButtonForQuiz = async (title: string) => {
    await waitFor(() =>
        Array.from(document.querySelectorAll<HTMLElement>('.quiz-item')).some(item => item.textContent?.includes(title)),
    )

    const target = Array.from(document.querySelectorAll<HTMLElement>('.quiz-item')).find(item =>
        item.textContent?.includes(title),
    )
    if (!target) throw new Error(`Quiz item not found: ${title}`)

    const statsButton = target.querySelector<HTMLButtonElement>('button.stats-quiz')
    if (!statsButton) throw new Error(`Statistics button not found for ${title}`)
    statsButton.click()
}

const finishQuiz = async ({
    firstQuestionAnswers,
    secondQuestionAnswers,
    advanceDurationMs = 0,
}: {
    readonly firstQuestionAnswers: readonly string[]
    readonly secondQuestionAnswers: readonly string[]
    readonly advanceDurationMs?: number
}) => {
    await clickElement('#start')
    await waitForQuestionReady({
        quizId: statsQuiz.id,
        questionIndex: 0,
        question: questionA,
    })

    await answerQuestion({
        quizId: statsQuiz.id,
        questionIndex: 0,
        question: questionA,
        answers: firstQuestionAnswers,
    })
    await waitForQuestionReady({
        quizId: statsQuiz.id,
        questionIndex: 1,
        question: questionB,
    })

    if (advanceDurationMs > 0) {
        await advanceClockBy(clock, advanceDurationMs)
    }

    await answerQuestion({
        quizId: statsQuiz.id,
        questionIndex: 1,
        question: questionB,
        answers: secondQuestionAnswers,
    })
    await goToResultsPage()
}

let clock = createSimulatedClock(1_700_000_000_000)

describe('Quiz.Stats feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        sessionStorage.clear()
        await cleanup()
    })

    it('opens the stats page from the workspace and shows no rows for a new quiz', async () => {
        restoreFetch = installQuizStatsMockApi()
        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await clickStatsButtonForQuiz(statsQuiz.title)
        await waitForStatsPage()
        await waitForStatsRows(0)

        expect(statsRows()).to.deep.equal([])
    })

    it('shows a successful run with 100 score and 10 seconds duration', async () => {
        restoreFetch = installQuizStatsMockApi()
        clock = createSimulatedClock(1_700_000_000_000)
        ;({ cleanup } = await renderAppAt(`/quiz/${statsQuiz.id}`, { clock }))

        await finishQuiz({
            firstQuestionAnswers: ['Blue'],
            secondQuestionAnswers: ['Paris'],
            advanceDurationMs: 10_000,
        })

        await cleanup()
        ;({ cleanup } = await renderAppAt(`/quiz/${statsQuiz.id}/stats`, { clock }))

        await waitForStatsPage()
        await waitForStatsRows(1)

        expect(statsRows()).to.deep.equal([['10 seconds', '100']])
    })

    it('shows an unsuccessful run with 0 score', async () => {
        restoreFetch = installQuizStatsMockApi()
        clock = createSimulatedClock(1_700_000_100_000)
        ;({ cleanup } = await renderAppAt(`/quiz/${statsQuiz.id}`, { clock }))

        await finishQuiz({
            firstQuestionAnswers: ['Green'],
            secondQuestionAnswers: ['Lyon'],
        })

        await cleanup()
        ;({ cleanup } = await renderAppAt(`/quiz/${statsQuiz.id}/stats`, { clock }))

        await waitForStatsPage()
        await waitForStatsRows(1)

        expect(statsRows()).to.deep.equal([['0 seconds', '0']])
    })
})
