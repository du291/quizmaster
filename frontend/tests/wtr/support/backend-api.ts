type WorkspaceCreateResponse = {
    readonly guid: string
}

type QuestionCreateResponse = {
    readonly id: number
    readonly editId: string
}

type QuizMode = 'exam' | 'learn'
type Difficulty = 'easy' | 'hard' | 'keep-question'

interface CreateQuizInBackendOptions {
    readonly workspaceGuid: string
    readonly questionIds: readonly number[]
    readonly title?: string
    readonly description?: string
    readonly mode?: QuizMode
    readonly difficulty?: Difficulty
    readonly passScore?: number
    readonly timeLimit?: number
    readonly size?: number
    readonly finalCount?: number
}

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

export const createWorkspaceInBackend = async (title: string): Promise<string> => {
    const response = await postJson<{ title: string }, WorkspaceCreateResponse>('/api/workspaces', { title })
    return response.guid
}

export const createQuestionInBackend = async (workspaceGuid: string, question: string, answers: readonly string[]) => {
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
        QuestionCreateResponse
    >('/api/question', {
        question,
        editId: '',
        answers,
        correctAnswers: [0],
        explanations: ['', ''],
        questionExplanation: '',
        easyMode: false,
        workspaceGuid,
    })

    return response
}

export const createQuizInBackend = async ({
    workspaceGuid,
    questionIds,
    title = `WTR Quiz ${Date.now()}`,
    description = 'WTR backend quiz',
    mode = 'exam',
    difficulty = 'keep-question',
    passScore = 85,
    timeLimit = 120,
    size,
    finalCount,
}: CreateQuizInBackendOptions): Promise<number> => {
    const response = await postJson<
        {
            title: string
            description: string
            questionIds: readonly number[]
            mode: QuizMode
            difficulty: Difficulty
            passScore: number
            timeLimit: number
            workspaceGuid: string
            size?: number
            finalCount?: number
        },
        number | string
    >('/api/quiz', {
        title,
        description,
        questionIds,
        mode,
        difficulty,
        passScore,
        timeLimit,
        workspaceGuid,
        size,
        finalCount,
    })

    return Number(response)
}
