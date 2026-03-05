import { expect } from '@esm-bundle/chai'
import { createWorkspaceInBackend } from '../support/backend-api.ts'
import { clickElement, nextFrame, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

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

const selectAnswer = async (answer: string) => {
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
}

const answerCurrentQuestion = async (answers: readonly string[]) => {
    for (const answer of answers) {
        await selectAnswer(answer)
    }
    await clickElement('input.submit-btn')
}

const goToScorePage = async () => {
    for (let attempt = 0; attempt < 4; attempt++) {
        if (document.querySelector('#results')) return

        const evaluateButton = document.querySelector<HTMLButtonElement>('#evaluate')
        if (evaluateButton) {
            evaluateButton.click()
            await nextFrame()
            if (document.querySelector('#results')) return
        }

        const submitButton = document.querySelector<HTMLInputElement>('input.submit-btn')
        if (submitButton && !submitButton.disabled) {
            submitButton.click()
            await nextFrame()
        }
    }

    await waitFor(() => document.querySelector('#results') !== null, 5000)
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
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await clickElement('#start')
        await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)

        await answerCurrentQuestion(['Mars', 'Venus'])
        await waitFor(() => textContent('#question').includes('standard colour of sky'))
        await answerCurrentQuestion(['Blue'])

        await goToScorePage()

        expect(textContent('#correct-answers')).to.equal('1.5')
        expect(textContent('#total-questions')).to.equal('2')
        expect(textContent('#percentage-result')).to.equal('75')
        expect(textContent('#text-result')).to.equal('passed')
        expect(textContent('#pass-score')).to.equal('75')
    })
})
