import { expect } from '@esm-bundle/chai'
import type { Question } from '../../../src/model/question.ts'
import type { Quiz } from '../../../src/model/quiz.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { answerQuestion, goToResultsPage } from '../support/quiz-flow.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const question = (
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

const partialScoreQuiz: Quiz = {
    id: 3201,
    title: 'Quiz A',
    description: 'Description A',
    mode: 'exam',
    difficulty: 'keep-question',
    passScore: 75,
    timeLimit: 120,
    questions: [
        question(
            1,
            'Which of the following are planets? (Partial Score)',
            ['Mars', 'Pluto', 'Titan', 'Venus', 'Earth'],
            [0, 3, 4],
            'Planets',
        ),
        question(2, 'What is the standard colour of sky?', ['Red', 'Blue', 'Green', 'Black'], [1], 'Rayleigh'),
    ],
}

const installPartialScoreMockApi = () => {
    const routes: readonly Route[] = [
        {
            method: 'GET',
            match: /^\/api\/quiz\/\d+$/,
            handle: request => {
                const quizId = Number.parseInt(request.path.split('/').pop() ?? '0')
                if (quizId !== partialScoreQuiz.id) throw new Error(`Quiz not found: ${quizId}`)
                return { body: partialScoreQuiz }
            },
        },
    ]

    return installApiMock(routes)
}

describe('Quiz.Score.Partial feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        sessionStorage.clear()
        await cleanup()
    })

    const examples = [
        { answers: 'Mars, Venus, Earth', correct: '2', percentage: '100', result: 'passed' as const },
        { answers: 'Mars, Venus, Titan, Earth', correct: '1.5', percentage: '75', result: 'passed' as const },
        { answers: 'Mars, Venus', correct: '1.5', percentage: '75', result: 'passed' as const },
        { answers: 'Mars, Pluto', correct: '1', percentage: '50', result: 'failed' as const },
        { answers: 'Mars, Pluto, Venus, Titan', correct: '1', percentage: '50', result: 'failed' as const },
        { answers: 'Pluto, Titan', correct: '1', percentage: '50', result: 'failed' as const },
    ]

    for (const example of examples) {
        it(`scores "${example.answers}" as ${example.correct}/2 (${example.percentage}%)`, async () => {
            restoreFetch = installPartialScoreMockApi()
            ;({ cleanup } = await renderAppAt(`/quiz/${partialScoreQuiz.id}`))

            await clickElement('#start')
            await waitFor(() => window.location.pathname === `/quiz/${partialScoreQuiz.id}/questions`)

            const partialAnswers = example.answers.split(',').map(answer => answer.trim())
            await answerQuestion({
                quizId: partialScoreQuiz.id,
                questionIndex: 0,
                question: partialScoreQuiz.questions[0],
                answers: partialAnswers,
            })

            await answerQuestion({
                quizId: partialScoreQuiz.id,
                questionIndex: 1,
                question: partialScoreQuiz.questions[1],
                answers: ['Blue'],
            })

            await goToResultsPage()

            expect(textContent('#correct-answers')).to.equal(example.correct)
            expect(textContent('#total-questions')).to.equal('2')
            expect(textContent('#percentage-result')).to.equal(example.percentage)
            expect(textContent('#text-result')).to.equal(example.result)
            expect(textContent('#pass-score')).to.equal('75')
        })
    }
})
