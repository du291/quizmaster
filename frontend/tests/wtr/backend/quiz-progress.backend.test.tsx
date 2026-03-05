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
        title: `WTR Progress ${mode} ${Date.now()}`,
        description: `${mode} mode progress test`,
        questionIds,
        mode,
        passScore,
        timeLimit,
        workspaceGuid,
        difficulty: 'keep-question',
    })

    return Number(response)
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

const answerQuestion = async (answer: string) => {
    await waitFor(() =>
        Array.from(document.querySelectorAll<HTMLLabelElement>('[id^="answer-label-"]')).some(
            label => label.textContent?.trim() === answer,
        ),
    )
    const label = Array.from(document.querySelectorAll<HTMLLabelElement>('[id^="answer-label-"]')).find(
        item => item.textContent?.trim() === answer,
    )
    if (!label) throw new Error(`Answer label not found: ${answer}`)
    const answerId = label.htmlFor
    if (!answerId) throw new Error(`Missing answer input id for: ${answer}`)
    await clickElement(`input#${answerId}`)
    await waitFor(() => document.querySelector<HTMLInputElement>(`input#${answerId}`)?.checked ?? false)
    await clickElement('input.submit-btn')
}

const prepareQuiz = async (mode: QuizMode) => {
    const suffix = `${Date.now()}-${mode}`
    const workspaceGuid = await createWorkspaceInBackend(`WTR Progress Workspace ${suffix}`)

    const questionA = await createQuestionInBackend(workspaceGuid, `Progress Q1 ${suffix}`, ['A1', 'A2'])
    const questionB = await createQuestionInBackend(workspaceGuid, `Progress Q2 ${suffix}`, ['B1', 'B2'])
    const questionC = await createQuestionInBackend(workspaceGuid, `Progress Q3 ${suffix}`, ['C1', 'C2'])

    const quizId = await createQuizInBackend(workspaceGuid, mode, 85, 120, [questionA.id, questionB.id, questionC.id])
    return { quizId }
}

describe('Quiz.Progress feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        sessionStorage.clear()
        await cleanup()
    })

    it('exam mode advances progress immediately after each answer', async () => {
        const { quizId } = await prepareQuiz('exam')
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await clickElement('#start')
        await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)
        await expectProgress(1, 3)

        await answerQuestion('A1')
        await waitFor(() => textContent('#question').includes('Progress Q2'))
        await expectProgress(2, 3)

        await answerQuestion('B1')
        await waitFor(() => textContent('#question').includes('Progress Q3'))
        await expectProgress(3, 3)
    })

    it('learn mode advances progress only after navigating next question', async () => {
        const { quizId } = await prepareQuiz('learn')
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await clickElement('#start')
        await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)
        await expectProgress(1, 3)

        await answerQuestion('A1')
        await expect(textContent('#question')).to.contain('Progress Q1')
        await expectProgress(1, 3)

        await clickElement('#next')
        await waitFor(() => textContent('#question').includes('Progress Q2'))
        await expectProgress(2, 3)
    })
})
