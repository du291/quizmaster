import { expect } from '@esm-bundle/chai'
import { buildQuestion } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const questions = [
    buildQuestion({
        id: 704,
        question: 'Which of these countries are in Europe? (Easy 3)',
        answers: ['Italy', 'France', 'Morocco', 'Spain', 'Canada'],
        correctAnswers: [0, 1, 3],
        easyMode: true,
    }),
    buildQuestion({
        id: 705,
        question: 'Which of these countries are in Europe? (Easy 2)',
        answers: ['Italy', 'France', 'Morocco', 'Spain', 'Canada'],
        correctAnswers: [0, 1],
        easyMode: true,
    }),
    buildQuestion({
        id: 706,
        question: 'Which of these countries are in Europe? (Normal)',
        answers: ['Italy', 'France', 'Morocco', 'Spain', 'Canada'],
        correctAnswers: [0, 1],
        easyMode: false,
    }),
    buildQuestion({
        id: 707,
        question: 'Which of these countries is not in Europe?',
        answers: ['Italy', 'France', 'Morocco', 'Spain'],
        correctAnswers: [2],
        easyMode: false,
    }),
] as const

const readCorrectAnswersCount = () =>
    document.querySelector<HTMLElement>('.correct-answers-count')?.textContent?.trim() ?? null

const cases = [
    { question: questions[0], expectedCount: '3' },
    { question: questions[1], expectedCount: '2' },
    { question: questions[2], expectedCount: null },
    { question: questions[3], expectedCount: null },
] as const

const installQuestionEasyModeMockApi = () => {
    const questionsById = new Map(questions.map(question => [question.id, question]))
    const routes: readonly Route[] = [
        {
            method: 'GET',
            match: /^\/api\/question\/\d+$/,
            handle: request => {
                const questionId = Number.parseInt(request.path.split('/').pop() ?? '0')
                const question = questionsById.get(questionId)
                if (!question) throw new Error(`Question not found: ${questionId}`)
                return { body: question }
            },
        },
    ]

    return installApiMock(routes)
}

describe('Question.Take.EasyMode feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    for (const testCase of cases) {
        it(`shows correct-answers count ${testCase.expectedCount ?? 'hidden'} for ${testCase.question.question}`, async () => {
            restoreFetch = installQuestionEasyModeMockApi()
            ;({ cleanup } = await renderAppAt(`/question/${testCase.question.id}`))

            await waitFor(() => textContent('#question') === testCase.question.question)

            if (testCase.expectedCount === null) {
                await waitFor(() => readCorrectAnswersCount() === null)
                expect(readCorrectAnswersCount()).to.equal(null)
                return
            }

            await waitFor(() => readCorrectAnswersCount() === testCase.expectedCount)
            expect(readCorrectAnswersCount()).to.equal(testCase.expectedCount)
        })
    }
})
