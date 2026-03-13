import { buildQuestion, buildQuizFixture } from '../support/fixtures.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { waitForQuestionReady } from '../support/quiz-flow.ts'
import { clickElement, renderAppAt, waitFor } from '../support/test-harness.tsx'

const planetQuestion = buildQuestion({
    id: 61,
    question: 'Which planet is known as the Red Planet?',
    answers: ['Mars', 'Venus'],
})

const australiaQuestion = buildQuestion({
    id: 62,
    question: "What's the capital city of Australia?",
    answers: ['Sydney', 'Canberra'],
})

const bookmarkQuiz = buildQuizFixture({
    id: 3801,
    title: 'Quiz 4',
    description: 'Description A',
    mode: 'exam',
    passScore: 85,
    timeLimit: 120,
    questions: [planetQuestion, australiaQuestion],
})

const installQuizBookmarksMockApi = () => {
    const routes: readonly Route[] = [
        {
            method: 'GET',
            match: /^\/api\/quiz\/\d+$/,
            handle: request => {
                const quizId = Number.parseInt(request.path.split('/').pop() ?? '0')
                if (quizId !== bookmarkQuiz.id) throw new Error(`Quiz not found: ${quizId}`)
                return { body: bookmarkQuiz }
            },
        },
    ]

    return installApiMock(routes)
}

const startQuiz = async () => {
    await clickElement('#start')
    await waitForQuestionReady({
        quizId: bookmarkQuiz.id,
        questionIndex: 0,
        question: planetQuestion,
    })
}

const bookmarkToggle = () => document.querySelector<HTMLElement>('[data-testid="bookmark-toggle"]')

const bookmarkLink = (title: string) =>
    Array.from(document.querySelectorAll<HTMLButtonElement>('[data-testid="bookmark-list"] button')).find(
        button => button.textContent?.trim() === title,
    )

const deleteBookmarkButton = (title: string) =>
    Array.from(document.querySelectorAll<HTMLButtonElement>('[data-testid="bookmark-list"] button')).find(
        button => button.getAttribute('data-testid') === `delete-bookmark-${title}`,
    )

const waitForBookmarkToggle = async (isBookmarked: boolean) => {
    await waitFor(() => bookmarkToggle()?.getAttribute('data-bookmarked') === String(isBookmarked))
}

const waitForBookmarkLink = async (title: string) => {
    await waitFor(() => bookmarkLink(title) !== undefined)
}

const waitForBookmarkLinkRemoval = async (title: string) => {
    await waitFor(() => bookmarkLink(title) === undefined)
}

const waitForBookmarkedQuestion = async ({ quizId, question }: { quizId: number; question: typeof planetQuestion }) => {
    await waitFor(
        () =>
            window.location.pathname === `/quiz/${quizId}/questions/0` &&
            document.querySelector<HTMLElement>('#question')?.textContent?.trim() === question.question,
    )
}

describe('Quiz.Bookmarks feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        restoreFetch()
        sessionStorage.clear()
        await cleanup()
    })

    it('marks a bookmark and lets the user return to it from the next question', async () => {
        restoreFetch = installQuizBookmarksMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${bookmarkQuiz.id}`))

        await startQuiz()
        await clickElement('[data-testid="bookmark-toggle"]')
        await waitForBookmarkToggle(true)
        await waitForBookmarkLink(planetQuestion.question)

        await clickElement('#next')
        await waitForQuestionReady({
            quizId: bookmarkQuiz.id,
            questionIndex: 1,
            question: australiaQuestion,
        })
        await waitForBookmarkLink(planetQuestion.question)

        bookmarkLink(planetQuestion.question)?.click()
        await waitForBookmarkedQuestion({ quizId: bookmarkQuiz.id, question: planetQuestion })
    })

    it('removes a bookmark from the list when deleted explicitly', async () => {
        restoreFetch = installQuizBookmarksMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${bookmarkQuiz.id}`))

        await startQuiz()
        await clickElement('[data-testid="bookmark-toggle"]')
        await waitForBookmarkToggle(true)
        await waitForBookmarkLink(planetQuestion.question)

        deleteBookmarkButton(planetQuestion.question)?.click()
        await waitForBookmarkLinkRemoval(planetQuestion.question)
    })

    it('removes a bookmark from the list when the current question is unbookmarked', async () => {
        restoreFetch = installQuizBookmarksMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${bookmarkQuiz.id}`))

        await startQuiz()
        await clickElement('[data-testid="bookmark-toggle"]')
        await waitForBookmarkToggle(true)
        await waitForBookmarkLink(planetQuestion.question)

        await clickElement('[data-testid="bookmark-toggle"]')
        await waitForBookmarkToggle(false)
        await waitForBookmarkLinkRemoval(planetQuestion.question)
    })
})
