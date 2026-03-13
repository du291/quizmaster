import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createQuizInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { answerQuestion, goToResultsPage } from '../support/quiz-flow.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const startQuiz = async (quizId: number) => {
    await clickElement('#start')
    await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)
}

const completeQuizWithCorrectAnswers = async ({
    quizId,
    quizQuestions,
}: {
    readonly quizId: number
    readonly quizQuestions: readonly {
        readonly id: number
        readonly question: string
        readonly answers: readonly string[]
    }[]
}) => {
    for (const [questionIndex, question] of quizQuestions.entries()) {
        await answerQuestion({
            quizId,
            questionIndex,
            question,
            answers: [question.answers[0]],
        })
    }

    await goToResultsPage()
}

const assertPerfectScore = async ({ expectedQuestionCount, passScore }: { expectedQuestionCount: string; passScore: string }) => {
    await waitFor(() => textContent('#total-questions') === expectedQuestionCount)

    expect(textContent('#correct-answers')).to.equal(expectedQuestionCount)
    expect(textContent('#percentage-result')).to.equal('100')
    expect(textContent('#text-result')).to.equal('passed')
    expect(textContent('#pass-score')).to.equal(passScore)
}

const prepareQuiz = async ({
    title,
    size,
}: {
    readonly title: string
    readonly size?: number
}) => {
    const suffix = `${Date.now()}-${size ?? 'full'}`
    const workspaceGuid = await createWorkspaceInBackend(`WTR Take Length Workspace ${suffix}`)

    const questionSpecs = [
        {
            question: `Which planet is known as the Red Planet? ${suffix}`,
            answers: ['Mars', 'Venus'] as const,
        },
        {
            question: `What's the capital city of Australia? ${suffix}`,
            answers: ['Sydney', 'Canberra'] as const,
        },
        {
            question: `Which fruit has seeds on the outside? ${suffix}`,
            answers: ['Strawberry', 'Blueberry'] as const,
        },
    ] as const

    const createdQuestions = [] as {
        readonly id: number
        readonly question: string
        readonly answers: readonly string[]
    }[]

    for (const questionSpec of questionSpecs) {
        const question = await createQuestionInBackend(workspaceGuid, questionSpec.question, questionSpec.answers)
        createdQuestions.push({
            id: question.id,
            question: questionSpec.question,
            answers: questionSpec.answers,
        })
    }

    const quizId = await createQuizInBackend({
        workspaceGuid,
        questionIds: createdQuestions.map(question => question.id),
        title: `${title} ${suffix}`,
        description: 'Backend quiz length smoke',
        mode: 'exam',
        passScore: 100,
        timeLimit: 120,
        size,
    })

    return {
        quizId,
        quizQuestions: size ? createdQuestions.slice(0, size) : createdQuestions,
        expectedQuestionCount: String(size ?? createdQuestions.length),
    }
}

describe('Quiz.Take.Length feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        sessionStorage.clear()
        await cleanup()
    })

    it('uses the configured quiz size for the welcome-page count and served question total', async () => {
        const { quizId, quizQuestions, expectedQuestionCount } = await prepareQuiz({
            title: 'Normal',
            size: 2,
        })
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await waitFor(() => textContent('#question-count') === expectedQuestionCount)
        await startQuiz(quizId)
        await completeQuizWithCorrectAnswers({ quizId, quizQuestions })
        await assertPerfectScore({ expectedQuestionCount, passScore: '100' })
    })

    it('uses the full question pool when quiz size is not configured', async () => {
        const { quizId, quizQuestions, expectedQuestionCount } = await prepareQuiz({
            title: 'Empty',
        })
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await waitFor(() => textContent('#question-count') === expectedQuestionCount)
        await startQuiz(quizId)
        await completeQuizWithCorrectAnswers({ quizId, quizQuestions })
        await assertPerfectScore({ expectedQuestionCount, passScore: '100' })
    })
})
