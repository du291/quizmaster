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

const answerByPosition = async (position: number) => {
    await waitFor(() => document.querySelectorAll<HTMLLabelElement>('[id^="answer-label-"]').length > position)
    const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('[id^="answer-label-"]'))
    const label = labels[position]
    if (!label) throw new Error(`Answer label not found at position ${position}`)
    const answerId = label.htmlFor
    if (!answerId) throw new Error(`Missing answer input id for position ${position}`)
    await clickElement(`input#${answerId}`)
    await clickElement('input.submit-btn')
}

const answerQuizSequence = async (positions: readonly number[]) => {
    for (let i = 0; i < positions.length; i++) {
        const questionBeforeSubmit = textContent('#question')
        await answerByPosition(positions[i])
        if (i < positions.length - 1) {
            await waitFor(() => textContent('#question') !== '' && textContent('#question') !== questionBeforeSubmit)
        }
    }
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

        const question1 = await createQuestionInBackend(workspaceGuid, `Score Q1 ${suffix}`, ['A1', 'A2'])
        const question2 = await createQuestionInBackend(workspaceGuid, `Score Q2 ${suffix}`, ['B1', 'B2'])
        const quizId = await createQuizInBackend(workspaceGuid, 'exam', 75, 120, [question1.id, question2.id])

        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await clickElement('#start')
        await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)

        await answerQuizSequence([0, 1])

        if (!document.querySelector('#evaluate') && !document.querySelector('#results')) {
            await answerByPosition(1)
        }

        await waitFor(() => document.querySelector('#evaluate') !== null || document.querySelector('#results') !== null, 5000)
        if (!document.querySelector('#results')) {
            await clickElement('#evaluate')
        }
        await waitFor(() => document.querySelector('#results') !== null)

        expect(textContent('#correct-answers')).to.equal('1')
        expect(textContent('#total-questions')).to.equal('2')
        expect(textContent('#percentage-result')).to.equal('50')
        expect(textContent('#text-result')).to.equal('failed')
        expect(textContent('#pass-score')).to.equal('75')
    })
})
