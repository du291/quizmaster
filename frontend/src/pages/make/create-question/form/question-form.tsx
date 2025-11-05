import { SubmitButton, Form, Field, TextArea } from 'pages/components'
import {
    AnswersEdit,
    MultipleChoiceEdit,
    EasyModeChoiceEdit,
    stateToQuestionApiData,
} from 'pages/make/create-question/form'
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

    const handleMultipleChoiceChange = (isMultipleChoice: boolean) => {
        state.setIsMultipleChoice(isMultipleChoice)

        // When switching to single choice mode, keep only the first correct answer
        if (!isMultipleChoice && state.correctAnswers.length > 1) {
            const firstCorrectAnswer = state.correctAnswers[0]
            // Clear all and set only the first one
            for (const idx of state.correctAnswers) {
                if (idx !== firstCorrectAnswer) {
                    state.answerStates[idx].toggleCorrect()
                }
            }
        }
    }

    const handleSubmit = () => {
        const errors = validateQuestionFormState(state)
        setErrors(errors)

        if (errors.size === 0) onSubmit(stateToQuestionApiData(state))
    }

    return (
        <Form id="question-create-form" onSubmit={handleSubmit}>
            <Field label="Question">
                <TextArea id="question-text" value={state.questionText} onChange={state.setQuestionText} />
            </Field>
            <div className="questiion-options">
                <MultipleChoiceEdit
                    isMultipleChoice={state.isMultipleChoice}
                    setIsMultipleChoice={handleMultipleChoiceChange}
                />
                {state.isMultipleChoice && (
                    <EasyModeChoiceEdit isEasyModeChoice={state.easyMode} setIsEasyModeChoice={state.setEasyMode} />
                )}
            </div>
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
            <div className="flex-container">
                <SubmitButton />
            </div>
            <ErrorMessages errorCodes={errors} />
        </Form>
    )
}
