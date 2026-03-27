import { expect } from '@esm-bundle/chai'
import type { Question } from '../../../src/model/question.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import {
    readQuestionFormSnapshot,
    selectAnswerAsCorrect,
    setAnswerExplanation,
    setAnswerText,
    setCheckboxValue,
    setQuestionExplanation,
    setQuestionText,
    waitForPathname,
    waitForQuestionEditLoaded,
} from '../support/question-form.ts'
import { clickElement, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const workspaceGuid = 'workspace-edit-wtr'
const workspaceTitle = 'Czechia'
const questionId = 101
const editId = 'wtr-edit-101'

const buildSavedQuestion = (): Question => ({
    id: questionId,
    editId,
    question: 'What is the capital of Czech Republic?',
    answers: ['Brno', 'Prague', 'Berlin'],
    explanations: ['No Brno', 'Yes', 'Germany'],
    correctAnswers: [1],
    questionExplanation: 'Czechia is a country in Europe. Czechs love beer.',
    workspaceGuid,
    easyMode: false,
})

const cloneQuestion = (question: Question): Question => ({
    ...question,
    answers: [...question.answers],
    explanations: [...question.explanations],
    correctAnswers: [...question.correctAnswers],
})

type QuestionApiPayload = Omit<Question, 'id'>

describe('Question.Edit.GUI feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}
    let savedQuestion = buildSavedQuestion()

    const questionListItem = () => [
        {
            id: savedQuestion.id,
            question: savedQuestion.question,
            editId: savedQuestion.editId,
            isInAnyQuiz: false,
        },
    ]

    const routes = (): readonly Route[] => [
        {
            method: 'GET',
            match: new RegExp(`^/api/question/${editId}/edit$`),
            handle: () => ({ body: cloneQuestion(savedQuestion) }),
        },
        {
            method: 'PATCH',
            match: new RegExp(`^/api/question/${editId}$`),
            handle: request => {
                const payload = request.body as QuestionApiPayload
                savedQuestion = {
                    id: questionId,
                    editId,
                    question: payload.question,
                    answers: [...payload.answers],
                    explanations: [...payload.explanations],
                    correctAnswers: [...payload.correctAnswers],
                    questionExplanation: payload.questionExplanation,
                    workspaceGuid: payload.workspaceGuid,
                    easyMode: payload.easyMode,
                }

                return { body: questionId }
            },
        },
        {
            method: 'GET',
            match: new RegExp(`^/api/workspaces/${workspaceGuid}$`),
            handle: () => ({ body: { guid: workspaceGuid, title: workspaceTitle } }),
        },
        {
            method: 'GET',
            match: new RegExp(`^/api/workspaces/${workspaceGuid}/questions$`),
            handle: () => ({ body: questionListItem() }),
        },
        {
            method: 'GET',
            match: new RegExp(`^/api/workspaces/${workspaceGuid}/quizzes$`),
            handle: () => ({ body: [] }),
        },
    ]

    const reopenEditedQuestion = async () => {
        await clickElement('.edit-question')
        await waitForPathname(`/question/${editId}/edit`)
        await waitForQuestionEditLoaded(savedQuestion.question)
    }

    afterEach(async () => {
        restoreFetch()
        await cleanup()
    })

    beforeEach(() => {
        savedQuestion = buildSavedQuestion()
        restoreFetch = installApiMock(routes())
    })

    it('shows prepopulated form fields for an existing question', async () => {
        ;({ cleanup } = await renderAppAt(`/question/${editId}/edit`))

        await waitForQuestionEditLoaded(savedQuestion.question)

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: 'What is the capital of Czech Republic?',
            questionExplanation: 'Czechia is a country in Europe. Czechs love beer.',
            isMultipleChoice: false,
            showExplanations: true,
            easyModeVisible: false,
            easyModeChecked: false,
            answers: [
                { text: 'Brno', isCorrect: false, explanation: 'No Brno' },
                { text: 'Prague', isCorrect: true, explanation: 'Yes' },
                { text: 'Berlin', isCorrect: false, explanation: 'Germany' },
            ],
        })
    })

    it('persists edited question fields after save and reopen', async () => {
        ;({ cleanup } = await renderAppAt(`/question/${editId}/edit`))

        await waitForQuestionEditLoaded(savedQuestion.question)

        await setQuestionText('What is the capital of Slovakia?')
        await setAnswerText(0, "It's Brno")
        await setAnswerExplanation(0, "No, it's not Brno")
        await setAnswerText(1, "It's Prague")
        await setAnswerExplanation(1, "No, it's not Prague")
        await setAnswerText(2, "It's Bratislava")
        await selectAnswerAsCorrect(2)
        await setAnswerExplanation(2, 'Yes!')
        await setQuestionExplanation('Slovakia is a country in Europe. Slovaks love borovicka.')

        await clickElement('button[type="submit"]')

        await waitForPathname(`/workspace/${workspaceGuid}`)
        await waitFor(() => textContent('.question-item #question-text') === 'What is the capital of Slovakia?', 5000)

        await reopenEditedQuestion()

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: 'What is the capital of Slovakia?',
            questionExplanation: 'Slovakia is a country in Europe. Slovaks love borovicka.',
            isMultipleChoice: false,
            showExplanations: true,
            easyModeVisible: false,
            easyModeChecked: false,
            answers: [
                { text: "It's Brno", isCorrect: false, explanation: "No, it's not Brno" },
                { text: "It's Prague", isCorrect: false, explanation: "No, it's not Prague" },
                { text: "It's Bratislava", isCorrect: true, explanation: 'Yes!' },
            ],
        })
    })

    it('persists changing a single-choice question to multiple choice', async () => {
        ;({ cleanup } = await renderAppAt(`/question/${editId}/edit`))

        await waitForQuestionEditLoaded(savedQuestion.question)

        await setCheckboxValue('#is-multiple-choice', true)
        await selectAnswerAsCorrect(0)

        await clickElement('button[type="submit"]')

        await waitForPathname(`/workspace/${workspaceGuid}`)
        await waitFor(() => textContent('.question-item #question-text') === savedQuestion.question, 5000)

        await reopenEditedQuestion()

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: 'What is the capital of Czech Republic?',
            questionExplanation: 'Czechia is a country in Europe. Czechs love beer.',
            isMultipleChoice: true,
            showExplanations: true,
            easyModeVisible: true,
            easyModeChecked: false,
            answers: [
                { text: 'Brno', isCorrect: true, explanation: 'No Brno' },
                { text: 'Prague', isCorrect: true, explanation: 'Yes' },
                { text: 'Berlin', isCorrect: false, explanation: 'Germany' },
            ],
        })
    })
})
