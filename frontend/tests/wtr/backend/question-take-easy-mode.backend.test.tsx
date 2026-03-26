import { expect } from '@esm-bundle/chai'
import { createQuestionInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const readCorrectAnswersCount = () =>
    document.querySelector<HTMLElement>('.correct-answers-count')?.textContent?.trim() ?? null

const cases = [
    {
        question: 'Which of these countries are in Europe? (Easy 3)',
        answers: ['Italy', 'France', 'Morocco', 'Spain', 'Canada'],
        correctAnswers: [0, 1, 3],
        easyMode: true,
        expectedCount: '3',
    },
    {
        question: 'Which of these countries are in Europe? (Easy 2)',
        answers: ['Italy', 'France', 'Morocco', 'Spain', 'Canada'],
        correctAnswers: [0, 1],
        easyMode: true,
        expectedCount: '2',
    },
    {
        question: 'Which of these countries are in Europe? (Normal)',
        answers: ['Italy', 'France', 'Morocco', 'Spain', 'Canada'],
        correctAnswers: [0, 1],
        easyMode: false,
        expectedCount: null,
    },
    {
        question: 'Which of these countries is not in Europe?',
        answers: ['Italy', 'France', 'Morocco', 'Spain'],
        correctAnswers: [2],
        easyMode: false,
        expectedCount: null,
    },
] as const

const prepareQuestion = async (testCase: (typeof cases)[number]) => {
    const suffix = `${Date.now()}-${testCase.expectedCount ?? 'hidden'}`
    const workspaceGuid = await createWorkspaceInBackend(`WTR Question Easy Mode Workspace ${suffix}`)
    const questionText = `${testCase.question} ${suffix}`
    const question = await createQuestionInBackend(workspaceGuid, questionText, testCase.answers, {
        correctAnswers: testCase.correctAnswers,
        easyMode: testCase.easyMode,
    })

    return {
        questionId: question.id,
        questionText,
        expectedCount: testCase.expectedCount,
    }
}

describe('Question.Take.EasyMode feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    for (const testCase of cases) {
        it(`shows correct-answers count ${testCase.expectedCount ?? 'hidden'} for ${testCase.question}`, async () => {
            const prepared = await prepareQuestion(testCase)
            ;({ cleanup } = await renderAppAt(`/question/${prepared.questionId}`))

            await waitFor(() => textContent('#question') === prepared.questionText)

            if (prepared.expectedCount === null) {
                await waitFor(() => readCorrectAnswersCount() === null)
                expect(readCorrectAnswersCount()).to.equal(null)
                return
            }

            await waitFor(() => readCorrectAnswersCount() === prepared.expectedCount)
            expect(readCorrectAnswersCount()).to.equal(prepared.expectedCount)
        })
    }
})
