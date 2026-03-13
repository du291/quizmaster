import { expect } from '@esm-bundle/chai'
import { createQuizInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { answerQuestion, waitForQuestionReady } from '../support/quiz-flow.ts'
import { clickElement, renderAppAt, waitFor } from '../support/test-harness.tsx'

type Difficulty = 'easy' | 'hard' | 'keep-question'

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

const createQuestionInBackend = async ({
    workspaceGuid,
    question,
    answers,
    correctAnswers,
    easyMode,
}: {
    readonly workspaceGuid: string
    readonly question: string
    readonly answers: readonly string[]
    readonly correctAnswers: readonly number[]
    readonly easyMode: boolean
}) => {
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
        questionExplanation: '',
        easyMode,
        workspaceGuid,
    })

    return response
}

const readCorrectAnswersCount = () =>
    document.querySelector<HTMLElement>('.correct-answers-count')?.textContent?.trim() ?? '-'

const waitForCorrectAnswersCount = async (expected: string) => {
    await waitFor(() => readCorrectAnswersCount() === expected)
}

const difficultyCases = [
    {
        difficulty: 'keep-question',
        expectedCounts: ['-', '2', '-'],
    },
    {
        difficulty: 'easy',
        expectedCounts: ['-', '2', '3'],
    },
    {
        difficulty: 'hard',
        expectedCounts: ['-', '-', '-'],
    },
] as const satisfies ReadonlyArray<{
    readonly difficulty: Difficulty
    readonly expectedCounts: readonly [string, string, string]
}>

const prepareQuiz = async (difficulty: Difficulty) => {
    const suffix = `${Date.now()}-${difficulty}`
    const workspaceGuid = await createWorkspaceInBackend(`WTR Quiz Easy Mode Workspace ${suffix}`)

    const singleChoiceQuestionText = `Capital of France? ${suffix}`
    const easyQuestionText = `Food? ${suffix}`
    const hardQuestionText = `Animal? ${suffix}`

    const singleChoiceQuestion = await createQuestionInBackend({
        workspaceGuid,
        question: singleChoiceQuestionText,
        answers: ['Paris', 'Nice'],
        correctAnswers: [0],
        easyMode: false,
    })
    const easyQuestion = await createQuestionInBackend({
        workspaceGuid,
        question: easyQuestionText,
        answers: ['Pork', 'Fish', 'Shoe'],
        correctAnswers: [0, 1],
        easyMode: true,
    })
    const hardQuestion = await createQuestionInBackend({
        workspaceGuid,
        question: hardQuestionText,
        answers: ['Dog', 'Cat', 'Bird', 'Car'],
        correctAnswers: [0, 1, 2],
        easyMode: false,
    })

    const quizId = await createQuizInBackend({
        workspaceGuid,
        questionIds: [singleChoiceQuestion.id, easyQuestion.id, hardQuestion.id],
        title: `Quiz Difficulty ${suffix}`,
        description: 'Quiz difficulty override coverage',
        mode: 'exam',
        difficulty,
        passScore: 85,
        timeLimit: 120,
    })

    return {
        quizId,
        quizQuestions: [
            { id: singleChoiceQuestion.id, question: singleChoiceQuestionText, answers: ['Paris', 'Nice'] },
            { id: easyQuestion.id, question: easyQuestionText, answers: ['Pork', 'Fish', 'Shoe'] },
            { id: hardQuestion.id, question: hardQuestionText, answers: ['Dog', 'Cat', 'Bird', 'Car'] },
        ] as const,
    }
}

describe('Quiz.EasyMode feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        sessionStorage.clear()
        await cleanup()
    })

    for (const { difficulty, expectedCounts } of difficultyCases) {
        it(`shows correct answer counts for ${difficulty} difficulty`, async () => {
            const { quizId, quizQuestions } = await prepareQuiz(difficulty)
            ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

            await clickElement('#start')

            for (const [questionIndex, question] of quizQuestions.entries()) {
                await waitForQuestionReady({
                    quizId,
                    questionIndex,
                    question,
                })
                await waitForCorrectAnswersCount(expectedCounts[questionIndex])
                expect(readCorrectAnswersCount()).to.equal(expectedCounts[questionIndex])

                if (questionIndex < quizQuestions.length - 1) {
                    await answerQuestion({
                        quizId,
                        questionIndex,
                        question,
                        answers: [question.answers[0]],
                    })
                }
            }
        })
    }
})
