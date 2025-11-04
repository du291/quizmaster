import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApi } from 'api/hooks'
import { type QuestionApiData, fetchQuestionByEditId, updateQuestion } from 'api/question.ts'

import {
    emptyQuestionFormData,
    QuestionEditForm,
    type QuestionFormData,
    toQuestionApiData,
    toQuestionFormData,
} from './form'
import { validateQuestionFormData } from './validators'
import { ErrorMessages, type ErrorCodes } from './form/error-message'
import { LoadedIndicator, QuestionEditLink, QuestionLink } from './components.tsx'

export function EditQuestionContainer() {
    const params = useParams()
    const questionEditId = params.id

    const [questionData, setQuestionData] = useState(emptyQuestionFormData())

    const [isLoaded, setIsLoaded] = useState<boolean>(false)
    const [linkToQuestion, setLinkToQuestion] = useState<string>('')
    const [linkToEditQuestion, setLinkToEditQuestion] = useState<string>('')
    const [errors, setErrors] = useState<ErrorCodes>(new Set())

    useApi(questionEditId, fetchQuestionByEditId, question => {
        setQuestionData(toQuestionFormData(question))
        setLinkToQuestion(`${location.origin}/question/${question.id}`)
        setLinkToEditQuestion(`${location.origin}/question/${questionEditId}/edit`)
        setIsLoaded(true)
    })

    const patchData = async (formData: QuestionApiData) => {
        if (!questionEditId) {
            throw new Error('Question editId is not defined')
        }

        updateQuestion(formData, questionEditId).catch(error => setLinkToQuestion(error.message))
    }

    const handleSubmit = (questionData: QuestionFormData) => {
        const errors = validateQuestionFormData(questionData)

        if (errors.size > 0) {
            setErrors(errors)
        } else {
            const apiData = toQuestionApiData(questionData)
            patchData(apiData)
        }
    }

    return (
        <>
            <h1 data-testid="edit-question-title">Edit Question</h1>
            <div className="question-page">
                <QuestionEditForm key={questionData.question} initialQuestionData={questionData} onSubmit={handleSubmit} />
                <ErrorMessages errorCodes={errors} />
                <QuestionLink url={linkToQuestion} />
                <QuestionEditLink editUrl={linkToEditQuestion} />
                <LoadedIndicator isLoaded={isLoaded} />
            </div>
        </>
    )
}
