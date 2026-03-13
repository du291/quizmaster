import { expect } from '@esm-bundle/chai'
import { buildQuestion, buildQuizFixture } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const examQuiz = buildQuizFixture({
    id: 3401,
    title: 'Quiz A',
    description: 'Description A',
    mode: 'exam',
    passScore: 66,
    timeLimit: 120,
    questions: [
        buildQuestion({ id: 1, question: 'Question A1', answers: ['A', 'B'] }),
        buildQuestion({ id: 2, question: 'Question A2', answers: ['A', 'B'] }),
        buildQuestion({ id: 3, question: 'Question A3', answers: ['A', 'B'] }),
    ],
})

const learnQuiz = buildQuizFixture({
    id: 3402,
    title: 'Quiz B',
    description: 'Description B',
    mode: 'learn',
    passScore: 75,
    timeLimit: 60,
    questions: [
        buildQuestion({ id: 11, question: 'Question B1', answers: ['A', 'B'] }),
        buildQuestion({ id: 12, question: 'Question B2', answers: ['A', 'B'] }),
        buildQuestion({ id: 13, question: 'Question B3', answers: ['A', 'B'] }),
        buildQuestion({ id: 14, question: 'Question B4', answers: ['A', 'B'] }),
    ],
})

const quizzesById = new Map([
    [examQuiz.id, examQuiz],
    [learnQuiz.id, learnQuiz],
])

const installQuizWelcomeMockApi = () => {
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

const assertWelcomePage = async ({
    quizId,
    title,
    description,
    questionCount,
    timeLimitSeconds,
    passScore,
    feedbackText,
}: {
    readonly quizId: number
    readonly title: string
    readonly description: string
    readonly questionCount: string
    readonly timeLimitSeconds: string
    readonly passScore: string
    readonly feedbackText: string
}) => {
    await waitFor(() => window.location.pathname === `/quiz/${quizId}`)
    await waitFor(() => textContent('h1') === 'Welcome to the quiz')
    await waitFor(() => textContent('#quiz-name') === title)

    expect(textContent('#quiz-description')).to.equal(description)
    expect(textContent('#question-count')).to.equal(questionCount)
    expect(textContent('#time-limit')).to.equal(`${timeLimitSeconds} seconds`)
    expect(textContent('#pass-score')).to.equal(`${passScore}%`)
    expect(textContent('#question-feedback')).to.equal(feedbackText)
}

describe('Quiz.Welcome feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    it('shows quiz details for exam mode quizzes', async () => {
        restoreFetch = installQuizWelcomeMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${examQuiz.id}`))

        await assertWelcomePage({
            quizId: examQuiz.id,
            title: 'Quiz A',
            description: 'Description A',
            questionCount: '3',
            timeLimitSeconds: '120',
            passScore: '66',
            feedbackText: 'Feedback at the end',
        })
    })

    it('shows quiz details for learn mode quizzes', async () => {
        restoreFetch = installQuizWelcomeMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${learnQuiz.id}`))

        await assertWelcomePage({
            quizId: learnQuiz.id,
            title: 'Quiz B',
            description: 'Description B',
            questionCount: '4',
            timeLimitSeconds: '60',
            passScore: '75',
            feedbackText: 'Continuous feedback',
        })
    })
})
