import { Button, Field, TextInput, Row } from 'pages/components'
import type { AnswerState } from './question-form-state.ts'
import { ErrorMessage } from 'pages/components/forms/validations.tsx'

interface AnswerRowProps {
    readonly state: AnswerState
    readonly isMultipleChoice: boolean
}

export const AnswerRow = ({ state, isMultipleChoice }: AnswerRowProps) => (
    <div className="answer-row">
        <input
            type={isMultipleChoice ? 'checkbox' : 'radio'}
            checked={state.isCorrect}
            onChange={state.toggleCorrect}
        />
        <div>
            <TextInput className="text" value={state.answer} onChange={state.setAnswer} />
            <TextInput className="explanation" value={state.explanation} onChange={state.setExplanation} />
        </div>
    </div>
)

interface AnswersProps {
    readonly answerStates: readonly AnswerState[]
    readonly isMultipleChoice: boolean
    readonly addAnswer: () => void
}

export const AnswersEdit = ({ answerStates, isMultipleChoice, addAnswer }: AnswersProps) => {
    return (
        <Field label="Enter your answers" required>
            {answerStates.map(state => (
                <AnswerRow state={state} isMultipleChoice={isMultipleChoice} />
            ))}
            <Row>
                <Button onClick={addAnswer} className="secondary button" id="add-answer">
                    Add Answer
                </Button>
            </Row>
            <ErrorMessage errorCode="no-correct-answer" />
            <ErrorMessage errorCode="empty-answer" />
            <ErrorMessage errorCode="empty-answer-explanation" />
            <ErrorMessage errorCode="multiple-choice-must-have-more-correct-answers" />
        </Field>
    )
}
