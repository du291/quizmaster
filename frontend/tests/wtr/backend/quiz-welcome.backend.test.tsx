import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createQuizInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

type QuizMode = 'exam' | 'learn'

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

const prepareQuiz = async ({
    mode,
    title,
    description,
    passScore,
    timeLimit,
    questionCount,
}: {
    readonly mode: QuizMode
    readonly title: string
    readonly description: string
    readonly passScore: number
    readonly timeLimit: number
    readonly questionCount: number
}) => {
    const suffix = `${Date.now()}-${mode}`
    const workspaceGuid = await createWorkspaceInBackend(`WTR Welcome Workspace ${suffix}`)

    const questionIds: number[] = []
    for (let index = 1; index <= questionCount; index += 1) {
        const question = await createQuestionInBackend(
            workspaceGuid,
            `${title} Question ${index} ${suffix}`,
            [`${title} Answer ${index}A`, `${title} Answer ${index}B`],
        )
        questionIds.push(question.id)
    }

    const quizId = await createQuizInBackend({
        workspaceGuid,
        questionIds,
        title,
        description,
        mode,
        passScore,
        timeLimit,
    })

    return { quizId }
}

describe('Quiz.Welcome feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    it('shows quiz details for exam mode quizzes', async () => {
        const title = `Quiz A ${Date.now()}`
        const description = 'Description A'
        const { quizId } = await prepareQuiz({
            mode: 'exam',
            title,
            description,
            passScore: 66,
            timeLimit: 120,
            questionCount: 3,
        })
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await assertWelcomePage({
            quizId,
            title,
            description,
            questionCount: '3',
            timeLimitSeconds: '120',
            passScore: '66',
            feedbackText: 'Feedback at the end',
        })
    })

    it('shows quiz details for learn mode quizzes', async () => {
        const title = `Quiz B ${Date.now()}`
        const description = 'Description B'
        const { quizId } = await prepareQuiz({
            mode: 'learn',
            title,
            description,
            passScore: 75,
            timeLimit: 60,
            questionCount: 4,
        })
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await assertWelcomePage({
            quizId,
            title,
            description,
            questionCount: '4',
            timeLimitSeconds: '60',
            passScore: '75',
            feedbackText: 'Continuous feedback',
        })
    })
})
