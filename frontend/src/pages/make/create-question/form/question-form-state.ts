import { useState } from 'react'
import { updated } from 'helpers.ts'
import type { Question } from 'model/question.ts'
import type { QuestionApiData } from 'api/question.ts'

export interface AnswerState {
    readonly index: number
    readonly answer: string
    readonly explanation: string
    readonly isCorrect: boolean
    readonly setAnswer: (value: string) => void
    readonly setExplanation: (value: string) => void
    readonly toggleCorrect: () => void
}

export interface QuestionFormState {
    readonly questionText: string
    readonly answers: readonly string[]
    readonly explanations: readonly string[]
    readonly correctAnswers: readonly number[]
    readonly isMultipleChoice: boolean
    readonly easyMode: boolean
    readonly questionExplanation: string
}

export const useQuestionFormState = (question?: Question) => {
    const [questionText, setQuestionText] = useState<string>(question?.question || '')
    const [isMultipleChoice, setIsMultipleChoice] = useState((question?.correctAnswers?.length || 0) > 1 || false)
    const [easyMode, setEasyMode] = useState(question?.easyMode || false)

    const [answers, setAnswers] = useState<readonly string[]>(question?.answers || ['', ''])
    const [explanations, setExplanations] = useState<readonly string[]>(question?.explanations || ['', ''])
    const [correctAnswers, setCorrectAnswers] = useState<readonly number[]>(question?.correctAnswers || [])

    const [questionExplanation, setQuestionExplanation] = useState(question?.questionExplanation || '')

    const setAnswer = (index: number, answer: string) => setAnswers(updated(answers, index, answer))

    const setExplanation = (index: number, explanation: string) =>
        setExplanations(updated(explanations, index, explanation))

    const toggleCorrect = (index: number) => {
        if (isMultipleChoice) {
            // Multiple choice: toggle the index in/out of the array
            setCorrectAnswers(
                correctAnswers.includes(index) ? correctAnswers.filter(i => i !== index) : [...correctAnswers, index],
            )
        } else {
            // Single choice: simulate radio buttons - unset previous, set new
            setCorrectAnswers(correctAnswers.includes(index) ? [] : [index])
        }
    }

    const addAnswer = () => {
        setAnswers([...answers, ''])
        setExplanations([...explanations, ''])
    }

    const answerStates: readonly AnswerState[] = answers.map((answer, index) => ({
        index,
        answer,
        explanation: explanations[index] || '',
        isCorrect: correctAnswers.includes(index),
        setAnswer: (value: string) => setAnswer(index, value),
        setExplanation: (value: string) => setExplanation(index, value),
        toggleCorrect: () => toggleCorrect(index),
    }))

    return {
        questionText,
        answerStates,
        answers,
        explanations,
        correctAnswers,
        questionExplanation,
        isMultipleChoice,
        easyMode,

        setQuestionText,
        addAnswer,
        setQuestionExplanation,
        setIsMultipleChoice,
        setEasyMode,
    }
}

export const stateToQuestionApiData = (state: QuestionFormState): QuestionApiData => {
    return {
        question: state.questionText,
        editId: '',
        workspaceGuid: '',
        answers: Array.from(state.answers),
        correctAnswers: Array.from(state.correctAnswers),
        explanations: Array.from(state.explanations),
        questionExplanation: state.questionExplanation,
        easyMode: state.easyMode,
    }
}
