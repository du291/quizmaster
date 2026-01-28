import './test-numerical-question.scss'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const DEFAULT_QUESTION = 'Regions'
const DEFAULT_CORRECT_ANSWER = '14'

export const TestNumericalQuestionPage = () => {
    const [searchParams] = useSearchParams()
    const question = searchParams.get('question') ?? DEFAULT_QUESTION
    const correctAnswer = searchParams.get('correct') ?? DEFAULT_CORRECT_ANSWER

    const [answer, setAnswer] = useState('')
    const [feedback, setFeedback] = useState<string | null>(null)

    const onSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const trimmed = answer.trim()
        if (!trimmed) return

        setFeedback(trimmed === correctAnswer ? 'Correct!' : 'Incorrect!')
    }

    return (
        <main className="test-numerical-question">
            <h1 data-testid="question-title">{question}</h1>
            <form onSubmit={onSubmit}>
                <label htmlFor="answer">Your answer</label>
                <input id="answer" type="number" value={answer} onChange={event => setAnswer(event.target.value)} />
                <button id="submit-answer" type="submit">
                    Submit
                </button>
            </form>

            {feedback && <p className="question-feedback">{feedback}</p>}
        </main>
    )
}
