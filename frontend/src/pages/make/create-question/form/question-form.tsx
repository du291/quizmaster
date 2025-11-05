import { SubmitButton, Form, Field, TextArea, CheckField, Row } from 'pages/components'
import { AnswersEdit, stateToQuestionApiData } from 'pages/make/create-question/form'
import { useQuestionFormState } from './question-form-state'
import { useState } from 'react'
import { type ErrorCodes, ErrorMessages } from './error-message.tsx'
import { validateQuestionFormState } from './validators.ts'
import type { QuestionApiData } from 'api/question.ts'
import type { Question } from 'model/question.ts'

interface QuestionEditProps {
    readonly question?: Question
    readonly onSubmit: (questionData: QuestionApiData) => void
}

export const QuestionEditForm = ({ question, onSubmit }: QuestionEditProps) => {
    const state = useQuestionFormState(question)
    const [errors, setErrors] = useState<ErrorCodes>(new Set())

    const handleSubmit = () => {
        const errors = validateQuestionFormState(state)
        setErrors(errors)

        if (errors.size === 0) onSubmit(stateToQuestionApiData(state))
    }

    return (
        <Form id="question-create-form" onSubmit={handleSubmit}>
            <Field label="Question" required>
                <TextArea id="question-text" value={state.questionText} onChange={state.setQuestionText} />
            </Field>
            <Row>
                <CheckField
                    id="is-multiple-choice"
                    label="Multiple choice"
                    checked={state.isMultipleChoice}
                    onToggle={state.toggleMultipleChoice}
                />
                {state.isMultipleChoice && (
                    <CheckField
                        id="easy-mode"
                        label="Easy mode"
                        checked={state.easyMode}
                        onToggle={state.setEasyMode}
                    />
                )}
            </Row>
            <AnswersEdit
                answerStates={state.answerStates}
                isMultipleChoice={state.isMultipleChoice}
                addAnswer={state.addAnswer}
            />
            <Field label="Question explanation">
                <TextArea
                    id="question-explanation"
                    value={state.questionExplanation}
                    onChange={state.setQuestionExplanation}
                />
            </Field>
            <Row>
                <SubmitButton />
            </Row>
            <ErrorMessages errorCodes={errors} />
        </Form>
    )
}
