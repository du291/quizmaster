export type QuizMode = 'learn' | 'exam' | ''
export type EasyMode = 'ALWAYS' | 'NEVER' | 'PERQUESTION'

export interface Quiz {
    title: string
    description: string
    questionIds: number[]
    mode: QuizMode
    passScore: number
    timeLimit: number
    size?: number
    easyMode?: EasyMode
}

export interface QuizBookmark extends Quiz {
    url: string
}

export const emptyQuiz = (): Quiz => ({
    title: '',
    description: '',
    questionIds: [],
    mode: '',
    passScore: 0,
    timeLimit: 120,
})
export const emptyQuizBookmark = (): QuizBookmark => ({
    url: '',
    title: '',
    description: '',
    questionIds: [],
    mode: '',
    passScore: 0,
    timeLimit: 120,
})
