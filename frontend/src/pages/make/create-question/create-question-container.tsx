import './create-question.scss'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { saveQuestion } from 'api/question.ts'

import { emptyQuestionFormData, QuestionEditForm, toQuestionApiData } from './form'
import { ErrorMessages, type ErrorCodes } from './form/error-message'
import { validateQuestionFormData } from './validators'

export function CreateQuestionContainer() {
    const [searchParams] = useSearchParams()
    const workspaceGuid = searchParams.get('workspaceguid') ? searchParams.get('workspaceguid') : ''
    const navigate = useNavigate()

    const [questionData, setQuestionData] = useState(emptyQuestionFormData())
    const [errors, setErrors] = useState<ErrorCodes>(new Set())

    const handleSubmit = () => {
        const errors = validateQuestionFormData(questionData)
        setErrors(errors)

        if (errors.size > 0) return

        const apiData = { ...toQuestionApiData(questionData), workspaceGuid: workspaceGuid || null }
        saveQuestion(apiData).then(response => {
            const url = workspaceGuid !== '' ? `/workspace/${workspaceGuid}` : `/question/${response.editId}/edit`
            navigate(url)
        })
    }

    return (
        <>
            <h1>Create Question</h1>
            <div className="question-page">
                <QuestionEditForm
                    questionData={questionData}
                    setQuestionData={setQuestionData}
                    onSubmit={handleSubmit}
                />
                <ErrorMessages errorCodes={errors} />
            </div>
        </>
    )
}
