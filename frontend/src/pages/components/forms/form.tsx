import { preventDefault } from 'helpers.ts'

interface FormProps {
    readonly id?: string
    readonly children: React.ReactNode
    readonly onSubmit: () => void
}

export const Form = ({ id, children, onSubmit }: FormProps) => (
    <form id={id} onSubmit={preventDefault(onSubmit)}>
        {children}
    </form>
)
