import { expect } from '@esm-bundle/chai'
import type { Question } from '../../../src/model/question.ts'
import type { Quiz } from '../../../src/model/quiz.ts'
import { installApiMock, type Route } from '../support/mock-api.ts'
import { clickElement, nextFrame, renderAppAt, textContent, waitFor } from '../support/test-harness.tsx'

const makeQuestion = (
    id: number,
    title: string,
    answers: readonly string[],
    correctAnswers: readonly number[],
    questionExplanation = '',
): Question => ({
    id,
    editId: `edit-${id}`,
    question: title,
    answers: [...answers],
    explanations: answers.map(() => ''),
    correctAnswers: [...correctAnswers],
    questionExplanation,
    workspaceGuid: null,
    easyMode: false,
})

const scoreQuiz: Quiz = {
    id: 3101,
    title: 'Score Quiz',
    description: 'Score scenarios',
    mode: 'exam',
    difficulty: 'keep-question',
    passScore: 75,
    timeLimit: 120,
    questions: [
        makeQuestion(1, 'Question 1', ['Correct 1', 'Wrong 1'], [0]),
        makeQuestion(2, 'Question 2', ['Correct 2', 'Wrong 2'], [0]),
        makeQuestion(3, 'Question 3', ['Correct 3', 'Wrong 3'], [0]),
        makeQuestion(4, 'Question 4', ['Correct 4', 'Wrong 4'], [0]),
    ],
}

const scoreDetailsQuiz: Quiz = {
    id: 3102,
    title: 'Quiz A',
    description: 'Description A',
    mode: 'exam',
    difficulty: 'keep-question',
    passScore: 85,
    timeLimit: 120,
    questions: [
        makeQuestion(
            11,
            'What is the standard colour of sky?',
            ['Red', 'Blue', 'Green', 'Black'],
            [1],
            'Rayleigh',
        ),
        makeQuestion(12, 'What is capital of France?', ['Marseille', 'Lyon', 'Paris', 'Toulouse'], [2]),
    ],
}

const quizzesById = new Map<number, Quiz>([
    [scoreQuiz.id, scoreQuiz],
    [scoreDetailsQuiz.id, scoreDetailsQuiz],
])

const installQuizScoreMockApi = () => {
    const routes: readonly Route[] = [
        {
            method: 'GET',
            match: /^\/api\/quiz\/\d+$/,
            handle: request => {
                const quizId = Number.parseInt(request.path.split('/').pop() ?? '0')
                const quiz = quizzesById.get(quizId)
                if (!quiz) throw new Error(`Quiz not found: ${quizId}`)
                return { body: quiz }
            },
        },
    ]

    return installApiMock(routes)
}

const readStoredQuizAnswers = () => {
    const raw = sessionStorage.getItem('quizAnswers')
    if (raw === null) {
        return { raw: null, parsed: null as unknown }
    }

    try {
        return { raw, parsed: JSON.parse(raw) as unknown }
    } catch (error) {
        return {
            raw,
            parsed: {
                parseError: error instanceof Error ? error.message : String(error),
            },
        }
    }
}

const scoreSummarySnapshot = () => ({
    correctAnswers: textContent('#correct-answers'),
    totalQuestions: textContent('#total-questions'),
    percentageResult: textContent('#percentage-result'),
    textResult: textContent('#text-result'),
    passScore: textContent('#pass-score'),
    pathname: window.location.pathname,
})

const describeQuestionFieldset = (fieldset: HTMLElement) => {
    const checkedInput = fieldset.querySelector<HTMLInputElement>('input:checked')
    const checkedLabel = checkedInput
        ? fieldset.querySelector<HTMLLabelElement>(`label[for="${checkedInput.id}"]`)
        : null

    return {
        questionName:
            fieldset.querySelector<HTMLElement>('[id^="question-name-"]')?.textContent?.trim() ??
            fieldset.querySelector<HTMLElement>('strong')?.textContent?.trim() ??
            '',
        checkedInputId: checkedInput?.id ?? null,
        checkedInputValue: checkedInput?.value ?? null,
        checkedLabelText: checkedLabel?.textContent?.trim() ?? null,
        labels: Array.from(fieldset.querySelectorAll<HTMLLabelElement>('[id^="answer-label-"]')).map(label => ({
            htmlFor: label.htmlFor,
            text: label.textContent?.trim() ?? '',
        })),
    }
}

