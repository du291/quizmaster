import './create-question.scss'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { type QuestionApiData, saveQuestion } from 'api/question.ts'

import { QuestionEditForm } from './form'

export function CreateQuestionPage() {
    const [searchParams] = useSearchParams()
    const workspaceGuid = searchParams.get('workspaceguid') ? searchParams.get('workspaceguid') : ''
    const navigate = useNavigate()

    const handleSubmit = (questionData: QuestionApiData) => {
        const apiData = { ...questionData, workspaceGuid: workspaceGuid || null }
        saveQuestion(apiData).then(response => {
            const url = workspaceGuid !== '' ? `/workspace/${workspaceGuid}` : `/question/${response.editId}/edit`
            navigate(url)
        })
    }

    return (
        <>
            <h1>Create Question</h1>
            <div className="question-page">
                <QuestionEditForm onSubmit={handleSubmit} />
            </div>
        </>
    )
}
