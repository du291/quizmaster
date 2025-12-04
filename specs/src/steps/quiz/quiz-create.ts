import type { DataTable } from '@cucumber/cucumber'
import { Given, Then } from '../fixture.ts'
import { type QuizmasterWorld, type Quiz, type QuizMode, type Question, parseKey } from '../world/index.ts'
import { createQuestion } from '../question/ops.ts'
import { expect } from '@playwright/test'

const postQuiz = async (world: QuizmasterWorld, bookmark: string, quiz: Quiz) => {
    const questionIds = quiz.questionIds

    const quizPayload = {
        title: quiz.title,
        description: quiz.description,
        questionIds,
        mode: quiz.mode.toUpperCase() as QuizMode,
        passScore: quiz.passScore,
        timeLimit: quiz.timeLimit,
        size: quiz.size,
    }

    const response = await world.page.request.post('/api/quiz', { data: quizPayload })
    const quizId = await response.json()
    const quizUrl = `/quiz/${quizId}`

    world.quizBookmarks[bookmark] = { url: quizUrl, ...quiz }
    world.activeQuizBookmark = bookmark
}

const validateQuizRow = (questionBookmarks: Record<string, Question>, row: Record<string, string>) => {
    const hasBookmark = row.bookmark !== ''
    const hasMode = row.mode === 'exam' || row.mode === 'learn'
    const hasPassScore = row['pass score'] !== ''

    const hasValidQuestions =
        !Number.isNaN(Number.parseInt(row.questions)) ||
        parseKey(row.questions).every(bookmark => questionBookmarks[bookmark] !== undefined)

    return hasBookmark && hasMode && hasPassScore && hasValidQuestions
}

const createDummyQuestion = async (world: QuizmasterWorld, bookmark: string) => {
    await createQuestion(world, bookmark, '1 + 1 = ?', {
        raw: () => [
            ['2', '*', ''],
            ['3', '', ''],
        ],
    })
}

const createDummyQuestions = async (world: QuizmasterWorld, quizBookmark: string, count: number) => {
    const questionBookmarks = Array.from({ length: count }, (_, i) => `${quizBookmark} ${i}`)

    for (const bookmark of questionBookmarks) {
        await createDummyQuestion(world, bookmark)
    }

    return questionBookmarks
}

const toQuiz = async (world: QuizmasterWorld, row: Record<string, string>): Promise<Quiz> => {
    if (!validateQuizRow(world.questionBookmarks, row))
        throw new Error(`Invalid quiz row: ${JSON.stringify(row, null, 2)}`)

    const dummyQuestions = Number.parseInt(row.questions)

    const questionBookmarks = Number.isNaN(dummyQuestions)
        ? parseKey(row.questions)
        : await createDummyQuestions(world, row.bookmark, dummyQuestions)

    return {
        title: row.title || row.bookmark,
        description: row.description || row.bookmark,
        questionIds: questionBookmarks
            .map(bookmark => world.questionBookmarks[bookmark])
            .map(question => Number.parseInt(question.url.split('/').pop() || '0')),
        mode: row.mode as QuizMode,
        passScore: Number.parseInt(row['pass score']),
        timeLimit: Number.parseInt(row['time limit']),
        size: Number.parseInt(row.size) || undefined,
    }
}

Given(
    /a quiz "([^"]+)" with (\d+) questions, (exam|learn) mode and (\d+)% pass score/,
    async function (bookmark: string, questions: number, mode: QuizMode, passScore: number) {
        const quiz = await toQuiz(this, {
            bookmark,
            questions: questions.toString(),
            mode,
            'pass score': passScore.toString(),
            timeLimit: '120',
        })

        await postQuiz(this, bookmark, quiz)
    },
)

Given('quizes', async function (data: DataTable) {
    for (const row of data.hashes()) {
        await postQuiz(this, row.bookmark, await toQuiz(this, row))
    }
})

Then('I see selected question count {int}', async function (expectedCount: number) {
    const actualCount = await this.quizCreatePage.selectedQuestionCountForQuiz()
    expect(Number.parseInt(actualCount || '0')).toBe(expectedCount)
})

Then('I see total question count {int}', async function (expectedCount: number) {
    const actualCount = await this.quizCreatePage.totalQuestionCountForQuiz()
    expect(Number.parseInt(actualCount || '0')).toBe(expectedCount)
})
