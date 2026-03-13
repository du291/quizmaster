import { expect } from '@esm-bundle/chai'
import { buildQuestion, buildQuizFixture } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { answerQuestion, goToResultsPage } from '../support/quiz-flow.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const questionPool = [
    buildQuestion({
        id: 51,
        question: 'Which planet is known as the Red Planet?',
        answers: ['Mars', 'Venus'],
    }),
    buildQuestion({
        id: 52,
        question: "What's the capital city of Australia?",
        answers: ['Sydney', 'Canberra'],
    }),
    buildQuestion({
        id: 53,
        question: 'Which fruit is known for having seeds on the outside?',
        answers: ['Strawberry', 'Blueberry'],
    }),
] as const

const sizedQuiz = buildQuizFixture({
    id: 3601,
    title: 'Normal',
    description: 'Quiz with explicit served size',
    mode: 'exam',
    passScore: 100,
    timeLimit: 120,
    size: 2,
    questions: questionPool.slice(0, 2),
})

const fullPoolQuiz = buildQuizFixture({
    id: 3602,
    title: 'Empty',
    description: 'Quiz that serves the full question pool',
    mode: 'exam',
    passScore: 100,
    timeLimit: 120,
    questions: questionPool,
})

const quizzesById = new Map<number, typeof sizedQuiz | typeof fullPoolQuiz>([
    [sizedQuiz.id, sizedQuiz],
    [fullPoolQuiz.id, fullPoolQuiz],
])

const installQuizTakeLengthMockApi = () => {
    const routes: readonly Route[] = [
        {
            method: 'GET',
            match: /^\/api\/quiz\/\d+$/,
            handle: request => {
                const quizId = Number.parseInt(request.path.split('/').pop() ?? '0')
                const quiz = quizzesById.get(quizId)
                if (!quiz) throw new Error(`Quiz not found: ${quizId}`)
                return { body: quiz }
            },
        },
    ]

    return installApiMock(routes)
}

const startQuiz = async (quizId: number) => {
    await clickElement('#start')
    await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)
}

const completeQuizWithCorrectAnswers = async (quizId: number, quizQuestions: readonly typeof questionPool[number][]) => {
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

describe('Quiz.Take.Length feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        sessionStorage.clear()
        await cleanup()
    })

    it('uses the configured quiz size for the welcome-page count and served question total', async () => {
        restoreFetch = installQuizTakeLengthMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${sizedQuiz.id}`))

        await waitFor(() => textContent('#question-count') === '2')
        await startQuiz(sizedQuiz.id)
        await completeQuizWithCorrectAnswers(sizedQuiz.id, sizedQuiz.questions)
        await assertPerfectScore({ expectedQuestionCount: '2', passScore: '100' })
    })

    it('uses the full question pool when quiz size is not configured', async () => {
        restoreFetch = installQuizTakeLengthMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${fullPoolQuiz.id}`))

        await waitFor(() => textContent('#question-count') === '3')
        await startQuiz(fullPoolQuiz.id)
        await completeQuizWithCorrectAnswers(fullPoolQuiz.id, fullPoolQuiz.questions)
        await assertPerfectScore({ expectedQuestionCount: '3', passScore: '100' })
    })
})
