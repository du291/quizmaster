import { setElementValue, setTextValue, waitFor, waitForElement } from './test-harness.tsx'

export interface QuestionFormAnswerSnapshot {
    readonly text: string
    readonly isCorrect: boolean
    readonly explanation: string
}

export interface QuestionFormSnapshot {
    readonly questionText: string
    readonly questionExplanation: string
    readonly isMultipleChoice: boolean
    readonly showExplanations: boolean
    readonly easyModeVisible: boolean
    readonly easyModeChecked: boolean
    readonly answers: readonly QuestionFormAnswerSnapshot[]
}

const requireElement = <T>(element: T | null | undefined, message: string): T => {
    if (!element) throw new Error(message)
    return element
}

const answerRows = () => Array.from(document.querySelectorAll<HTMLElement>('.answer-row'))

const answerRow = (index: number) => requireElement(answerRows()[index], `Missing answer row ${index}`)

const answerTextInput = (index: number) =>
    requireElement(answerRow(index).querySelector<HTMLInputElement>('input.text'), `Missing answer text input ${index}`)

const answerExplanationInput = (index: number) =>
    requireElement(
        answerRow(index).querySelector<HTMLInputElement>('input.explanation'),
        `Missing answer explanation input ${index}`,
    )

const answerCorrectInput = (index: number) =>
    requireElement(
        answerRow(index).querySelector<HTMLInputElement>('input[type="checkbox"], input[type="radio"]'),
        `Missing answer correctness input ${index}`,
    )

export const waitForQuestionEditLoaded = async (expectedQuestionText?: string) => {
    await waitFor(() => document.querySelector<HTMLInputElement>('#is-loaded')?.value === 'loaded', 5000)

    if (expectedQuestionText !== undefined) {
        await waitFor(
            () => document.querySelector<HTMLInputElement | HTMLTextAreaElement>('#question-text')?.value === expectedQuestionText,
            5000,
        )
    }
}

export const waitForPathname = async (expected: string | RegExp, timeoutMs = 5000) => {
    await waitFor(
        () => (typeof expected === 'string' ? window.location.pathname === expected : expected.test(window.location.pathname)),
        timeoutMs,
    )
}

export const setCheckboxValue = async (selector: string, checked: boolean) => {
    const input = await waitForElement<HTMLInputElement>(selector)
    if (input.checked === checked) return
    input.click()
    await waitFor(() => document.querySelector<HTMLInputElement>(selector)?.checked === checked)
}

export const setQuestionText = async (value: string) => {
    await setTextValue('#question-text', value)
}

export const setQuestionExplanation = async (value: string) => {
    await setTextValue('#question-explanation', value)
}

export const setAnswerText = async (index: number, value: string) => {
    await setElementValue(answerTextInput(index), value)
}

export const setAnswerExplanation = async (index: number, value: string) => {
    await setElementValue(answerExplanationInput(index), value)
}

export const selectAnswerAsCorrect = async (index: number) => {
    const input = answerCorrectInput(index)
    if (input.checked) return
    input.click()
    await waitFor(() => answerCorrectInput(index).checked)
}

export const readQuestionFormSnapshot = (): QuestionFormSnapshot => ({
    questionText: requireElement(
        document.querySelector<HTMLInputElement | HTMLTextAreaElement>('#question-text'),
        'Missing question text input',
    ).value,
    questionExplanation: requireElement(
        document.querySelector<HTMLInputElement | HTMLTextAreaElement>('#question-explanation'),
        'Missing question explanation input',
    ).value,
    isMultipleChoice: requireElement(document.querySelector<HTMLInputElement>('#is-multiple-choice'), 'Missing multiple choice input')
        .checked,
    showExplanations: requireElement(document.querySelector<HTMLInputElement>('#show-explanation'), 'Missing show explanation input')
        .checked,
    easyModeVisible: document.querySelector<HTMLInputElement>('#easy-mode') !== null,
    easyModeChecked: document.querySelector<HTMLInputElement>('#easy-mode')?.checked ?? false,
    answers: answerRows().map((_, index) => ({
        text: answerTextInput(index).value,
        isCorrect: answerCorrectInput(index).checked,
        explanation: answerRow(index).querySelector<HTMLInputElement>('input.explanation')?.value ?? '',
    })),
})
