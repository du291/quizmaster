import { expect } from '@esm-bundle/chai'
import type { Question } from '../../../src/model/question.ts'
import type { Quiz } from '../../../src/model/quiz.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { clickElement, nextFrame, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const makeQuestion = (
    id: number,
    title: string,
    answers: readonly string[],
    correctAnswers: readonly number[],
    questionExplanation = '',
): Question => ({
    id,
    editId: `edit-${id}`,
    question: title,
    answers: [...answers],
    explanations: answers.map(() => ''),
    correctAnswers: [...correctAnswers],
    questionExplanation,
    workspaceGuid: null,
    easyMode: false,
})

const scoreQuiz: Quiz = {
    id: 3101,
    title: 'Score Quiz',
    description: 'Score scenarios',
    mode: 'exam',
    difficulty: 'keep-question',
    passScore: 75,
    timeLimit: 120,
    questions: [
        makeQuestion(1, 'Question 1', ['Correct 1', 'Wrong 1'], [0]),
        makeQuestion(2, 'Question 2', ['Correct 2', 'Wrong 2'], [0]),
        makeQuestion(3, 'Question 3', ['Correct 3', 'Wrong 3'], [0]),
        makeQuestion(4, 'Question 4', ['Correct 4', 'Wrong 4'], [0]),
    ],
}

const scoreDetailsQuiz: Quiz = {
    id: 3102,
    title: 'Quiz A',
    description: 'Description A',
    mode: 'exam',
    difficulty: 'keep-question',
    passScore: 85,
    timeLimit: 120,
    questions: [
        makeQuestion(
            11,
            'What is the standard colour of sky?',
            ['Red', 'Blue', 'Green', 'Black'],
            [1],
            'Rayleigh',
        ),
        makeQuestion(12, 'What is capital of France?', ['Marseille', 'Lyon', 'Paris', 'Toulouse'], [2]),
    ],
}

const quizzesById = new Map<number, Quiz>([
    [scoreQuiz.id, scoreQuiz],
    [scoreDetailsQuiz.id, scoreDetailsQuiz],
])

const installQuizScoreMockApi = () => {
    const routes: readonly Route[] = [
        {
            method: 'GET',
            match: /^\/api\/quiz\/\d+$/,
            handle: request => {
                const quizId = Number.parseInt(request.path.split('/').pop() ?? '0')
                const quiz = quizzesById.get(quizId)
                if (!quiz) throw new Error(`Quiz not found: ${quizId}`)
                return { body: quiz }
            },
        },
    ]

    return installApiMock(routes)
}

const answerByPosition = async (position: number) => {
    await waitFor(() => document.querySelectorAll<HTMLLabelElement>('[id^="answer-label-"]').length > position)
    const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('[id^="answer-label-"]'))
    const label = labels[position]
    if (!label) throw new Error(`Answer label not found at position ${position}`)
    const answerId = label.htmlFor
    if (!answerId) throw new Error(`Missing answer input id for position ${position}`)
    await clickElement(`input#${answerId}`)
    await clickElement('input.submit-btn')
}

const answerQuizSequence = async (positions: readonly number[]) => {
    for (let i = 0; i < positions.length; i++) {
        const questionBeforeSubmit = textContent('#question')
        await answerByPosition(positions[i])
        if (i < positions.length - 1) {
            await waitFor(() => textContent('#question') !== '' && textContent('#question') !== questionBeforeSubmit)
        }
    }
}

const startQuiz = async (quizId: number) => {
    await clickElement('#start')
    await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)
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
            continue
        }

        const firstLabel = document.querySelector<HTMLLabelElement>('[id^="answer-label-"]')
        const answerId = firstLabel?.htmlFor
        if (answerId) {
            const answerInput = document.querySelector<HTMLInputElement>(`input#${answerId}`)
            answerInput?.click()
            await nextFrame()
            const retrySubmit = document.querySelector<HTMLInputElement>('input.submit-btn')
            if (retrySubmit && !retrySubmit.disabled) {
                retrySubmit.click()
                await nextFrame()
            }
        }
    }

    await waitFor(() => document.querySelector('#results') !== null, 5000)
}

const expectScore = async (
    correctAnswers: string,
    totalQuestions: string,
    percentage: string,
    result: 'passed' | 'failed',
    passScore: string,
) => {
    await waitFor(() => {
        return (
            textContent('#correct-answers') === correctAnswers &&
            textContent('#total-questions') === totalQuestions &&
            textContent('#percentage-result') === percentage &&
            textContent('#text-result') === result &&
            textContent('#pass-score') === passScore
        )
    })
}

describe('Quiz.Score feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        sessionStorage.clear()
        await cleanup()
    })

    const cases = [
        { correct: 4, incorrect: 0, percentage: '100', result: 'passed' as const },
        { correct: 3, incorrect: 1, percentage: '75', result: 'passed' as const },
        { correct: 2, incorrect: 2, percentage: '50', result: 'failed' as const },
        { correct: 0, incorrect: 4, percentage: '0', result: 'failed' as const },
    ]

    for (const example of cases) {
        it(`evaluates score for ${example.correct} correct and ${example.incorrect} incorrect`, async () => {
            restoreFetch = installQuizScoreMockApi()
            ;({ cleanup } = await renderAppAt(`/quiz/${scoreQuiz.id}`))

            await startQuiz(scoreQuiz.id)

            const sequence = Array.from({ length: example.correct }, () => 0).concat(
                Array.from({ length: example.incorrect }, () => 1),
            )
            await answerQuizSequence(sequence)

            await goToScorePage()
            await expectScore(String(example.correct), '4', example.percentage, example.result, '75')
        })
    }

    it('shows questions, options, question explanation and user selection on score page', async () => {
        restoreFetch = installQuizScoreMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${scoreDetailsQuiz.id}`))

        await startQuiz(scoreDetailsQuiz.id)
        const firstQuestion = textContent('#question')
        await answerByPosition(1) // Blue
        await waitFor(() => textContent('#question') !== '' && textContent('#question') !== firstQuestion)
        await answerByPosition(0) // Marseille
        await goToScorePage()

        const questionNames = Array.from(document.querySelectorAll<HTMLElement>('[id^="question-name-"]')).map(item =>
            item.textContent?.trim(),
        )
        expect(questionNames).to.include('What is the standard colour of sky?')
        expect(questionNames).to.include('What is capital of France?')

        const skyFieldset = Array.from(document.querySelectorAll<HTMLElement>('fieldset[id^="question-"]')).find(item =>
            item.textContent?.includes('What is the standard colour of sky?'),
        )
        if (!skyFieldset) throw new Error('Sky question fieldset not found')

        const skyAnswers = Array.from(skyFieldset.querySelectorAll<HTMLElement>('[id^="answer-label-"]')).map(item =>
            item.textContent?.trim(),
        )
        expect(skyAnswers).to.include('Red')
        expect(skyAnswers).to.include('Blue')
        expect(skyAnswers).to.include('Green')
        expect(skyAnswers).to.include('Black')

        expect(skyFieldset.textContent).to.contain('Rayleigh')

        const selectedInput = skyFieldset.querySelector<HTMLInputElement>('input:checked')
        if (!selectedInput) throw new Error('Selected answer input not found for sky question')
        const selectedLabel = skyFieldset.querySelector<HTMLLabelElement>(`label[for="${selectedInput.id}"]`)
        expect(selectedLabel?.textContent?.trim()).to.equal('Blue')
    })
})
