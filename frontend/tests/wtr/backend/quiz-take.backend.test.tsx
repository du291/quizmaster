import { createQuestionInBackend, createQuizInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

type QuizMode = 'exam' | 'learn'

const feedbackText = () => document.querySelector('.question-feedback')?.textContent?.trim() ?? ''

const startQuiz = async (quizId: number) => {
    await clickElement('#start')
    await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)
}

const answerQuestion = async (answer: string) => {
    await waitFor(() =>
        Array.from(document.querySelectorAll<HTMLLabelElement>('[id^="answer-label-"]')).some(
            label => label.textContent?.trim() === answer,
        ),
    )
    const label = Array.from(document.querySelectorAll<HTMLLabelElement>('[id^="answer-label-"]')).find(
        item => item.textContent?.trim() === answer,
    )
    if (!label) throw new Error(`Answer label not found: ${answer}`)
    const answerId = label.htmlFor
    if (!answerId) throw new Error(`Missing answer input id for ${answer}`)
    await clickElement(`input#${answerId}`)
    await waitFor(() => document.querySelector<HTMLInputElement>(`input#${answerId}`)?.checked ?? false)
    await clickElement('input.submit-btn')
}

const prepareQuiz = async (mode: QuizMode) => {
    const suffix = `${Date.now()}-${mode}`
    const workspaceGuid = await createWorkspaceInBackend(`WTR Take Workspace ${suffix}`)
    const questionA = await createQuestionInBackend(workspaceGuid, 'Jaký nábytek má Ikea?', ['Stůl', 'Auto'])
    const questionB = await createQuestionInBackend(workspaceGuid, 'Jaké nádobí má Ikea?', ['Talíř', 'Kolo'])
    const quizId = await createQuizInBackend({
        workspaceGuid,
        questionIds: [questionA.id, questionB.id],
        title: `WTR Take ${mode} ${suffix}`,
        description: 'Backend take smoke',
        mode,
        passScore: 85,
        timeLimit: 120,
    })

    return { quizId }
}

describe('Quiz.Take feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        sessionStorage.clear()
        await cleanup()
    })

    it('exam mode advances directly to the next question without immediate feedback', async () => {
        const { quizId } = await prepareQuiz('exam')
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await startQuiz(quizId)
        await waitFor(() => textContent('#question') === 'Jaký nábytek má Ikea?')

        await answerQuestion('Stůl')

        await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions/1`)
        await waitFor(() => textContent('#question') === 'Jaké nádobí má Ikea?')
        await waitFor(() => document.querySelector('.question-feedback') === null)
    })

    it('learn mode shows feedback and waits for manual next navigation', async () => {
        const { quizId } = await prepareQuiz('learn')
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await startQuiz(quizId)
        await waitFor(() => textContent('#question') === 'Jaký nábytek má Ikea?')

        await answerQuestion('Stůl')

        await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)
        await waitFor(() => textContent('#question') === 'Jaký nábytek má Ikea?')
        await waitFor(() => feedbackText() === 'Correct!')

        await clickElement('#next')
        await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions/1`)
        await waitFor(() => textContent('#question') === 'Jaké nádobí má Ikea?')
    })
})
