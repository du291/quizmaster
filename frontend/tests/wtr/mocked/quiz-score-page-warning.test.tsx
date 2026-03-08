import { expect } from '@esm-bundle/chai'
import { createRoot, type Root } from 'react-dom/client'
import type { Question } from '../../../src/model/question.ts'
import type { Quiz } from '../../../src/model/quiz.ts'
import { QuizScorePage } from '../../../src/pages/take/quiz-take/quiz-score-page.tsx'
import type { QuizAnswers } from '../../../src/pages/take/quiz-take/quiz-answers-state.ts'
import { flushFrames } from '../support/test-harness.tsx'

const makeQuestion = (
    id: number,
    title: string,
    answers: readonly string[],
    correctAnswers: readonly number[],
): Question => ({
    id,
    editId: `edit-${id}`,
    question: title,
    answers: [...answers],
    explanations: answers.map(() => ''),
    correctAnswers: [...correctAnswers],
    questionExplanation: '',
    workspaceGuid: null,
    easyMode: false,
})

const quiz: Quiz = {
    id: 3301,
    title: 'Score Warning Quiz',
    description: 'Score warning coverage',
    mode: 'exam',
    difficulty: 'keep-question',
    passScore: 50,
    timeLimit: 120,
    questions: [
        makeQuestion(1, 'Question 1', ['Correct 1', 'Wrong 1'], [0]),
        makeQuestion(2, 'Question 2', ['Correct 2', 'Wrong 2'], [0]),
    ],
}

const quizAnswers: QuizAnswers = {
    firstAnswers: [[0], [1]],
    finalAnswers: [[0], [1]],
}

describe('QuizScorePage warning regression', () => {
    let host: HTMLDivElement | null = null
    let root: Root | null = null
    let originalConsoleError: typeof console.error
    let consoleErrors: string[] = []

    beforeEach(() => {
        consoleErrors = []
        originalConsoleError = console.error
        console.error = (...args: unknown[]) => {
            consoleErrors.push(args.map(arg => String(arg)).join(' '))
        }
    })

    afterEach(async () => {
        console.error = originalConsoleError
        root?.unmount()
        host?.remove()
        root = null
        host = null
        await flushFrames()
    })

    it('does not emit the React missing-key warning for answer overview items', async () => {
        host = document.createElement('div')
        document.body.append(host)
        root = createRoot(host)
        root.render(<QuizScorePage quiz={quiz} quizAnswers={quizAnswers} />)

        await flushFrames()

        expect(
            consoleErrors.some(message => message.includes('Each child in a list should have a unique "key" prop')),
        ).to.equal(false)
    })
})
