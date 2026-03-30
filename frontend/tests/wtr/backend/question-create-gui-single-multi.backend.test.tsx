import { expect } from '@esm-bundle/chai'
import {
    addAnswer,
    readQuestionFormSnapshot,
    selectAnswerAsCorrect,
    setAnswerCorrect,
    setAnswerText,
    setCheckboxValue,
    waitForAnswerCorrectInputTypes,
} from '../support/question-form.ts'
import { renderAppAt, waitForElement } from '../support/test-harness.tsx'

const prepareThreeAnswerDraft = async () => {
    await waitForElement<HTMLInputElement | HTMLTextAreaElement>('#question-text')
    await setCheckboxValue('#show-explanation', true)
    await setAnswerText(0, 'Brno')
    await setAnswerText(1, 'Berlin')
    await addAnswer()
    await setAnswerText(2, 'Bratislava')
}

describe('Question.Create.GUI.SingleMulti feature (WTR real backend)', () => {
    let cleanup = async () => {}

    afterEach(async () => {
        await cleanup()
    })

    it('defaults to single choice and replaces the selected correct answer', async () => {
        ;({ cleanup } = await renderAppAt('/question/new'))

        await prepareThreeAnswerDraft()
        await waitForAnswerCorrectInputTypes(['radio', 'radio', 'radio'])

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: '',
            questionExplanation: '',
            isMultipleChoice: false,
            showExplanations: true,
            easyModeVisible: false,
            easyModeChecked: false,
            answers: [
                { text: 'Brno', isCorrect: false, explanation: '' },
                { text: 'Berlin', isCorrect: false, explanation: '' },
                { text: 'Bratislava', isCorrect: false, explanation: '' },
            ],
        })

        await selectAnswerAsCorrect(1)

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: '',
            questionExplanation: '',
            isMultipleChoice: false,
            showExplanations: true,
            easyModeVisible: false,
            easyModeChecked: false,
            answers: [
                { text: 'Brno', isCorrect: false, explanation: '' },
                { text: 'Berlin', isCorrect: true, explanation: '' },
                { text: 'Bratislava', isCorrect: false, explanation: '' },
            ],
        })

        await selectAnswerAsCorrect(0)

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: '',
            questionExplanation: '',
            isMultipleChoice: false,
            showExplanations: true,
            easyModeVisible: false,
            easyModeChecked: false,
            answers: [
                { text: 'Brno', isCorrect: true, explanation: '' },
                { text: 'Berlin', isCorrect: false, explanation: '' },
                { text: 'Bratislava', isCorrect: false, explanation: '' },
            ],
        })
    })

    it('preserves a single selected answer when toggling between single and multiple choice', async () => {
        ;({ cleanup } = await renderAppAt('/question/new'))

        await prepareThreeAnswerDraft()
        await selectAnswerAsCorrect(1)

        await setCheckboxValue('#is-multiple-choice', true)
        await waitForAnswerCorrectInputTypes(['checkbox', 'checkbox', 'checkbox'])

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: '',
            questionExplanation: '',
            isMultipleChoice: true,
            showExplanations: true,
            easyModeVisible: true,
            easyModeChecked: false,
            answers: [
                { text: 'Brno', isCorrect: false, explanation: '' },
                { text: 'Berlin', isCorrect: true, explanation: '' },
                { text: 'Bratislava', isCorrect: false, explanation: '' },
            ],
        })

        await setCheckboxValue('#is-multiple-choice', false)
        await waitForAnswerCorrectInputTypes(['radio', 'radio', 'radio'])

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: '',
            questionExplanation: '',
            isMultipleChoice: false,
            showExplanations: true,
            easyModeVisible: false,
            easyModeChecked: false,
            answers: [
                { text: 'Brno', isCorrect: false, explanation: '' },
                { text: 'Berlin', isCorrect: true, explanation: '' },
                { text: 'Bratislava', isCorrect: false, explanation: '' },
            ],
        })
    })

    it('allows multiple correct answers and resets them when returning to single choice', async () => {
        ;({ cleanup } = await renderAppAt('/question/new'))

        await prepareThreeAnswerDraft()
        await setCheckboxValue('#is-multiple-choice', true)
        await waitForAnswerCorrectInputTypes(['checkbox', 'checkbox', 'checkbox'])
        await setAnswerCorrect(1, true)
        await setAnswerCorrect(2, true)

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: '',
            questionExplanation: '',
            isMultipleChoice: true,
            showExplanations: true,
            easyModeVisible: true,
            easyModeChecked: false,
            answers: [
                { text: 'Brno', isCorrect: false, explanation: '' },
                { text: 'Berlin', isCorrect: true, explanation: '' },
                { text: 'Bratislava', isCorrect: true, explanation: '' },
            ],
        })

        await setCheckboxValue('#is-multiple-choice', false)
        await waitForAnswerCorrectInputTypes(['radio', 'radio', 'radio'])

        expect(readQuestionFormSnapshot()).to.deep.equal({
            questionText: '',
            questionExplanation: '',
            isMultipleChoice: false,
            showExplanations: true,
            easyModeVisible: false,
            easyModeChecked: false,
            answers: [
                { text: 'Brno', isCorrect: false, explanation: '' },
                { text: 'Berlin', isCorrect: false, explanation: '' },
                { text: 'Bratislava', isCorrect: false, explanation: '' },
            ],
        })
    })
})
