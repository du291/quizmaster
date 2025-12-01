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
