import { SubmitButton, Form } from 'pages/components'
import {
    type AnswerData,
    AnswersEdit,
    MultipleChoiceEdit,
    QuestionEdit,
    QuestionExplanationEdit,
    EasyModeChoiceEdit,
    type QuestionFormData,
} from 'pages/make/create-question/form'
import { useState } from 'react'

interface QuestionEditProps {
    readonly initialQuestionData: QuestionFormData
    readonly onSubmit: (questionData: QuestionFormData) => void
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

export const QuestionEditForm = ({ initialQuestionData, onSubmit }: QuestionEditProps) => {
    const [questionData, setQuestionData] = useState(initialQuestionData)

    const setQuestion = (question: string) => setQuestionData({ ...questionData, question })
    const setIsMultipleChoice = (isMultipleChoice: boolean) =>
        setQuestionData(setMultipleChoiceInQuestionData(isMultipleChoice, questionData))
    const setIsEasyModeChoice = (isEasyModeChoice: boolean) =>
        setQuestionData(setEasyModeChoiceInQuestionData(isEasyModeChoice, questionData))
    const setAnswers = (answers: readonly AnswerData[]) => setQuestionData({ ...questionData, answers })
    const setQuestionExplanation = (questionExplanation: string) =>
        setQuestionData({ ...questionData, questionExplanation })

    const handleSubmit = () => onSubmit(questionData)

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
                isMultichoiceQuestion={questionData.isMultipleChoice}
            />
            <QuestionExplanationEdit
                questionExplanation={questionData.questionExplanation}
                setQuestionExplanation={setQuestionExplanation}
            />
            <div className="flex-container">
                <SubmitButton />
            </div>
        </Form>
    )
}