const describeScorePage = () => ({
    summary: scoreSummarySnapshot(),
    storage: readStoredQuizAnswers(),
    questions: Array.from(document.querySelectorAll<HTMLElement>('fieldset[id^="question-"]')).map(describeQuestionFieldset),
})

const formatDebugLine = (event: string, details: unknown) => `[quiz-score-debug] ${event} ${JSON.stringify(details)}`

let debugLines: string[] = []

const recordDebug = (event: string, details: unknown) => {
    debugLines.push(formatDebugLine(event, details))
}

const recentDebugLines = (limit = 12) => debugLines.slice(-limit)

const questionFormInputs = () =>
    Array.from(
        document.querySelectorAll<HTMLInputElement>('#question-form input[type="radio"], #question-form input[type="checkbox"]'),
    )

const expectedQuestionPath = (quizId: number, questionIdx: number) =>
    questionIdx === 0 ? `/quiz/${quizId}/questions` : `/quiz/${quizId}/questions/${questionIdx}`

const isExpectedQuestionReady = (quizId: number, questionIdx: number, question: Question) => {
    const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('[id^="answer-label-"]'))
    const inputs = questionFormInputs()

    return (
        window.location.pathname === expectedQuestionPath(quizId, questionIdx) &&
        textContent('#question') === question.question &&
        labels.length === question.answers.length &&
        inputs.length === question.answers.length &&
        inputs.every(input => input.name === `question-${question.id}`)
    )
}

const waitForExpectedQuestion = async (quizId: number, questionIdx: number, question: Question, traceLabel: string) => {
    await waitFor(() => isExpectedQuestionReady(quizId, questionIdx, question), 5000)
    recordDebug('question-ready', {
        traceLabel,
        expectedPath: expectedQuestionPath(quizId, questionIdx),
        expectedQuestion: question.question,
        state: describeQuestionFormState(),
    })
}

const describeQuestionFormState = (position?: number) => {
    const submitButton = document.querySelector<HTMLInputElement>('input.submit-btn')
    const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('[id^="answer-label-"]'))
    const formInputs = questionFormInputs()
    const targetLabel = position !== undefined ? labels[position] ?? null : null
    const targetAnswerId = targetLabel?.htmlFor ?? null
    const matchingInputs =
        targetAnswerId === null ? [] : Array.from(document.querySelectorAll<HTMLInputElement>(`input#${targetAnswerId}`))

    return {
        pathname: window.location.pathname,
        question: textContent('#question'),
        hasEvaluateButton: document.querySelector('#evaluate') !== null,
        hasResults: document.querySelector('#results') !== null,
        hasSubmitButton: submitButton !== null,
        submitButtonDisabled: submitButton?.disabled ?? null,
        storage: readStoredQuizAnswers(),
        visibleLabels: labels.map(label => ({
            htmlFor: label.htmlFor,
            text: label.textContent?.trim() ?? '',
        })),
        currentQuestionInputs: formInputs.map(input => ({
            id: input.id,
            name: input.name,
            value: input.value,
            checked: input.checked,
            disabled: input.disabled,
        })),
        target:
            targetLabel === null
                ? null
                : {
                      position,
                      labelText: targetLabel.textContent?.trim() ?? '',
                      answerId: targetAnswerId,
                      globalMatchCount: matchingInputs.length,
                      matches: matchingInputs.map(input => ({
                          id: input.id,
                          name: input.name,
                          value: input.value,
                          checked: input.checked,
                          disabled: input.disabled,
                      })),
                  },
    }
}

