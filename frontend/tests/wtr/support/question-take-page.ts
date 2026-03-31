import { textContent, waitFor } from './test-harness.tsx'

export const readQuestionTakeAnswerLabels = (): readonly string[] =>
    Array.from(document.querySelectorAll<HTMLLabelElement>('#question-form [id^="answer-label-"]'))
        .map(label => label.textContent?.trim() ?? '')
        .filter(text => text !== '')

export const waitForQuestionTakeLoaded = async ({
    questionText,
    answers,
}: {
    readonly questionText: string
    readonly answers: readonly string[]
}) => {
    await waitFor(() => {
        const visibleAnswers = readQuestionTakeAnswerLabels()
        return (
            textContent('#question') === questionText &&
            visibleAnswers.length === answers.length &&
            answers.every(answer => visibleAnswers.includes(answer))
        )
    }, 5000)
}
