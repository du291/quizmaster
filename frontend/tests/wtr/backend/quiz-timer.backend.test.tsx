import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
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
        title: `WTR Timer ${Date.now()}`,
        description: 'Backend timer smoke',
        questionIds,
        mode,
        passScore,
        timeLimit,
        workspaceGuid,
        difficulty: 'keep-question',
    })

    return Number(response)
}

describe('Quiz.Timer feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        sessionStorage.clear()
        await cleanup()
    })

    it('times out and evaluates unanswered quiz as failed', async () => {
        const suffix = `${Date.now()}`
        const workspaceGuid = await createWorkspaceInBackend(`WTR Timer Workspace ${suffix}`)
        const question1 = await createQuestionInBackend(workspaceGuid, `Timer Q1 ${suffix}`, ['A1', 'A2'])
        const question2 = await createQuestionInBackend(workspaceGuid, `Timer Q2 ${suffix}`, ['B1', 'B2'])

        const quizId = await createQuizInBackend(workspaceGuid, 'exam', 85, 1, [question1.id, question2.id])
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await clickElement('#start')
        await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)

        await waitFor(() => document.querySelector('dialog p')?.textContent?.includes('Game over time') ?? false, 6000)
        await clickElement('dialog #evaluate')
        await waitFor(() => document.querySelector('#results') !== null, 5000)

        expect(textContent('#correct-answers')).to.equal('0')
        expect(textContent('#total-questions')).to.equal('2')
        expect(textContent('#percentage-result')).to.equal('0')
        expect(textContent('#text-result')).to.equal('failed')
        expect(textContent('#pass-score')).to.equal('85')
    })
})
