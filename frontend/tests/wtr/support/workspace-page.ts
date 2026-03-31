import { nextFrame, waitFor } from './test-harness.tsx'

export const readWorkspaceQuestionTexts = (): readonly string[] =>
    Array.from(document.querySelectorAll<HTMLElement>('.question-holder .question-item #question-text'))
        .map(item => item.textContent?.trim() ?? '')
        .filter(text => text !== '')

export const waitForWorkspaceLoaded = async ({
    title,
    questionCount,
}: {
    readonly title: string
    readonly questionCount: number
}) => {
    await waitFor(() => {
        const titleText = document.querySelector<HTMLElement>('[data-testid="workspace-title"]')?.textContent?.trim() ?? ''
        return titleText === title && readWorkspaceQuestionTexts().length === questionCount
    }, 5000)
}

const findWorkspaceQuestionRow = (questionText: string) =>
    Array.from(document.querySelectorAll<HTMLElement>('.question-holder .question-item')).find(
        row => row.querySelector<HTMLElement>('#question-text')?.textContent?.trim() === questionText,
    )

export const workspaceQuestionHasDeleteButton = (questionText: string) => {
    const row = findWorkspaceQuestionRow(questionText)
    if (!row) throw new Error(`Workspace question row not found: ${questionText}`)
    return row.querySelector<HTMLButtonElement>('button.delete-question') !== null
}

export const clickWorkspaceQuestionButton = async (questionText: string, selector: string) => {
    await waitFor(() => findWorkspaceQuestionRow(questionText) !== undefined, 5000)

    const row = findWorkspaceQuestionRow(questionText)
    if (!row) throw new Error(`Workspace question row not found: ${questionText}`)

    const button = row.querySelector<HTMLButtonElement>(selector)
    if (!button) throw new Error(`Workspace question button not found for ${questionText}: ${selector}`)

    button.click()
    await nextFrame()
}
