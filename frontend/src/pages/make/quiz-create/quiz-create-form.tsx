import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { useStateSet } from 'helpers'
import type { QuestionListItem } from 'model/question-list-item.ts'
import type { QuizCreateRequest } from 'api/quiz.ts'

import { Field, Form, NumberInput, SubmitButton, TextArea, TextInput } from 'pages/components'
import { QuestionSelect } from './components/question-select.tsx'
import { ErrorMessage, createValidator } from 'pages/components/forms/validations.tsx'
import { validateQuizForm, errorMessage } from './validations.ts'
import type { QuizMode } from 'model/quiz.ts'

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
    const [finalCount, setFinalCount] = useState<number>(0)
    const [passScore, setPassScore] = useState<number>(80)
    const [filter, setFilter] = useState<string>('')
    const [searchParams] = useSearchParams()
    const [checkRandomize, setCheckRandomize] = useState(false)
    const [filteredQuestions, setFilteredQuestions] = useState<readonly QuestionListItem[]>(questions)
    const [feedbackMode, setFeedbackMode] = useState<QuizMode>('EXAM')

    const validator = createValidator(
        () => validateQuizForm({ title, description, timeLimit, passScore, selectedIds, finalCount }),
        errorMessage,
    )

    const toFormData = (): QuizCreateFormData => ({
        title,
        description,
        questionIds: Array.from(selectedIds),
        mode: feedbackMode,
        passScore,
        timeLimit,
        workspaceGuid: searchParams.get('workspaceguid') || '',
        finalCount,
        questionList: searchParams.get('listguid') || '',
    })

    useEffect(() => {
        if (filter === '') {
            setFilteredQuestions(questions)
        } else {
            const filtered = questions.filter(q => q.question.toLowerCase().includes(filter.toLowerCase()))
            setFilteredQuestions(filtered)
        }
    }, [filter, questions])

    return (
        <Form id="create-quiz" validator={validator} onSubmit={() => onSubmit(toFormData())}>
            <Field label="Quiz title" required>
                <TextInput id="quiz-title" value={title} onChange={setTitle} />
                <ErrorMessage errorCode="empty-title" />
            </Field>
            <Field label="Quiz description">
                <TextArea id="quiz-description" value={description} onChange={setDescription} />
            </Field>
            <Field label="Time limit (in seconds)">
                <NumberInput id="time-limit" value={timeLimit} onChange={setTimeLimit} />
            </Field>
            <Field label="Required score to pass the quiz (in %)">
                <NumberInput id="pass-score" value={passScore} onChange={setPassScore} />
            </Field>
            <Field label="Feedback mode">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                        type="radio"
                        name="feedbackMode"
                        id="exam-mode"
                        value="EXAM"
                        checked={feedbackMode === 'EXAM'}
                        onChange={e => setFeedbackMode(e.target.value as QuizMode)}
                    />
                    <label htmlFor="exam-mode" style={{ marginTop: '5px' }}>
                        EXAM
                    </label>
                    <input
                        type="radio"
                        name="feedbackMode"
                        id="learn-mode"
                        value="LEARN"
                        checked={feedbackMode === 'LEARN'}
                        onChange={e => setFeedbackMode(e.target.value as QuizMode)}
                    />
                    <label htmlFor="learn-mode" style={{ marginTop: '5px' }}>
                        LEARN
                    </label>
                </span>
            </Field>
            <div className="label">Select quiz questions</div>
            <Field label="Filter">
                <TextInput id="question-filter" value={filter} onChange={setFilter} />
            </Field>
            <QuestionSelect questions={filteredQuestions} onSelect={toggleSelectedId} />
            <ErrorMessage errorCode="few-questions" />

            <div style={{ paddingLeft: '25px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 800 }} id="selected-question-count-for-quiz">
                        {selectedIds.size}
                    </div>
                    selected question(s)
                </span>
            </div>
            <div style={{ paddingLeft: '25px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 800 }} id="total-question-count-for-quiz">
                        {questions.length}
                    </div>
                    total questions available
                </span>
            </div>

            <Field label="Randomize questions">
                <input
                    type="checkbox"
                    id="isRandomized"
                    onChange={e => setCheckRandomize(e.target.checked)}
                    checked={checkRandomize}
                />
                {checkRandomize && <NumberInput id="quiz-finalCount" value={finalCount} onChange={setFinalCount} />}
            </Field>
            <ErrorMessage errorCode="too-many-randomized-questions" />
            <SubmitButton />
        </Form>
    )
}
