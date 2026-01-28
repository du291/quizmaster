import './question-take-page.scss'

import { useState } from 'react'
import { useParams } from 'react-router-dom'

import type { Question } from 'model/question.ts'
import { useApi } from 'api/hooks'
import { fetchQuestion } from 'api/question.ts'
import { QuestionForm } from 'pages/take/question-take'

export const QuestionTakePage = () => {
    const params = useParams()

    const [question, setQuestion] = useState<Question | null>(null)

    useApi(params.id, fetchQuestion, question => {
        const questionWithCat = question.question.includes('😺')
            ? {
                ...question,
                imageUrl:
                    "https://images.unsplash.com/photo-1529778873920-4da4926a72c2?q=80&w=736&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                }
            : question
        setQuestion(questionWithCat)
    })

    return question ? <QuestionForm question={question} mode={'learn' as const} /> : null
}
