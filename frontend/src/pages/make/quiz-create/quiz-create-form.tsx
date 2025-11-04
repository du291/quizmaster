import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { preventDefault, useStateSet } from 'helpers'
import type { QuestionListItem } from 'model/question-list-item.ts'
import type { QuizCreateRequest } from 'api/quiz.ts'

import { Field, NumberInput, SubmitButton, TextInput } from 'pages/components'
import { QuestionSelect } from './components/question-select.tsx'
import { FormFieldError } from 'pages/components/forms/form-field-error.tsx'

export type QuizCreateFormData = QuizCreateRequest

interface QuizCreateProps {
    readonly questions: readonly QuestionListItem[]
    readonly onSubmit: (data: QuizCreateFormData) => void
}

export const QuizCreateForm = ({ questions, onSubmit }: QuizCreateProps) => {
    const [title, setTitle] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [selectedIds, toggleSelectedId] = useStateSet<number>()
    const [timeLimit, setTimeLimit] = useState<number>(600)
    const [passScore, setPassScore] = useState<number>(80)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [filter, setFilter] = useState<string>('')
    const [searchParams] = useSearchParams()

    const toFormData = (): QuizCreateFormData => ({
        title,
        description,
        questionIds: Array.from(selectedIds),
        mode: 'EXAM' as const,
        passScore,
        timeLimit,
        workspaceGuid: searchParams.get('workspaceguid') || '',
    })

    const quizTitleError = !title ? 'titleRequired' : undefined
    const quizDescriptionError = !description ? 'descriptionRequired' : undefined
    const timeLimitError = timeLimit < 0 ? 'negativeTimeLimit' : timeLimit > 21600 ? 'timeLimitAboveMax' : undefined
    const passScoreError = passScore > 100 ? 'scoreAboveMax' : undefined
    const atLeastOneQuestionError = isSubmitted && selectedIds.size === 0 ? 'atLeastOneQuestionRequired' : undefined

    return (
        <form
            className="create-quiz"
            onSubmit={preventDefault(() => {
                setIsSubmitted(true)
                onSubmit(toFormData())
            })}
        >
            <Field label="Quiz title" isSubmitted={isSubmitted} errorCode={quizTitleError}>
                <TextInput id="quiz-title" value={title} onChange={setTitle} />
            </Field>
            <Field label="Quiz description" isSubmitted={isSubmitted} errorCode={quizDescriptionError}>
                <TextInput id="quiz-description" value={description} onChange={setDescription} />
            </Field>
            <Field label="Time limit (in seconds)" isSubmitted={isSubmitted} errorCode={timeLimitError}>
                <NumberInput id="time-limit" value={timeLimit} onChange={setTimeLimit} />
            </Field>
            <Field label="Required score to pass the quiz (in %)" isSubmitted={isSubmitted} errorCode={passScoreError}>
                <NumberInput id="pass-score" value={passScore} onChange={setPassScore} />
            </Field>

            <div className="label">Select quiz questions</div>
            <Field label="Filter" isSubmitted={isSubmitted}>
                <TextInput id="question-filter" value={filter} onChange={setFilter} />
            </Field>
            <QuestionSelect questions={questions} onSelect={toggleSelectedId} />
            {atLeastOneQuestionError && <FormFieldError errorCode="atLeastOneQuestionRequired" />}
            <SubmitButton />
        </form>
    )
}
