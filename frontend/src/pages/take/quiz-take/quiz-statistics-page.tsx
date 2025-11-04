import { useParams } from 'react-router-dom'
import { useState } from 'react'
import type { Quiz, QuizStats } from 'model/quiz.ts'
import { fetchQuiz } from 'api/quiz'
import { useApi } from 'api/hooks'

export const QuizStatisticsPage = () => {
    const params = useParams()

    const quizId = params.id

    const [quizData, setQuizData] = useState<Quiz | null>(null)

    useApi(quizId, fetchQuiz, setQuizData)

    const statisticData: QuizStats | null = quizData as unknown as QuizStats

    return (
        quizData && (
            <>
                <h2>Quiz statistics</h2>
                for quiz: <h3 id="quiz-name">{quizData?.title}</h3>
                <p id="quiz-description">{quizData?.description}</p>
                <div>
                    <p>
                        Times taken: <span id="times-taken">{statisticData?.timesTaken}</span>
                    </p>
                    <p>
                        Times finished: <span id="times-finished">{statisticData?.timesFinished}</span>
                    </p>
                    <p>
                        Average score: <span id="average-score">{statisticData?.averageScore} %</span>
                    </p>
                </div>
            </>
        )
    )
}
