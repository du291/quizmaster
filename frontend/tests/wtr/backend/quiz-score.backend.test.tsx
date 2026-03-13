import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { answerQuestion, goToResultsPage } from '../support/quiz-flow.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

type QuizMode = 'exam' | 'learn'

const postJson = async <T, U>(url: string, body: T): Promise<U> => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    if (!response.ok) {
        throw new Error(`Backend request failed: ${response.status} ${response.statusText}`)
    }

    return (await response.json()) as U
}

const createQuizInBackend = async (
    workspaceGuid: string,
    mode: QuizMode,
    passScore: number,
    timeLimit: number,
    questionIds: readonly number[],
): Promise<number> => {
    const response = await postJson<
        {
            title: string
            description: string
            questionIds: readonly number[]
            mode: QuizMode
            passScore: number
            timeLimit: number
            workspaceGuid: string
            difficulty: 'keep-question'
        },
        number
    >('/api/quiz', {
        title: `WTR Score ${Date.now()}`,
        description: 'Backend score smoke',
        questionIds,
        mode,
        passScore,
        timeLimit,
        workspaceGuid,
        difficulty: 'keep-question',
    })

    return Number(response)
}

describe('Quiz.Score feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        sessionStorage.clear()
        await cleanup()
    })

    it('evaluates score for a mixed correct/incorrect run', async () => {
        const suffix = `${Date.now()}`
        const workspaceGuid = await createWorkspaceInBackend(`WTR Score Workspace ${suffix}`)

        const question1Text = `Score Q1 ${suffix}`
        const question2Text = `Score Q2 ${suffix}`
        const question1Answers = ['A1', 'A2'] as const
        const question2Answers = ['B1', 'B2'] as const
        const question1 = await createQuestionInBackend(workspaceGuid, question1Text, question1Answers)
        const question2 = await createQuestionInBackend(workspaceGuid, question2Text, question2Answers)
        const quizId = await createQuizInBackend(workspaceGuid, 'exam', 75, 120, [question1.id, question2.id])
        const quizQuestions = [
            { id: question1.id, question: question1Text, answers: question1Answers },
            { id: question2.id, question: question2Text, answers: question2Answers },
        ] as const

        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await clickElement('#start')
        await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)

        await answerQuestion({
            quizId,
            questionIndex: 0,
            question: quizQuestions[0],
            answers: ['A1'],
        })
        await answerQuestion({
            quizId,
            questionIndex: 1,
            question: quizQuestions[1],
            answers: ['B2'],
        })
        await goToResultsPage()

        expect(textContent('#correct-answers')).to.equal('1')
        expect(textContent('#total-questions')).to.equal('2')
        expect(textContent('#percentage-result')).to.equal('50')
        expect(textContent('#text-result')).to.equal('failed')
        expect(textContent('#pass-score')).to.equal('75')
    })
})
