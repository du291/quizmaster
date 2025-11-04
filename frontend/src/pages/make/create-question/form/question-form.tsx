import { SubmitButton, Form } from 'pages/components'
import {
    type AnswerData,
    AnswersEdit,
    MultipleChoiceEdit,
    QuestionEdit,
    QuestionExplanationEdit,
    EasyModeChoiceEdit,
    type QuestionFormData,
    toQuestionApiData,
    toQuestionFormData,
    emptyQuestionFormData,
} from 'pages/make/create-question/form'
import { useState } from 'react'
import { type ErrorCodes, ErrorMessages } from './error-message.tsx'
import { validateQuestionFormData } from '../validators.ts'
import type { QuestionApiData } from 'api/question.ts'
import type { Question } from 'model/question.ts'

interface QuestionEditProps {
    readonly question?: Question
    readonly onSubmit: (questionData: QuestionApiData) => void
}

function setMultipleChoiceInQuestionData(isMultipleChoice: boolean, questionData: QuestionFormData): QuestionFormData {
    const numberOfCorrectAnswers = questionData.answers.filter(answer => answer.isCorrect).length

    return {
        ...questionData,
        isMultipleChoice,
        answers:
            !isMultipleChoice && numberOfCorrectAnswers > 1
                ? questionData.answers.map(answer => ({ ...answer, isCorrect: false }))
                : questionData.answers,
    }
}

function setEasyModeChoiceInQuestionData(isEasyModeChoice: boolean, questionData: QuestionFormData): QuestionFormData {
    return {
        ...questionData,
        isEasyModeChoice,
    }
}

export const QuestionEditForm = ({ question, onSubmit }: QuestionEditProps) => {
    const [questionData, setQuestionData] = useState(question ? toQuestionFormData(question) : emptyQuestionFormData())
    const [errors, setErrors] = useState<ErrorCodes>(new Set())

    const setQuestion = (question: string) => setQuestionData({ ...questionData, question })
    const setIsMultipleChoice = (isMultipleChoice: boolean) =>
        setQuestionData(setMultipleChoiceInQuestionData(isMultipleChoice, questionData))
    const setIsEasyModeChoice = (isEasyModeChoice: boolean) =>
        setQuestionData(setEasyModeChoiceInQuestionData(isEasyModeChoice, questionData))
    const setAnswers = (answers: readonly AnswerData[]) => setQuestionData({ ...questionData, answers })
    const setQuestionExplanation = (questionExplanation: string) =>
        setQuestionData({ ...questionData, questionExplanation })

    const handleSubmit = () => {
        const errors = validateQuestionFormData(questionData)
        setErrors(errors)

        if (errors.size === 0) onSubmit(toQuestionApiData(questionData))
    }

    return (
        <Form id="question-create-form" onSubmit={handleSubmit}>
            <QuestionEdit question={questionData.question} setQuestion={setQuestion} />
            <div className="questiion-options">
                <MultipleChoiceEdit
                    isMultipleChoice={questionData.isMultipleChoice}
                    setIsMultipleChoice={setIsMultipleChoice}
                />
                {questionData.isMultipleChoice && (
                    <EasyModeChoiceEdit
                        isEasyModeChoice={questionData.isEasyModeChoice}
                        setIsEasyModeChoice={setIsEasyModeChoice}
                    />
                )}
            </div>
            <AnswersEdit
                answers={questionData.answers}
                setAnswers={setAnswers}
                isMultipleChoice={questionData.isMultipleChoice}
            />
            <QuestionExplanationEdit
                questionExplanation={questionData.questionExplanation}
                setQuestionExplanation={setQuestionExplanation}
            />
            <div className="flex-container">
                <SubmitButton />
            </div>
            <ErrorMessages errorCodes={errors} />
        </Form>
    )
}
