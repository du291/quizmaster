import { Button, Field, TextInput } from 'pages/components'
import type { AnswerState } from './question-form-state.ts'

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
        <Field label="Enter your answers">
            {answerStates.map(state => (
                <AnswerRow state={state} isMultipleChoice={isMultipleChoice} />
            ))}
            <div>
                <Button onClick={addAnswer} className="secondary button" id="add-answer">
                    Add Answer
                </Button>
            </div>
        </Field>
    )
}
