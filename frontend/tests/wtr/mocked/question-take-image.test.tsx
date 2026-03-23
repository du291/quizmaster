import { expect } from '@esm-bundle/chai'
import { buildQuestion } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const catQuestion = buildQuestion({
    id: 501,
    question: 'Which animal is on the picture? 😺',
    answers: ['Cat', 'Dog', 'Mouse', 'Swan'],
})

const plainQuestion = buildQuestion({
    id: 502,
    question: 'Which animal is on the picture?',
    answers: ['Cat', 'Dog', 'Mouse', 'Swan'],
})

const imageUrlFragment = 'photo-1529778873920-4da4926a72c2'

const installQuestionImageMockApi = () => {
    const questionsById = new Map<number, typeof catQuestion>([
        [catQuestion.id, catQuestion],
        [plainQuestion.id, plainQuestion],
    ])

    const routes: readonly Route[] = [
        {
            method: 'GET',
            match: /^\/api\/question\/\d+$/,
            handle: request => {
                const questionId = Number.parseInt(request.path.split('/').pop() ?? '0')
                const question = questionsById.get(questionId)
                if (!question) throw new Error(`Question not found: ${questionId}`)
                return { body: question }
            },
        },
    ]

    return installApiMock(routes)
}

const questionImage = () => document.querySelector<HTMLImageElement>('img.question-image')

describe('Question.Take.Image feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    it('shows the configured cat image when the question text contains the cat marker', async () => {
        restoreFetch = installQuestionImageMockApi()
        ;({ cleanup } = await renderAppAt(`/question/${catQuestion.id}`))

        await waitFor(() => textContent('#question') === catQuestion.question)
        await waitFor(() => questionImage()?.src.includes(imageUrlFragment) ?? false)

        expect(questionImage()?.src).to.contain(imageUrlFragment)
    })

    it('does not show the cat image when the question text does not contain the cat marker', async () => {
        restoreFetch = installQuestionImageMockApi()
        ;({ cleanup } = await renderAppAt(`/question/${plainQuestion.id}`))

        await waitFor(() => textContent('#question') === plainQuestion.question)
        await waitFor(() => questionImage() === null)

        expect(questionImage()).to.equal(null)
    })
})
