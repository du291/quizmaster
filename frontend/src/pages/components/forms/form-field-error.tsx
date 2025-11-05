import type { FC } from 'react'
import { Alert } from '../alert'

const errorMessages = {
    titleRequired: 'Title is required.',
    descriptionRequired: 'Description is required.',
    scoreAboveMax: 'Score cannot be above 100%.',
    negativeTimeLimit: 'Time limit cannot be negative.',
    timeLimitAboveMax: 'Time limit cannot be above 21600 seconds (6 hours).',
    atLeastOneQuestionRequired: 'At least one question must be selected.',
    randErr: 'Number of random count must be smaller than selected questions.',
}

export type FormFieldErrorCode = keyof typeof errorMessages
interface FormFieldErrorProps {
    errorCode: FormFieldErrorCode
}

export const FormFieldError: FC<FormFieldErrorProps> = ({ errorCode }) => {
    return (
        <Alert type="error" dataTestId={errorCode}>
            {errorMessages[errorCode]}
        </Alert>
    )
}
