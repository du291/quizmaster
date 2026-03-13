import { createQuestionInBackend, createQuizInBackend, createWorkspaceInBackend } from '../support/backend-api.ts'
import { waitForQuestionReady } from '../support/quiz-flow.ts'
import { clickElement, renderAppAt, waitFor } from '../support/test-harness.tsx'

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

const waitForBookmarkedQuestion = async ({
    quizId,
    question,
}: {
    readonly quizId: number
    readonly question: {
        readonly id: number
        readonly question: string
        readonly answers: readonly string[]
    }
}) => {
    await waitFor(
        () =>
            window.location.pathname === `/quiz/${quizId}/questions/0` &&
            document.querySelector<HTMLElement>('#question')?.textContent?.trim() === question.question,
    )
}

const prepareQuiz = async () => {
    const suffix = `${Date.now()}`
    const workspaceGuid = await createWorkspaceInBackend(`WTR Bookmark Workspace ${suffix}`)
    const planetQuestionText = `Which planet is known as the Red Planet? ${suffix}`
    const australiaQuestionText = `What's the capital city of Australia? ${suffix}`
    const planetQuestionAnswers = ['Mars', 'Venus'] as const
    const australiaQuestionAnswers = ['Sydney', 'Canberra'] as const
    const planetQuestion = await createQuestionInBackend(workspaceGuid, planetQuestionText, planetQuestionAnswers)
    const australiaQuestion = await createQuestionInBackend(
        workspaceGuid,
        australiaQuestionText,
        australiaQuestionAnswers,
    )
    const quizId = await createQuizInBackend({
        workspaceGuid,
        questionIds: [planetQuestion.id, australiaQuestion.id],
        title: `Quiz 4 ${suffix}`,
        description: 'Description A',
        mode: 'exam',
        passScore: 85,
        timeLimit: 120,
    })

    return {
        quizId,
        quizQuestions: [
            { id: planetQuestion.id, question: planetQuestionText, answers: planetQuestionAnswers },
            { id: australiaQuestion.id, question: australiaQuestionText, answers: australiaQuestionAnswers },
        ] as const,
    }
}

describe('Quiz.Bookmarks feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        sessionStorage.clear()
        await cleanup()
    })

    it('marks a bookmark and lets the user return to it from the next question', async () => {
        const { quizId, quizQuestions } = await prepareQuiz()
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await clickElement('#start')
        await waitForQuestionReady({
            quizId,
            questionIndex: 0,
            question: quizQuestions[0],
        })

        await clickElement('[data-testid="bookmark-toggle"]')
        await waitForBookmarkToggle(true)
        await waitForBookmarkLink(quizQuestions[0].question)

        await clickElement('#next')
        await waitForQuestionReady({
            quizId,
            questionIndex: 1,
            question: quizQuestions[1],
        })
        await waitForBookmarkLink(quizQuestions[0].question)

        bookmarkLink(quizQuestions[0].question)?.click()
        await waitForBookmarkedQuestion({ quizId, question: quizQuestions[0] })
    })

    it('removes a bookmark from the list when deleted explicitly', async () => {
        const { quizId, quizQuestions } = await prepareQuiz()
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await clickElement('#start')
        await waitForQuestionReady({
            quizId,
            questionIndex: 0,
            question: quizQuestions[0],
        })

        await clickElement('[data-testid="bookmark-toggle"]')
        await waitForBookmarkToggle(true)
        await waitForBookmarkLink(quizQuestions[0].question)

        deleteBookmarkButton(quizQuestions[0].question)?.click()
        await waitForBookmarkLinkRemoval(quizQuestions[0].question)
    })

    it('removes a bookmark from the list when the current question is unbookmarked', async () => {
        const { quizId, quizQuestions } = await prepareQuiz()
        ;({ cleanup } = await renderAppAt(`/quiz/${quizId}`))

        await clickElement('#start')
        await waitForQuestionReady({
            quizId,
            questionIndex: 0,
            question: quizQuestions[0],
        })

        await clickElement('[data-testid="bookmark-toggle"]')
        await waitForBookmarkToggle(true)
        await waitForBookmarkLink(quizQuestions[0].question)

        await clickElement('[data-testid="bookmark-toggle"]')
        await waitForBookmarkToggle(false)
        await waitForBookmarkLinkRemoval(quizQuestions[0].question)
    })
})
