import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createQuizInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { answerQuestion, waitForQuestionReady } from '../support/quiz-flow.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

type QuizMode = 'exam' | 'learn'

const expectProgress = async (current: number, total: number) => {
    await waitFor(() => {
        const progressBar = document.querySelector<HTMLProgressElement>('#progress-bar')
        if (!progressBar) return false
        const currentValue = Number.parseInt(progressBar.getAttribute('value') ?? '0')
        const totalValue = Number.parseInt(progressBar.getAttribute('max') ?? '0')
        return currentValue === current && totalValue === total
    })
}

const prepareQuiz = async (mode: QuizMode) => {
    const suffix = `${Date.now()}-${mode}`
    const workspaceGuid = await createWorkspaceInBackend(`WTR Progress Workspace ${suffix}`)

    const questionAText = `Progress Q1 ${suffix}`
    const questionBText = `Progress Q2 ${suffix}`
    const questionCText = `Progress Q3 ${suffix}`
    const questionAAnswers = ['A1', 'A2'] as const
    const questionBAnswers = ['B1', 'B2'] as const
    const questionCAnswers = ['C1', 'C2'] as const

    const questionA = await createQuestionInBackend(workspaceGuid, questionAText, questionAAnswers)
    const questionB = await createQuestionInBackend(workspaceGuid, questionBText, questionBAnswers)
    const questionC = await createQuestionInBackend(workspaceGuid, questionCText, questionCAnswers)

    const quizId = await createQuizInBackend({
        workspaceGuid,
        questionIds: [questionA.id, questionB.id, questionC.id],
        title: `WTR Progress ${mode} ${Date.now()}`,
        description: `${mode} mode progress test`,
        mode,
        passScore: 85,
        timeLimit: 120,
    })

    return {
        quizId,
        quizQuestions: [
            { id: questionA.id, question: questionAText, answers: questionAAnswers },
            { id: questionB.id, question: questionBText, answers: questionBAnswers },
            { id: questionC.id, question: questionCText, answers: questionCAnswers },
        ] as const,
    }
}

describe('Quiz.Progress feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        sessionStorage.clear()
        await cleanup()
    })

    it('exam mode advances progress immediately after each answer', async () => {
        const { quizId, quizQuestions } = await prepareQuiz('exam')
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await clickElement('#start')
        await waitForQuestionReady({ quizId, questionIndex: 0, question: quizQuestions[0] })
        await expectProgress(1, 3)

        await answerQuestion({
            quizId,
            questionIndex: 0,
            question: quizQuestions[0],
            answers: ['A1'],
        })
        await waitForQuestionReady({ quizId, questionIndex: 1, question: quizQuestions[1] })
        await expectProgress(2, 3)

        await answerQuestion({
            quizId,
            questionIndex: 1,
            question: quizQuestions[1],
            answers: ['B1'],
        })
        await waitForQuestionReady({ quizId, questionIndex: 2, question: quizQuestions[2] })
        await expectProgress(3, 3)
    })

    it('learn mode advances progress only after navigating next question', async () => {
        const { quizId, quizQuestions } = await prepareQuiz('learn')
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await clickElement('#start')
        await waitForQuestionReady({ quizId, questionIndex: 0, question: quizQuestions[0] })
        await expectProgress(1, 3)

        await answerQuestion({
            quizId,
            questionIndex: 0,
            question: quizQuestions[0],
            answers: ['A1'],
        })
        await waitForQuestionReady({ quizId, questionIndex: 0, question: quizQuestions[0] })
        await expect(textContent('#question')).to.contain('Progress Q1')
        await expectProgress(1, 3)

        await clickElement('#next')
        await waitForQuestionReady({ quizId, questionIndex: 1, question: quizQuestions[1] })
        await expectProgress(2, 3)
    })
})
