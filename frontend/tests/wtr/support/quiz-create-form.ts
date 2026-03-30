import { waitFor } from './test-harness.tsx'

export const readVisibleQuizQuestionLabels = (): readonly string[] =>
    Array.from(document.querySelectorAll<HTMLLabelElement>('.question-select label'))
        .map(label => label.textContent?.trim() ?? '')
        .filter(text => text !== '')

export const waitForQuizCreateFormLoaded = async (expectedQuestionCount: number) => {
    await waitFor(() => {
        const titleInput = document.querySelector<HTMLInputElement>('#quiz-title')
        const descriptionInput = document.querySelector<HTMLTextAreaElement>('#quiz-description')
        const passScoreInput = document.querySelector<HTMLInputElement>('#pass-score')
        const timeLimitInput = document.querySelector<HTMLInputElement>('#time-limit')

        return (
            titleInput !== null &&
            descriptionInput !== null &&
            passScoreInput !== null &&
            timeLimitInput !== null &&
            readVisibleQuizQuestionLabels().length === expectedQuestionCount
        )
    }, 5000)
}

export const selectQuizQuestionByLabel = async (questionText: string) => {
    await waitFor(() => readVisibleQuizQuestionLabels().includes(questionText), 5000)

    const label = Array.from(document.querySelectorAll<HTMLLabelElement>('.question-select label')).find(
        item => item.textContent?.trim() === questionText,
    )
    if (!label) throw new Error(`Question label not found: ${questionText}`)

    label.click()
}
