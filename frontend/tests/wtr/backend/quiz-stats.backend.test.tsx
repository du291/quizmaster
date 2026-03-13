import { expect } from '@esm-bundle/chai'
import { createSimulatedClock } from '../../../src/infrastructure/clock.tsx'
import { createQuestionInBackend, createQuizInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { answerQuestion, goToResultsPage, waitForQuestionReady } from '../support/quiz-flow.ts'
import { advanceClockBy, clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

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

const prepareQuiz = async () => {
    const suffix = `${Date.now()}`
    const workspaceGuid = await createWorkspaceInBackend(`WTR Stats Workspace ${suffix}`)
    const questionAText = `What color is the sky? ${suffix}`
    const questionBText = `What is the capital of France? ${suffix}`
    const questionAAnswers = ['Blue', 'Green'] as const
    const questionBAnswers = ['Paris', 'Lyon'] as const

    const questionA = await createQuestionInBackend(workspaceGuid, questionAText, questionAAnswers)
    const questionB = await createQuestionInBackend(workspaceGuid, questionBText, questionBAnswers)

    const quizTitle = `Stats Quiz ${suffix}`
    const quizId = await createQuizInBackend({
        workspaceGuid,
        questionIds: [questionA.id, questionB.id],
        title: quizTitle,
        description: 'Statistics coverage',
        mode: 'exam',
        difficulty: 'keep-question',
        passScore: 85,
        timeLimit: 120,
    })

    return {
        workspaceGuid,
        quizId,
        quizTitle,
        quizQuestions: [
            { id: questionA.id, question: questionAText, answers: questionAAnswers },
            { id: questionB.id, question: questionBText, answers: questionBAnswers },
        ] as const,
    }
}

const waitForStatsPage = async (quizId: number, title: string) => {
    await waitFor(
        () =>
            window.location.pathname === `/quiz/${quizId}/stats` &&
            textContent('.quiz-stats h2') === `Statistics for quiz: ${title}`,
    )
}

const finishQuiz = async ({
    quizId,
    quizQuestions,
    firstQuestionAnswers,
    secondQuestionAnswers,
    advanceDurationMs = 0,
    clock,
}: {
    readonly quizId: number
    readonly quizQuestions: readonly [
        { readonly id: number; readonly question: string; readonly answers: readonly string[] },
        { readonly id: number; readonly question: string; readonly answers: readonly string[] },
    ]
    readonly firstQuestionAnswers: readonly string[]
    readonly secondQuestionAnswers: readonly string[]
    readonly advanceDurationMs?: number
    readonly clock: ReturnType<typeof createSimulatedClock>
}) => {
    await clickElement('#start')
    await waitForQuestionReady({
        quizId,
        questionIndex: 0,
        question: quizQuestions[0],
    })

    await answerQuestion({
        quizId,
        questionIndex: 0,
        question: quizQuestions[0],
        answers: firstQuestionAnswers,
    })
    await waitForQuestionReady({
        quizId,
        questionIndex: 1,
        question: quizQuestions[1],
    })

    if (advanceDurationMs > 0) {
        await advanceClockBy(clock, advanceDurationMs)
    }

    await answerQuestion({
        quizId,
        questionIndex: 1,
        question: quizQuestions[1],
        answers: secondQuestionAnswers,
    })
    await goToResultsPage()
}

describe('Quiz.Stats feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        sessionStorage.clear()
        await cleanup()
    })

    it('opens the stats page from the workspace and shows no rows for a new quiz', async () => {
        const { workspaceGuid, quizId, quizTitle } = await prepareQuiz()
        ;({ cleanup } = await renderAppAt(`/workspace/${workspaceGuid}`))

        await clickStatsButtonForQuiz(quizTitle)
        await waitForStatsPage(quizId, quizTitle)
        await waitForStatsRows(0)

        expect(statsRows()).to.deep.equal([])
    })

    it('shows a successful run with 100 score and 10 seconds duration', async () => {
        const { quizId, quizTitle, quizQuestions } = await prepareQuiz()
        const clock = createSimulatedClock(1_700_000_000_000)
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`, { clock }))

        await finishQuiz({
            quizId,
            quizQuestions,
            firstQuestionAnswers: ['Blue'],
            secondQuestionAnswers: ['Paris'],
            advanceDurationMs: 10_000,
            clock,
        })

        await cleanup()
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}/stats`, { clock }))

        await waitForStatsPage(quizId, quizTitle)
        await waitForStatsRows(1)

        expect(statsRows()).to.deep.equal([['10 seconds', '100']])
    })

    it('shows an unsuccessful run with 0 score', async () => {
        const { quizId, quizTitle, quizQuestions } = await prepareQuiz()
        const clock = createSimulatedClock(1_700_000_100_000)
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`, { clock }))

        await finishQuiz({
            quizId,
            quizQuestions,
            firstQuestionAnswers: ['Green'],
            secondQuestionAnswers: ['Lyon'],
            clock,
        })

        await cleanup()
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}/stats`, { clock }))

        await waitForStatsPage(quizId, quizTitle)
        await waitForStatsRows(1)

        expect(statsRows()).to.deep.equal([['0 seconds', '0']])
    })
})
