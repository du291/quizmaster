import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createQuizInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { answerQuestion, goToResultsPage, waitForQuestionReady } from '../support/quiz-flow.ts'
import { clickElement, renderAppAt, waitFor } from '../support/test-harness.tsx'

const hasSelectedAnswers = () =>
    Array.from(document.querySelectorAll<HTMLInputElement>('#question-form input')).some(input => input.checked)

const hasQuestionExplanation = () => document.querySelector('.question-explanation') !== null

const waitForNoAnswerSelected = async () => {
    await waitFor(() => !hasSelectedAnswers())
}

const waitForNoExplanation = async () => {
    await waitFor(() => !hasQuestionExplanation())
}

const prepareQuiz = async () => {
    const suffix = `${Date.now()}`
    const workspaceGuid = await createWorkspaceInBackend(`WTR Quiz Regression Workspace ${suffix}`)
    const skyQuestionText = `What color is the sky? ${suffix}`
    const franceQuestionText = `What is the capital of France? ${suffix}`
    const skyQuestionAnswers = ['Blue', 'Green'] as const
    const franceQuestionAnswers = ['Paris', 'Lyon'] as const

    const skyQuestion = await createQuestionInBackend(workspaceGuid, skyQuestionText, skyQuestionAnswers)
    const franceQuestion = await createQuestionInBackend(workspaceGuid, franceQuestionText, franceQuestionAnswers)

    const quizId = await createQuizInBackend({
        workspaceGuid,
        questionIds: [skyQuestion.id, franceQuestion.id],
        title: `Regression Quiz ${suffix}`,
        description: 'Quiz regression coverage',
        mode: 'exam',
        difficulty: 'keep-question',
        passScore: 85,
        timeLimit: 120,
    })

    return {
        quizId,
        quizQuestions: [
            { id: skyQuestion.id, question: skyQuestionText, answers: skyQuestionAnswers },
            { id: franceQuestion.id, question: franceQuestionText, answers: franceQuestionAnswers },
        ] as const,
    }
}

describe('QuizRegression feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        sessionStorage.clear()
        await cleanup()
    })

    it('starts on the first question with no selected answer', async () => {
        const { quizId, quizQuestions } = await prepareQuiz()
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await clickElement('#start')
        await waitForQuestionReady({
            quizId,
            questionIndex: 0,
            question: quizQuestions[0],
        })
        await waitForNoAnswerSelected()

        expect(hasSelectedAnswers()).to.equal(false)
    })

    it('does not preserve an in-progress answer across navigation to the next question or reload', async () => {
        const { quizId, quizQuestions } = await prepareQuiz()
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

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
            answers: ['Green'],
        })
        await waitForQuestionReady({
            quizId,
            questionIndex: 1,
            question: quizQuestions[1],
        })
        await waitForNoAnswerSelected()
        await waitForNoExplanation()

        const currentPath = window.location.pathname
        await cleanup()
        ;({ cleanup } = await renderAppAt(currentPath))

        await waitForQuestionReady({
            quizId,
            questionIndex: 1,
            question: quizQuestions[1],
        })
        await waitForNoAnswerSelected()

        expect(hasSelectedAnswers()).to.equal(false)
        expect(hasQuestionExplanation()).to.equal(false)
    })

    it('starts from the beginning with no selected answer when restarted after finishing', async () => {
        const { quizId, quizQuestions } = await prepareQuiz()
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

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
            answers: ['Green'],
        })
        await waitForQuestionReady({
            quizId,
            questionIndex: 1,
            question: quizQuestions[1],
        })
        await answerQuestion({
            quizId,
            questionIndex: 1,
            question: quizQuestions[1],
            answers: ['Paris'],
        })
        await goToResultsPage()
        await waitFor(() => document.querySelector('#results') !== null)

        await cleanup()
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await clickElement('#start')
        await waitForQuestionReady({
            quizId,
            questionIndex: 0,
            question: quizQuestions[0],
        })
        await waitForNoAnswerSelected()

        expect(hasSelectedAnswers()).to.equal(false)
    })
})