const observeSelectedLabel = async (fieldset: HTMLElement, expectedLabel: string, timeoutMs = 2500) => {
    const startedAt = performance.now()
    const immediateState = describeQuestionFieldset(fieldset)
    const transitions = [formatDebugLine('selection-sample', { elapsedMs: 0, state: immediateState })]
    let lastSnapshot = JSON.stringify(immediateState)
    let latestState = immediateState

    if (immediateState.checkedLabelText === expectedLabel) {
        return { immediateState, latestState, settledAfterMs: 0, transitions }
    }

    while (performance.now() - startedAt < timeoutMs) {
        await nextFrame()
        latestState = describeQuestionFieldset(fieldset)
        const nextSnapshot = JSON.stringify(latestState)
        if (nextSnapshot !== lastSnapshot) {
            transitions.push(
                formatDebugLine('selection-sample', {
                    elapsedMs: Math.round(performance.now() - startedAt),
                    state: latestState,
                }),
            )
            lastSnapshot = nextSnapshot
        }
        if (latestState.checkedLabelText === expectedLabel) {
            return {
                immediateState,
                latestState,
                settledAfterMs: Math.round(performance.now() - startedAt),
                transitions,
            }
        }
    }

    return {
        immediateState,
        latestState,
        settledAfterMs: null,
        transitions,
    }
}

const answerByPosition = async (position: number, traceLabel?: string) => {
    await waitFor(() => document.querySelectorAll<HTMLLabelElement>('[id^="answer-label-"]').length > position)
    if (traceLabel) {
        recordDebug('answer-step-before-click', { traceLabel, state: describeQuestionFormState(position) })
    }
    const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('[id^="answer-label-"]'))
    const label = labels[position]
    if (!label) throw new Error(`Answer label not found at position ${position}`)
    const answerId = label.htmlFor
    if (!answerId) throw new Error(`Missing answer input id for position ${position}`)
    await clickElement(`input#${answerId}`)
    if (traceLabel) {
        recordDebug('answer-step-after-click', { traceLabel, state: describeQuestionFormState(position) })
        await nextFrame()
        recordDebug('answer-step-after-click-extra-frame', { traceLabel, state: describeQuestionFormState(position) })
    }
    await clickElement('input.submit-btn')
    if (traceLabel) {
        recordDebug('answer-step-after-submit', { traceLabel, state: describeQuestionFormState(position) })
        for (let frame = 1; frame <= 3; frame++) {
            await nextFrame()
            recordDebug('answer-step-post-submit-frame', {
                traceLabel,
                frame,
                state: describeQuestionFormState(position),
            })
        }
    }
}

const answerQuizSequence = async (quiz: Quiz, positions: readonly number[]) => {
    for (let i = 0; i < positions.length; i++) {
        await waitForExpectedQuestion(quiz.id, i, quiz.questions[i], `sequence-question-${i}`)
        const traceLabel = i === positions.length - 1 ? `sequence-last-question-${i}` : undefined
        await answerByPosition(positions[i], traceLabel)
        if (i < positions.length - 1) {
            await waitForExpectedQuestion(quiz.id, i + 1, quiz.questions[i + 1], `sequence-question-${i + 1}`)
        }
    }
}

const startQuiz = async (quizId: number) => {
    await clickElement('#start')
    await waitFor(() => window.location.pathname === `/quiz/${quizId}/questions`)
}

