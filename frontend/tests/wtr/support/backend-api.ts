type WorkspaceCreateResponse = {
    readonly guid: string
}

type QuestionCreateResponse = {
    readonly id: number
    readonly editId: string
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
