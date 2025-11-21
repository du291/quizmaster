import type { Question } from './question.ts'

export type QuizMode = 'LEARN' | 'EXAM'
export type EasyMode = 'ALWAYS' | 'NEVER' | 'PERQUESTION'

export interface Quiz {
    readonly id: number
    readonly title: string
    readonly description: string
    readonly questions: readonly Question[]
    readonly mode: QuizMode
    readonly easyMode?: EasyMode
    readonly passScore: number
    readonly timeLimit: number
    readonly size?: number
}

export interface QuizStats {
    readonly timesTaken: number
    readonly timesFinished: number
    readonly averageScore: number
    readonly timeoutCount: number
    readonly failureRate: number
    readonly successRate: number
    readonly averageTime: number
}
