import { createQuestionInBackend, createQuizInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { answerQuestion, waitForQuestionReady } from '../support/quiz-flow.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

type QuizMode = 'exam' | 'learn'

const feedbackText = () => document.querySelector('.question-feedback')?.textContent?.trim() ?? ''

const startQuiz = async (quizId: number) => {
    await clickElement('#start')
    await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)
}

const prepareQuiz = async (mode: QuizMode) => {
    const suffix = `${Date.now()}-${mode}`
    const workspaceGuid = await createWorkspaceInBackend(`WTR Take Workspace ${suffix}`)
    const questionAText = 'Jaký nábytek má Ikea?'
    const questionBText = 'Jaké nádobí má Ikea?'
    const questionAAnswers = ['Stůl', 'Auto'] as const
    const questionBAnswers = ['Talíř', 'Kolo'] as const
    const questionA = await createQuestionInBackend(workspaceGuid, questionAText, questionAAnswers)
    const questionB = await createQuestionInBackend(workspaceGuid, questionBText, questionBAnswers)
    const quizId = await createQuizInBackend({
        workspaceGuid,
        questionIds: [questionA.id, questionB.id],
        title: `WTR Take ${mode} ${suffix}`,
        description: 'Backend take smoke',
        mode,
        passScore: 85,
        timeLimit: 120,
    })

    return {
        quizId,
        quizQuestions: [
            { id: questionA.id, question: questionAText, answers: questionAAnswers },
            { id: questionB.id, question: questionBText, answers: questionBAnswers },
        ] as const,
    }
}

describe('Quiz.Take feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        sessionStorage.clear()
        await cleanup()
    })

    it('exam mode advances directly to the next question without immediate feedback', async () => {
        const { quizId, quizQuestions } = await prepareQuiz('exam')
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await startQuiz(quizId)
        await waitForQuestionReady({ quizId, questionIndex: 0, question: quizQuestions[0] })

        await answerQuestion({
            quizId,
            questionIndex: 0,
            question: quizQuestions[0],
            answers: ['Stůl'],
        })

        await waitForQuestionReady({ quizId, questionIndex: 1, question: quizQuestions[1] })
        await waitFor(() => document.querySelector('.question-feedback') === null)
    })

    it('learn mode shows feedback and waits for manual next navigation', async () => {
        const { quizId, quizQuestions } = await prepareQuiz('learn')
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await startQuiz(quizId)
        await waitForQuestionReady({ quizId, questionIndex: 0, question: quizQuestions[0] })

        await answerQuestion({
            quizId,
            questionIndex: 0,
            question: quizQuestions[0],
            answers: ['Stůl'],
        })

        await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)
        await waitFor(() => textContent('#question') === 'Jaký nábytek má Ikea?')
        await waitFor(() => feedbackText() === 'Correct!')

        await clickElement('#next')
        await waitForQuestionReady({ quizId, questionIndex: 1, question: quizQuestions[1] })
    })
})
