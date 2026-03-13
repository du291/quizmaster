import { expect } from '@esm-bundle/chai'
import { createWorkspaceInBackend } from '../support/backend-api.ts'
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

const createQuestionInBackend = async (
    workspaceGuid: string,
    question: string,
    answers: readonly string[],
    correctAnswers: readonly number[],
    questionExplanation = '',
) => {
    const response = await postJson<
        {
            question: string
            editId: string
            answers: readonly string[]
            correctAnswers: readonly number[]
            explanations: readonly string[]
            questionExplanation: string
            easyMode: boolean
            workspaceGuid: string
        },
        { id: number; editId: string }
    >('/api/question', {
        question,
        editId: '',
        answers,
        correctAnswers,
        explanations: answers.map(() => ''),
        questionExplanation,
        easyMode: false,
        workspaceGuid,
    })

    return response
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
        title: `WTR Partial Score ${Date.now()}`,
        description: 'Backend partial score smoke',
        questionIds,
        mode,
        passScore,
        timeLimit,
        workspaceGuid,
        difficulty: 'keep-question',
    })

    return Number(response)
}

describe('Quiz.Score.Partial feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        sessionStorage.clear()
        await cleanup()
    })

    it('scores partially-correct multi-answer selection as 1.5/2', async () => {
        const suffix = `${Date.now()}`
        const workspaceGuid = await createWorkspaceInBackend(`WTR Partial Score Workspace ${suffix}`)

        const planetsQuestion = await createQuestionInBackend(
            workspaceGuid,
            `Which of the following are planets? (Partial Score) ${suffix}`,
            ['Mars', 'Pluto', 'Titan', 'Venus', 'Earth'],
            [0, 3, 4],
            'Planets',
        )
        const skyQuestion = await createQuestionInBackend(
            workspaceGuid,
            `What is the standard colour of sky? ${suffix}`,
            ['Red', 'Blue', 'Green', 'Black'],
            [1],
            'Rayleigh',
        )

        const quizId = await createQuizInBackend(workspaceGuid, 'exam', 75, 120, [planetsQuestion.id, skyQuestion.id])
        const quizQuestions = [
            {
                id: planetsQuestion.id,
                question: `Which of the following are planets? (Partial Score) ${suffix}`,
                answers: ['Mars', 'Pluto', 'Titan', 'Venus', 'Earth'],
            },
            {
                id: skyQuestion.id,
                question: `What is the standard colour of sky? ${suffix}`,
                answers: ['Red', 'Blue', 'Green', 'Black'],
            },
        ] as const
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await clickElement('#start')
        await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)

        await answerQuestion({
            quizId,
            questionIndex: 0,
            question: quizQuestions[0],
            answers: ['Mars', 'Venus'],
        })
        await answerQuestion({
            quizId,
            questionIndex: 1,
            question: quizQuestions[1],
            answers: ['Blue'],
        })

        await goToResultsPage()

        expect(textContent('#correct-answers')).to.equal('1.5')
        expect(textContent('#total-questions')).to.equal('2')
        expect(textContent('#percentage-result')).to.equal('75')
        expect(textContent('#text-result')).to.equal('passed')
        expect(textContent('#pass-score')).to.equal('75')
    })
})
