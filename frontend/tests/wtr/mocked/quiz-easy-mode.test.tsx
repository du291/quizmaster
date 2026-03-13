import { expect } from '@esm-bundle/chai'
import { buildQuestion, buildQuizFixture } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { answerQuestion, waitForQuestionReady } from '../support/quiz-flow.ts'
import { clickElement, renderAppAt, waitFor } from '../support/test-harness.tsx'

type Difficulty = 'easy' | 'hard' | 'keep-question'

const singleChoiceQuestion = buildQuestion({
    id: 71,
    question: 'Capital of France?',
    answers: ['Paris', 'Nice'],
})

const easyQuestion = buildQuestion({
    id: 72,
    question: 'Food?',
    answers: ['Pork', 'Fish', 'Shoe'],
    correctAnswers: [0, 1],
    easyMode: true,
})

const hardQuestion = buildQuestion({
    id: 73,
    question: 'Animal?',
    answers: ['Dog', 'Cat', 'Bird', 'Car'],
    correctAnswers: [0, 1, 2],
    easyMode: false,
})

const buildQuiz = (difficulty: Difficulty) =>
    buildQuizFixture({
        id: 3901,
        title: `Quiz Difficulty ${difficulty}`,
        description: 'Quiz difficulty override coverage',
        mode: 'exam',
        difficulty,
        passScore: 85,
        timeLimit: 120,
        questions: [singleChoiceQuestion, easyQuestion, hardQuestion],
    })

const installQuizEasyModeMockApi = (difficulty: Difficulty) => {
    const quiz = buildQuiz(difficulty)
    const routes: readonly Route[] = [
        {
            method: 'GET',
            match: /^\/api\/quiz\/\d+$/,
            handle: request => {
                const quizId = Number.parseInt(request.path.split('/').pop() ?? '0')
                if (quizId !== quiz.id) throw new Error(`Quiz not found: ${quizId}`)
                return { body: quiz }
            },
        },
    ]

    return { quiz, restoreFetch: installApiMock(routes) }
}

const readCorrectAnswersCount = () =>
    document.querySelector<HTMLElement>('.correct-answers-count')?.textContent?.trim() ?? '-'

const waitForCorrectAnswersCount = async (expected: string) => {
    await waitFor(() => readCorrectAnswersCount() === expected)
}

const startQuiz = async (quizId: number) => {
    await clickElement('#start')
    await waitForQuestionReady({
        quizId,
        questionIndex: 0,
        question: singleChoiceQuestion,
    })
}

const answerCurrentQuestion = async ({
    quizId,
    questionIndex,
    question,
}: {
    readonly quizId: number
    readonly questionIndex: number
    readonly question: typeof singleChoiceQuestion
}) => {
    await answerQuestion({
        quizId,
        questionIndex,
        question,
        answers: [question.answers[0]],
    })
}

const difficultyCases = [
    {
        difficulty: 'keep-question',
        expectedCounts: ['-', '2', '-'],
    },
    {
        difficulty: 'easy',
        expectedCounts: ['-', '2', '3'],
    },
    {
        difficulty: 'hard',
        expectedCounts: ['-', '-', '-'],
    },
] as const satisfies ReadonlyArray<{
    readonly difficulty: Difficulty
    readonly expectedCounts: readonly [string, string, string]
}>

describe('Quiz.EasyMode feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        sessionStorage.clear()
        await cleanup()
    })

    for (const { difficulty, expectedCounts } of difficultyCases) {
        it(`shows correct answer counts for ${difficulty} difficulty`, async () => {
            const installed = installQuizEasyModeMockApi(difficulty)
            restoreFetch = installed.restoreFetch
            ;({ cleanup } = await renderAppAt(`/quiz/${installed.quiz.id}`))

            await startQuiz(installed.quiz.id)

            const quizQuestions = [singleChoiceQuestion, easyQuestion, hardQuestion] as const

            for (const [questionIndex, question] of quizQuestions.entries()) {
                await waitForQuestionReady({
                    quizId: installed.quiz.id,
                    questionIndex,
                    question,
                })
                await waitForCorrectAnswersCount(expectedCounts[questionIndex])
                expect(readCorrectAnswersCount()).to.equal(expectedCounts[questionIndex])

                if (questionIndex < quizQuestions.length - 1) {
                    await answerCurrentQuestion({
                        quizId: installed.quiz.id,
                        questionIndex,
                        question,
                    })
                }
            }
        })
    }
})
