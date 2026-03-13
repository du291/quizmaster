import { clickElement, textContent, waitFor } from './test-harness.tsx'

export interface QuizQuestionContract {
    readonly id: number
    readonly question: string
    readonly answers: readonly string[]
}

interface WaitForQuestionReadyOptions {
    readonly quizId: number
    readonly questionIndex: number
    readonly question: QuizQuestionContract
    readonly timeoutMs?: number
}

interface AnswerQuestionOptions extends WaitForQuestionReadyOptions {
    readonly answers: readonly string[]
}

const questionLabels = () =>
    Array.from(document.querySelectorAll<HTMLLabelElement>('#question-form [id^="answer-label-"]'))

const questionInputs = () =>
    Array.from(
        document.querySelectorAll<HTMLInputElement>('#question-form input[type="radio"], #question-form input[type="checkbox"]'),
    )

const expectedQuestionPath = (quizId: number, questionIndex: number) =>
    questionIndex === 0 ? `/quiz/${quizId}/questions` : `/quiz/${quizId}/questions/${questionIndex}`

const describeQuizUiState = () => {
    const submitButton = document.querySelector<HTMLInputElement>('input.submit-btn')

    return {
        pathname: window.location.pathname,
        question: textContent('#question'),
        labels: questionLabels().map(label => ({
            htmlFor: label.htmlFor,
            text: label.textContent?.trim() ?? '',
        })),
        inputs: questionInputs().map(input => ({
            id: input.id,
            name: input.name,
            checked: input.checked,
            disabled: input.disabled,
            value: input.value,
        })),
        hasEvaluateButton: document.querySelector('#evaluate') !== null,
        hasResults: document.querySelector('#results') !== null,
        hasSubmitButton: submitButton !== null,
        submitButtonDisabled: submitButton?.disabled ?? null,
    }
}

const isQuestionReady = ({ quizId, questionIndex, question }: WaitForQuestionReadyOptions) => {
    const labels = questionLabels()
    const inputs = questionInputs()

    return (
        window.location.pathname === expectedQuestionPath(quizId, questionIndex) &&
        textContent('#question') === question.question &&
        labels.length === question.answers.length &&
        inputs.length === question.answers.length &&
        inputs.every(input => input.name === `question-${question.id}`)
    )
}

export const waitForQuestionReady = async ({
    quizId,
    questionIndex,
    question,
    timeoutMs = 5000,
}: WaitForQuestionReadyOptions) => {
    try {
        await waitFor(() => isQuestionReady({ quizId, questionIndex, question }), timeoutMs)
    } catch (error) {
        throw new Error(
            [
                `Question never became ready for ${question.question}`,
                JSON.stringify({
                    expectedPath: expectedQuestionPath(quizId, questionIndex),
                    expectedQuestion: question.question,
                    expectedQuestionId: question.id,
                    state: describeQuizUiState(),
                }),
                error instanceof Error ? error.message : String(error),
            ].join('\n'),
        )
    }
}

const findAnswerLabel = (answer: string) => questionLabels().find(label => label.textContent?.trim() === answer)

const waitForSubmitEnabled = async (timeoutMs = 2500) => {
    await waitFor(() => {
        const submitButton = document.querySelector<HTMLInputElement>('input.submit-btn')
        return submitButton !== null && !submitButton.disabled
    }, timeoutMs)
}

export const answerQuestion = async ({ quizId, questionIndex, question, answers }: AnswerQuestionOptions) => {
    await waitForQuestionReady({ quizId, questionIndex, question })

    for (const answer of answers) {
        const label = findAnswerLabel(answer)
        if (!label) {
            throw new Error(
                [
                    `Answer label not found for ${answer}`,
                    JSON.stringify({
                        question: question.question,
                        state: describeQuizUiState(),
                    }),
                ].join('\n'),
            )
        }

        const answerId = label.htmlFor
        if (!answerId) {
            throw new Error(`Missing answer input id for ${answer}`)
        }

        await clickElement(`input#${answerId}`)
        await waitFor(() => document.querySelector<HTMLInputElement>(`#question-form input#${answerId}`)?.checked ?? false)
    }

    await waitForSubmitEnabled()
    await clickElement('input.submit-btn')
}

export const goToResultsPage = async (timeoutMs = 5000) => {
    try {
        await waitFor(() => document.querySelector('#evaluate') !== null || document.querySelector('#results') !== null, timeoutMs)
    } catch (error) {
        throw new Error(
            [
                'Results transition never exposed #evaluate or #results',
                JSON.stringify(describeQuizUiState()),
                error instanceof Error ? error.message : String(error),
            ].join('\n'),
        )
    }

    if (document.querySelector('#results')) {
        return
    }

    await clickElement('#evaluate')
    await waitFor(() => document.querySelector('#results') !== null, timeoutMs)
}
