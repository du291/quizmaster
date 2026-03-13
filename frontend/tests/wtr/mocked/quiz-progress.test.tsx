import type { Quiz } from '../../../src/model/quiz.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { answerQuestion, waitForQuestionReady } from '../support/quiz-flow.ts'
import { clickElement, renderAppAt, waitFor } from '../support/test-harness.tsx'

const question = (id: number, title: string) => ({
    id,
    editId: `edit-${id}`,
    question: title,
    answers: ['Correct', 'Wrong'],
    explanations: ['', ''],
    correctAnswers: [0],
    questionExplanation: '',
    workspaceGuid: null,
    easyMode: false,
})

const examQuiz: Quiz = {
    id: 3001,
    title: 'Exam',
    description: 'Exam mode quiz',
    mode: 'exam',
    difficulty: 'keep-question',
    passScore: 85,
    timeLimit: 120,
    questions: [question(1, 'Exam Question 1'), question(2, 'Exam Question 2'), question(3, 'Exam Question 3')],
}

const learnQuiz: Quiz = {
    id: 3002,
    title: 'Learn',
    description: 'Learn mode quiz',
    mode: 'learn',
    difficulty: 'keep-question',
    passScore: 85,
    timeLimit: 120,
    questions: [question(11, 'Learn Question 1'), question(12, 'Learn Question 2'), question(13, 'Learn Question 3')],
}

const quizzesById = new Map<number, Quiz>([
    [examQuiz.id, examQuiz],
    [learnQuiz.id, learnQuiz],
])

const installQuizProgressMockApi = () => {
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

const expectProgress = async (current: number, total: number) => {
    await waitFor(() => {
        const progressBar = document.querySelector<HTMLProgressElement>('#progress-bar')
        if (!progressBar) return false
        const currentValue = Number.parseInt(progressBar.getAttribute('value') ?? '0')
        const totalValue = Number.parseInt(progressBar.getAttribute('max') ?? '0')
        return currentValue === current && totalValue === total
    })
}

describe('Quiz.Progress feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        sessionStorage.clear()
        await cleanup()
    })

    it('exam mode advances progress immediately after each answer', async () => {
        restoreFetch = installQuizProgressMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${examQuiz.id}`))

        await clickElement('#start')
        await waitForQuestionReady({ quizId: examQuiz.id, questionIndex: 0, question: examQuiz.questions[0] })
        await expectProgress(1, 3)

        await answerQuestion({
            quizId: examQuiz.id,
            questionIndex: 0,
            question: examQuiz.questions[0],
            answers: ['Correct'],
        })
        await waitForQuestionReady({ quizId: examQuiz.id, questionIndex: 1, question: examQuiz.questions[1] })
        await expectProgress(2, 3)

        await answerQuestion({
            quizId: examQuiz.id,
            questionIndex: 1,
            question: examQuiz.questions[1],
            answers: ['Correct'],
        })
        await waitForQuestionReady({ quizId: examQuiz.id, questionIndex: 2, question: examQuiz.questions[2] })
        await expectProgress(3, 3)
    })

    it('learn mode advances progress only after navigating next question', async () => {
        restoreFetch = installQuizProgressMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${learnQuiz.id}`))

        await clickElement('#start')
        await waitForQuestionReady({ quizId: learnQuiz.id, questionIndex: 0, question: learnQuiz.questions[0] })
        await expectProgress(1, 3)

        await answerQuestion({
            quizId: learnQuiz.id,
            questionIndex: 0,
            question: learnQuiz.questions[0],
            answers: ['Correct'],
        })
        await waitForQuestionReady({ quizId: learnQuiz.id, questionIndex: 0, question: learnQuiz.questions[0] })
        await expectProgress(1, 3)

        await clickElement('#next')
        await waitForQuestionReady({ quizId: learnQuiz.id, questionIndex: 1, question: learnQuiz.questions[1] })
        await expectProgress(2, 3)
    })
})
