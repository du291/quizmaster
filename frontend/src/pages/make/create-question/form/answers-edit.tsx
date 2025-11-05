import type { AnswerState } from './question-form-state.ts'

interface AnswerRowProps {
    readonly state: AnswerState
    readonly isMultipleChoice: boolean
}

export const AnswerRow = ({ state, isMultipleChoice }: AnswerRowProps) => (
    <div key={`answer-${state.index}`} className="answer-row" id={`answer-${state.index}`}>
        <div className="answer-row-section">
            <input
                className={!isMultipleChoice ? 'answer-isCorrect-checkbox' : 'answer-isCorrect-checkbox-multi'}
                type="checkbox"
                checked={state.isCorrect}
                onChange={() => state.toggleCorrect()}
            />
            <span className="answer-row-correct-icon">{state.isCorrect ? '✅' : '❌'}</span>
            <span className="answer-row-correct-text">{state.isCorrect ? 'Correct answer' : 'Incorrect answer'}</span>
        </div>
        <div className="answer-row-section">
            <input
                className="text"
                type="text"
                placeholder={`Input answer ${state.index + 1} here...`}
                value={state.answer}
                onChange={e => state.setAnswer(e.target.value)}
            />
        </div>
        <div className="answer-row-section">
            <input
                className="explanation"
                type="text"
                placeholder="You can add explanation of the anwser here..."
                value={state.explanation}
                onChange={e => state.setExplanation(e.target.value)}
            />
        </div>
    </div>
)

interface AddAnswerProps {
    readonly addAnswer: () => void
}

export const AddAnswerButton = ({ addAnswer }: AddAnswerProps) => (
    <div>
        <button type="button" onClick={addAnswer} className="secondary button" id="add-answer">
            Add Answer
        </button>
    </div>
)

interface AnswersProps {
    readonly answerStates: readonly AnswerState[]
    readonly isMultipleChoice: boolean
    readonly addAnswer: () => void
}

export const AnswersEdit = ({ answerStates, isMultipleChoice, addAnswer }: AnswersProps) => {
    return (
        <>
            <h3 className="answers-header">Enter your answers</h3>
            {answerStates.map(state => (
                <AnswerRow state={state} isMultipleChoice={isMultipleChoice} />
            ))}
            <AddAnswerButton addAnswer={addAnswer} />
        </>
    )
}