const goToScorePage = async () => {
    recordDebug('go-to-score-page-entry', { state: describeQuestionFormState() })

    for (let attempt = 0; attempt < 4; attempt++) {
        if (document.querySelector('#results')) return

        const evaluateButton = document.querySelector<HTMLButtonElement>('#evaluate')
        if (evaluateButton) {
            evaluateButton.click()
            await nextFrame()
            if (document.querySelector('#results')) return
        }

        const submitButton = document.querySelector<HTMLInputElement>('input.submit-btn')
        if (submitButton && !submitButton.disabled) {
            submitButton.click()
            await nextFrame()
            continue
        }

        await nextFrame()
    }

    try {
        await waitFor(() => document.querySelector('#evaluate') !== null || document.querySelector('#results') !== null, 5000)
    } catch (error) {
        const submitButton = document.querySelector<HTMLInputElement>('input.submit-btn')
        throw new Error(
            [
                'Score page transition never exposed #evaluate or #results',
                ...recentDebugLines(),
                formatDebugLine('score-transition-state', {
                    pathname: window.location.pathname,
                    question: textContent('#question'),
                    hasEvaluateButton: document.querySelector('#evaluate') !== null,
                    hasResults: document.querySelector('#results') !== null,
                    hasSubmitButton: submitButton !== null,
                    submitButtonDisabled: submitButton?.disabled ?? null,
                    storage: readStoredQuizAnswers(),
                }),
                error instanceof Error ? error.message : String(error),
            ].join('\n'),
        )
    }

    if (document.querySelector('#results')) return

    const evaluateButton = document.querySelector<HTMLButtonElement>('#evaluate')
    if (!evaluateButton) {
        const submitButton = document.querySelector<HTMLInputElement>('input.submit-btn')
        throw new Error(
            [
                'Expected #evaluate before score-page transition',
                ...recentDebugLines(),
                formatDebugLine('score-transition-state', {
                    pathname: window.location.pathname,
                    question: textContent('#question'),
                    hasEvaluateButton: false,
                    hasResults: document.querySelector('#results') !== null,
                    hasSubmitButton: submitButton !== null,
                    submitButtonDisabled: submitButton?.disabled ?? null,
                    storage: readStoredQuizAnswers(),
                }),
            ].join('\n'),
        )
    }

    evaluateButton.click()
    await waitFor(() => document.querySelector('#results') !== null, 5000)
}

const expectScore = async (
    correctAnswers: string,
    totalQuestions: string,
    percentage: string,
    result: 'passed' | 'failed',
    passScore: string,
    label: string,
) => {
    const startedAt = performance.now()
    const samples: string[] = []
    let lastSnapshot = ''

    while (performance.now() - startedAt < 2500) {
        const snapshot = scoreSummarySnapshot()
        const snapshotJson = JSON.stringify(snapshot)
        if (snapshotJson !== lastSnapshot) {
            samples.push(
                formatDebugLine('score-summary-sample', {
                    label,
                    elapsedMs: Math.round(performance.now() - startedAt),
                    snapshot,
                }),
            )
            lastSnapshot = snapshotJson
        }

        const matches =
            snapshot.correctAnswers === correctAnswers &&
            snapshot.totalQuestions === totalQuestions &&
            snapshot.percentageResult === percentage &&
            snapshot.textResult === result &&
            snapshot.passScore === passScore

        if (matches) {
            return {
                elapsedMs: Math.round(performance.now() - startedAt),
                snapshot,
                samples,
            }
        }

        await nextFrame()
    }

    throw new Error(
        [
            `Score summary did not settle for ${label} within 2500ms`,
            ...samples,
            formatDebugLine('score-page-state', describeScorePage()),
        ].join('\n'),
    )
}

