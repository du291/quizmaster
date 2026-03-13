import { expect } from '@esm-bundle/chai'
import { buildQuestion, buildQuizFixture } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { answerQuestion, goToResultsPage, waitForQuestionReady } from '../support/quiz-flow.ts'
import { clickElement, renderAppAt, waitFor } from '../support/test-harness.tsx'

const skyQuestion = buildQuestion({
    id: 91,
    question: 'What color is the sky?',
    answers: ['Blue', 'Green'],
})

const franceQuestion = buildQuestion({
    id: 92,
    question: 'What is the capital of France?',
    answers: ['Paris', 'Lyon'],
})

const regressionQuiz = buildQuizFixture({
    id: 4101,
    title: 'Regression Quiz',
    description: 'Quiz regression coverage',
    mode: 'exam',
    difficulty: 'keep-question',
    passScore: 85,
    timeLimit: 120,
    questions: [skyQuestion, franceQuestion],
})

const installQuizRegressionMockApi = () => {
    const routes: readonly Route[] = [
        {
            method: 'GET',
            match: /^\/api\/quiz\/\d+$/,
            handle: request => {
                const quizId = Number.parseInt(request.path.split('/').pop() ?? '0')
                if (quizId !== regressionQuiz.id) throw new Error(`Quiz not found: ${quizId}`)
                return { body: regressionQuiz }
            },
        },
    ]

    return installApiMock(routes)
}

const hasSelectedAnswers = () =>
    Array.from(document.querySelectorAll<HTMLInputElement>('#question-form input')).some(input => input.checked)

const hasQuestionExplanation = () => document.querySelector('.question-explanation') !== null

const waitForNoAnswerSelected = async () => {
    await waitFor(() => !hasSelectedAnswers())
}

const waitForNoExplanation = async () => {
    await waitFor(() => !hasQuestionExplanation())
}

const startQuiz = async () => {
    await clickElement('#start')
    await waitForQuestionReady({
        quizId: regressionQuiz.id,
        questionIndex: 0,
        question: skyQuestion,
    })
}

describe('QuizRegression feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        sessionStorage.clear()
        await cleanup()
    })

    it('starts on the first question with no selected answer', async () => {
        restoreFetch = installQuizRegressionMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${regressionQuiz.id}`))

        await startQuiz()
        await waitForNoAnswerSelected()

        expect(hasSelectedAnswers()).to.equal(false)
    })

    it('does not preserve an in-progress answer across navigation to the next question or reload', async () => {
        restoreFetch = installQuizRegressionMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${regressionQuiz.id}`))

        await startQuiz()
        await answerQuestion({
            quizId: regressionQuiz.id,
            questionIndex: 0,
            question: skyQuestion,
            answers: ['Green'],
        })
        await waitForQuestionReady({
            quizId: regressionQuiz.id,
            questionIndex: 1,
            question: franceQuestion,
        })
        await waitForNoAnswerSelected()
        await waitForNoExplanation()

        const currentPath = window.location.pathname
        await cleanup()
        ;({ cleanup } = await renderAppAt(currentPath))

        await waitForQuestionReady({
            quizId: regressionQuiz.id,
            questionIndex: 1,
            question: franceQuestion,
        })
        await waitForNoAnswerSelected()

        expect(hasSelectedAnswers()).to.equal(false)
        expect(hasQuestionExplanation()).to.equal(false)
    })

    it('starts from the beginning with no selected answer when restarted after finishing', async () => {
        restoreFetch = installQuizRegressionMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${regressionQuiz.id}`))

        await startQuiz()
        await answerQuestion({
            quizId: regressionQuiz.id,
            questionIndex: 0,
            question: skyQuestion,
            answers: ['Green'],
        })
        await waitForQuestionReady({
            quizId: regressionQuiz.id,
            questionIndex: 1,
            question: franceQuestion,
        })
        await answerQuestion({
            quizId: regressionQuiz.id,
            questionIndex: 1,
            question: franceQuestion,
            answers: ['Paris'],
        })
        await goToResultsPage()
        await waitFor(() => document.querySelector('#results') !== null)

        await cleanup()
        ;({ cleanup } = await renderAppAt(`/quiz/${regressionQuiz.id}`))

        await startQuiz()
        await waitForNoAnswerSelected()

        expect(hasSelectedAnswers()).to.equal(false)
    })
})
