import type { Question } from './question.ts'

export type QuizMode = 'LEARN' | 'EXAM'

export interface Quiz {
    readonly id: number
    readonly title: string
    readonly description: string
    readonly questions: readonly Question[]
    readonly mode: QuizMode
    readonly passScore: number
    readonly timeLimit: number
    readonly size?: number
}

export interface QuizStats {
    readonly timesTaken: number
    readonly timesFinished: number
    readonly averageScore: number
}