describe('Quiz.Score feature (WTR mocked API)', () => {
    let cleanup = async () => {}
    let restoreFetch = () => {}

    afterEach(async () => {
        for (const line of debugLines) {
            console.info(line)
        }
        debugLines = []
        restoreFetch()
        sessionStorage.clear()
        await cleanup()
    })

    const cases = [
        { correct: 4, incorrect: 0, percentage: '100', result: 'passed' as const },
        { correct: 3, incorrect: 1, percentage: '75', result: 'passed' as const },
        { correct: 2, incorrect: 2, percentage: '50', result: 'failed' as const },
        { correct: 0, incorrect: 4, percentage: '0', result: 'failed' as const },
    ]

    for (const example of cases) {
        it(`evaluates score for ${example.correct} correct and ${example.incorrect} incorrect`, async () => {
            restoreFetch = installQuizScoreMockApi()
            ;({ cleanup } = await renderAppAt(`/quiz/${scoreQuiz.id}`))

            await startQuiz(scoreQuiz.id)

            const sequence = Array.from({ length: example.correct }, () => 0).concat(
                Array.from({ length: example.incorrect }, () => 1),
            )
            await answerQuizSequence(scoreQuiz, sequence)
            const storageBeforeScorePage = readStoredQuizAnswers()

            await goToScorePage()
            const storageAfterScorePage = readStoredQuizAnswers()
            const scoreObservation = await expectScore(
                String(example.correct),
                '4',
                example.percentage,
                example.result,
                '75',
                `score-case-${example.correct}-${example.incorrect}`,
            )
            recordDebug('score-case-ready', {
                case: example,
                storageBeforeScorePage,
                storageAfterScorePage,
                elapsedMs: scoreObservation.elapsedMs,
                snapshot: scoreObservation.snapshot,
            })
        })
    }

    it('shows questions, options, question explanation and user selection on score page', async () => {
        restoreFetch = installQuizScoreMockApi()
        ;({ cleanup } = await renderAppAt(`/quiz/${scoreDetailsQuiz.id}`))

        await startQuiz(scoreDetailsQuiz.id)
        await waitForExpectedQuestion(scoreDetailsQuiz.id, 0, scoreDetailsQuiz.questions[0], 'score-details-question-0')
        await answerByPosition(1) // Blue
        await waitForExpectedQuestion(scoreDetailsQuiz.id, 1, scoreDetailsQuiz.questions[1], 'score-details-question-1')
        await answerByPosition(0, 'score-details-last-question') // Marseille
        const storageBeforeScorePage = readStoredQuizAnswers()
        await goToScorePage()
        const storageAfterScorePage = readStoredQuizAnswers()

        const questionNames = Array.from(document.querySelectorAll<HTMLElement>('[id^="question-name-"]')).map(item =>
            item.textContent?.trim(),
        )
        expect(questionNames).to.include('What is the standard colour of sky?')
        expect(questionNames).to.include('What is capital of France?')

        const skyFieldset = Array.from(document.querySelectorAll<HTMLElement>('fieldset[id^="question-"]')).find(item =>
            item.textContent?.includes('What is the standard colour of sky?'),
        )
        if (!skyFieldset) throw new Error('Sky question fieldset not found')

        const skyAnswers = Array.from(skyFieldset.querySelectorAll<HTMLElement>('[id^="answer-label-"]')).map(item =>
            item.textContent?.trim(),
        )
        expect(skyAnswers).to.include('Red')
        expect(skyAnswers).to.include('Blue')
        expect(skyAnswers).to.include('Green')
        expect(skyAnswers).to.include('Black')

        expect(skyFieldset.textContent).to.contain('Rayleigh')

        const selectionObservation = await observeSelectedLabel(skyFieldset, 'Blue')
        recordDebug('score-details-selection', {
            storageBeforeScorePage,
            storageAfterScorePage,
            immediateState: selectionObservation.immediateState,
            latestState: selectionObservation.latestState,
            settledAfterMs: selectionObservation.settledAfterMs,
            scorePage: describeScorePage(),
        })

        if (selectionObservation.immediateState.checkedLabelText !== 'Blue') {
            throw new Error(
                [
                    `Expected immediate selected label "Blue" but found "${selectionObservation.immediateState.checkedLabelText ?? 'none'}"`,
                    `eventual label after extra frames: "${selectionObservation.latestState.checkedLabelText ?? 'none'}"`,
                    `settledAfterMs=${selectionObservation.settledAfterMs ?? 'not-settled'}`,
                    ...selectionObservation.transitions,
                    formatDebugLine('score-page-state', describeScorePage()),
                ].join('\n'),
            )
        }
    })
})
