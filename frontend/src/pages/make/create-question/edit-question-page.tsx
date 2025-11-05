import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApi } from 'api/hooks'
import { fetchQuestionByEditId, type QuestionApiData, updateQuestion } from 'api/question.ts'

import { QuestionEditForm } from './form/index.ts'
import { LoadedIndicator, QuestionEditLink, QuestionLink } from './components.tsx'
import type { Question } from 'model/question.ts'

export function EditQuestionPage() {
    const params = useParams()
    const questionEditId = params.id || ''

    const [question, setQuestion] = useState<Question | undefined>(undefined)

    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [linkToQuestion, setLinkToQuestion] = useState<string>('')
    const [linkToEditQuestion, setLinkToEditQuestion] = useState<string>('')

    useApi(questionEditId, fetchQuestionByEditId, question => {
        setQuestion(question)
        setLinkToQuestion(`${location.origin}/question/${question.id}`)
        setLinkToEditQuestion(`${location.origin}/question/${questionEditId}/edit`)
        setIsLoaded(true)
    })

    const handleSubmit = (questionData: QuestionApiData) => {
        updateQuestion(questionData, questionEditId)
    }

    return (
        <>
            <h1 data-testid="edit-question-title">Edit Question</h1>
            <div className="question-page">
                <QuestionEditForm key={question?.editId || ''} question={question} onSubmit={handleSubmit} />
                <QuestionLink url={linkToQuestion} />
                <QuestionEditLink editUrl={linkToEditQuestion} />
                <LoadedIndicator isLoaded={isLoaded} />
            </div>
        </>
    )
}
