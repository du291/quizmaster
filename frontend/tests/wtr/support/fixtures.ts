import type { Question } from '../../../src/model/question.ts'
import type { QuestionListItem } from '../../../src/model/question-list-item.ts'
import type { Difficulty, Quiz, QuizMode } from '../../../src/model/quiz.ts'
import type { QuizListItem } from '../../../src/model/quiz-list-item.ts'
import type { Workspace } from '../../../src/model/workspace.ts'

export const workspaceGuid = 'workspace-wtr-1'

export const workspace: Workspace = {
    guid: workspaceGuid,
    title: 'My List',
}

export const questionListItems: readonly QuestionListItem[] = [
    { id: 1, editId: 'edit-1', question: '2 + 2 = ?', isInAnyQuiz: false },
    { id: 2, editId: 'edit-2', question: '3 * 3 = ?', isInAnyQuiz: false },
    { id: 3, editId: 'edit-3', question: '4 / 2 = ?', isInAnyQuiz: false },
    { id: 4, editId: 'edit-4', question: 'Jaký nábytek má Ikea?', isInAnyQuiz: false },
    { id: 5, editId: 'edit-5', question: 'Jaké nádobí má Ikea?', isInAnyQuiz: false },
    { id: 6, editId: 'edit-6', question: 'Jaký venkovní Nábytek má Ikea?', isInAnyQuiz: false },
]

const questionBank = new Map<number, Question>([
    [
        1,
        {
            id: 1,
            editId: 'edit-1',
            question: '2 + 2 = ?',
            answers: ['4', '5'],
            explanations: ['', ''],
            correctAnswers: [0],
            questionExplanation: '',
            workspaceGuid,
            easyMode: false,
        },
    ],
    [
        2,
        {
            id: 2,
            editId: 'edit-2',
            question: '3 * 3 = ?',
            answers: ['9', '6'],
            explanations: ['', ''],
            correctAnswers: [0],
            questionExplanation: '',
            workspaceGuid,
            easyMode: false,
        },
    ],
    [
        3,
        {
            id: 3,
            editId: 'edit-3',
            question: '4 / 2 = ?',
            answers: ['2', '3'],
            explanations: ['', ''],
            correctAnswers: [0],
            questionExplanation: '',
            workspaceGuid,
            easyMode: false,
        },
    ],
    [
        4,
        {
            id: 4,
            editId: 'edit-4',
            question: 'Jaký nábytek má Ikea?',
            answers: ['Stůl', 'Auto'],
            explanations: ['', ''],
            correctAnswers: [0],
            questionExplanation: '',
            workspaceGuid,
            easyMode: false,
        },
    ],
    [
        5,
        {
            id: 5,
            editId: 'edit-5',
            question: 'Jaké nádobí má Ikea?',
            answers: ['Talíř', 'Kolo'],
            explanations: ['', ''],
            correctAnswers: [0],
            questionExplanation: '',
            workspaceGuid,
            easyMode: false,
        },
    ],
    [
        6,
        {
            id: 6,
            editId: 'edit-6',
            question: 'Jaký venkovní Nábytek má Ikea?',
            answers: ['Židle', 'Triangl'],
            explanations: ['', ''],
            correctAnswers: [0],
            questionExplanation: '',
            workspaceGuid,
            easyMode: false,
        },
    ],
])

interface QuestionFixtureOptions {
    readonly id: number
    readonly question: string
    readonly answers: readonly string[]
    readonly correctAnswers?: readonly number[]
    readonly explanations?: readonly string[]
    readonly questionExplanation?: string
    readonly editId?: string
    readonly workspaceGuid?: string | null
    readonly easyMode?: boolean
    readonly imageUrl?: string
}

export const buildQuestion = ({
    id,
    question,
    answers,
    correctAnswers = [0],
    explanations = answers.map(() => ''),
    questionExplanation = '',
    editId = `edit-${id}`,
    workspaceGuid = null,
    easyMode = false,
    imageUrl,
}: QuestionFixtureOptions): Question => ({
    id,
    editId,
    question,
    imageUrl,
    answers: [...answers],
    explanations: [...explanations],
    correctAnswers: [...correctAnswers],
    questionExplanation,
    workspaceGuid,
    easyMode,
})

interface QuizFixtureOptions {
    readonly id: number
    readonly title: string
    readonly description: string
    readonly questions?: readonly Question[]
    readonly questionIds?: readonly number[]
    readonly mode?: QuizMode
    readonly difficulty?: Difficulty
    readonly passScore?: number
    readonly timeLimit?: number
    readonly size?: number
}

export const buildQuizFixture = ({
    id,
    title,
    description,
    questions,
    questionIds,
    mode = 'exam',
    difficulty = 'keep-question',
    passScore = 80,
    timeLimit = 600,
    size,
}: QuizFixtureOptions): Quiz => {
    const resolvedQuestions =
        questions ??
        questionIds?.map(questionId => {
            const question = questionBank.get(questionId)
            if (!question) throw new Error(`Unknown question ${questionId}`)
            return question
        })

    if (!resolvedQuestions) throw new Error('buildQuizFixture requires either questions or questionIds')

    return {
        id,
        title,
        description,
        mode,
        difficulty,
        passScore,
        timeLimit,
        size,
        questions: [...resolvedQuestions],
    }
}

export const buildQuiz = (
    id: number,
    title: string,
    description: string,
    questionIds: readonly number[],
    size?: number,
): Quiz => buildQuizFixture({ id, title, description, questionIds, size })

export const toQuizListItems = (quizzes: readonly Quiz[]): readonly QuizListItem[] =>
    quizzes.map(quiz => ({ id: quiz.id, title: quiz.title }))
