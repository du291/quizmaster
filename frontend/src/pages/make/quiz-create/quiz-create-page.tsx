import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useApi } from 'api/hooks'
import { fetchWorkspaceQuestions } from 'api/workspace'

import type { QuestionListItem } from 'model/question-list-item.ts'
import { postQuiz } from 'api/quiz'
import { QuizCreateForm, type QuizCreateFormData } from './quiz-create-form'
import { tryCatch } from 'helpers'
import { Alert, Page } from 'pages/components'
import { QuizUrl } from './components/quiz-url'
import { QuizInfoUrl } from './components/quiz-info-url'

export const QuizCreatePage = () => {
    const [searchParams] = useSearchParams()
    const workspaceGuid = searchParams.get('workspaceguid')
    const navigate = useNavigate()
    const [filter, setFilter] = useState<string | null>(null)

    const [workspaceQuestions, setWorkspaceQuestions] = useState<readonly QuestionListItem[]>([])
    const [quizId, setQuizId] = useState<string | undefined>(undefined)
    const [errorMessage, setErrorMessage] = useState<string>('')

    useApi(
        workspaceGuid || '',
        fetchWorkspaceQuestions,
        setWorkspaceQuestions,
        filter ? { name: 'search', value: filter } : undefined,
    )

    const onFilterChange = (value: string) => {
        const handler = setTimeout(() => {
            setFilter(value)
        }, 300)

        return () => {
            clearTimeout(handler)
        }
    }

    const onSubmit = (data: QuizCreateFormData) =>
        tryCatch(setErrorMessage, async () => {
            const quizId = await postQuiz(data)
            setQuizId(quizId)
            if (workspaceGuid) {
                navigate(`/workspace/${workspaceGuid}`)
            }
        })

    return (
        <Page title="Create Quiz">
            <QuizCreateForm
                questions={workspaceQuestions}
                onSubmit={onSubmit}
                onFilterChange={onFilterChange}
                filter={filter}
            />

            {errorMessage && <Alert type="error">{errorMessage}</Alert>}
            {quizId && (
                <>
                    <QuizUrl quizId={quizId} /> <QuizInfoUrl quizId={quizId} />
                </>
            )}
        </Page>
    )
}
