import './field.scss'
import { FormFieldError, type FormFieldErrorCode } from './form-field-error'

interface FieldProps {
    readonly label: string
    readonly children: React.ReactNode
    readonly required?: boolean
    readonly isSubmitted?: boolean
    readonly errorCode?: FormFieldErrorCode
}

const Required = () => <span className="required">*</span>

export const Field = ({ label, children, required = false, errorCode, isSubmitted = false }: FieldProps) => (
    <label className="field">
        <div className="label">
            {label} {required && <Required />}
        </div>
        {children}
        {isSubmitted && errorCode && <FormFieldError errorCode={errorCode} />}
    </label>
)
