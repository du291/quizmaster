import { buildQuestion, buildQuizFixture } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { answerQuestion, waitForQuestionReady } from '../support/quiz-flow.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const furnitureQuestion = buildQuestion({
    id: 41,
    question: 'Jaký nábytek má Ikea?',
    answers: ['Stůl', 'Auto'],
})

const dishesQuestion = buildQuestion({
    id: 42,
    question: 'Jaké nádobí má Ikea?',
    answers: ['Talíř', 'Kolo'],
})

const examQuiz = buildQuizFixture({
    id: 3501,
    title: 'Math Quiz',
    description: 'Exam mode quiz',
    mode: 'exam',
    passScore: 85,
    timeLimit: 120,
    questions: [furnitureQuestion, dishesQuestion],
})

const learnQuiz = buildQuizFixture({
    id: 3502,
    title: 'Ikea quiz',
    description: 'Learn mode quiz',
    mode: 'learn',
    passScore: 85,
    timeLimit: 120,
    questions: [furnitureQuestion, dishesQuestion],
})

const quizzesById = new Map([
    [examQuiz.id, examQuiz],
    [learnQuiz.id, learnQuiz],
])

const installQuizTakeMockApi = () => {
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

const feedbackText = () => document.querySelector('.question-feedback')?.textContent?.trim() ?? ''

const startQuiz = async (quizId: number) => {
    await clickElement('#start')
    await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)
}

describe('Quiz.Take feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        sessionStorage.clear()
        await cleanup()
    })

    it('exam mode advances directly to the next question without immediate feedback', async () => {
        restoreFetch = installQuizTakeMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${examQuiz.id}`))

        await startQuiz(examQuiz.id)
        await waitForQuestionReady({ quizId: examQuiz.id, questionIndex: 0, question: examQuiz.questions[0] })

        await answerQuestion({
            quizId: examQuiz.id,
            questionIndex: 0,
            question: examQuiz.questions[0],
            answers: ['Stůl'],
        })

        await waitForQuestionReady({ quizId: examQuiz.id, questionIndex: 1, question: examQuiz.questions[1] })
        await waitFor(() => document.querySelector('.question-feedback') === null)
    })

    it('learn mode shows feedback and waits for manual next navigation', async () => {
        restoreFetch = installQuizTakeMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${learnQuiz.id}`))

        await startQuiz(learnQuiz.id)
        await waitForQuestionReady({ quizId: learnQuiz.id, questionIndex: 0, question: learnQuiz.questions[0] })

        await answerQuestion({
            quizId: learnQuiz.id,
            questionIndex: 0,
            question: learnQuiz.questions[0],
            answers: ['Stůl'],
        })

        await waitFor(() => window.location.pathname === `/quiz/${learnQuiz.id}/questions`)
        await waitFor(() => textContent('#question') === 'Jaký nábytek má Ikea?')
        await waitFor(() => feedbackText() === 'Correct!')

        await clickElement('#next')
        await waitForQuestionReady({ quizId: learnQuiz.id, questionIndex: 1, question: learnQuiz.questions[1] })
    })

    it('learn mode lets the user retake the same question and updates feedback', async () => {
        restoreFetch = installQuizTakeMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${learnQuiz.id}`))

        await startQuiz(learnQuiz.id)
        await waitForQuestionReady({ quizId: learnQuiz.id, questionIndex: 0, question: learnQuiz.questions[0] })

        await answerQuestion({
            quizId: learnQuiz.id,
            questionIndex: 0,
            question: learnQuiz.questions[0],
            answers: ['Stůl'],
        })
        await waitFor(() => feedbackText() === 'Correct!')

        await answerQuestion({
            quizId: learnQuiz.id,
            questionIndex: 0,
            question: learnQuiz.questions[0],
            answers: ['Auto'],
        })
        await waitFor(() => textContent('#question') === 'Jaký nábytek má Ikea?')
        await waitFor(() => feedbackText() === 'Incorrect!')
    })

    it('learn mode follows browser back and forward navigation between questions', async () => {
        restoreFetch = installQuizTakeMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${learnQuiz.id}`))

        await startQuiz(learnQuiz.id)
        await waitForQuestionReady({ quizId: learnQuiz.id, questionIndex: 0, question: learnQuiz.questions[0] })

        await answerQuestion({
            quizId: learnQuiz.id,
            questionIndex: 0,
            question: learnQuiz.questions[0],
            answers: ['Stůl'],
        })
        await waitFor(() => feedbackText() === 'Correct!')
        await clickElement('#next')
        await waitForQuestionReady({ quizId: learnQuiz.id, questionIndex: 1, question: learnQuiz.questions[1] })

        window.history.back()
        await waitForQuestionReady({ quizId: learnQuiz.id, questionIndex: 0, question: learnQuiz.questions[0] })

        window.history.forward()
        await waitForQuestionReady({ quizId: learnQuiz.id, questionIndex: 1, question: learnQuiz.questions[1] })
    })
})
