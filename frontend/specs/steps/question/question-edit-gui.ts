import type { DataTable } from '@cucumber/cucumber'
import { expect } from '@playwright/test'

import { Given, Then, When } from '../fixture.ts'
import type { QuizmasterWorld } from '../world'
import {
    addAnswers,
    type AnswerRaw,
    enterAnswer,
    enterAnswerExplanation,
    enterAnswerText,
    enterQuestion,
    enterQuestionExplanation,
    markQuestionAsPartiallyScored,
    markAnswerCorrectness,
    openCreatePage,
    openEditPage,
    saveQuestion,
    submitQuestion,
} from './ops.ts'
import type { TableOf } from '../common.ts'

Given('I start creating a question', async function () {
    await openCreatePage(this)
})

Given('I start editing question {string}', async function (bookmark: string) {
    await openEditPage(this, bookmark)
})

// Title assertions

Then('I see question edit page', async function () {
    await this.questionEditPage.isEditPage()
})

// Field assertions

Then('I see empty question field', async function () {
    const question = await this.questionEditPage.questionValue()
    expect(question).toBe('')
})

Then('I see {string} in the question field', async function (question: string) {
    const questionValue = await this.questionEditPage.questionValue()
    expect(questionValue).toBe(question)
})

Then(/I see add answer explanations is (unchecked|checked)/, async function (value: string) {
    const answerExplanationsShown = await this.questionEditPage.answerExplanationsVisible()
    expect(answerExplanationsShown).toBe(value === 'checked')
})

Then(/I see multiple choice is (unchecked|checked)/, async function (value: string) {
    const isMultipleChoice = await this.questionEditPage.isMultipleChoice()
    expect(isMultipleChoice).toBe(value === 'checked')
})

Then(/I see easy mode is (unchecked|checked)/, async function (value: string) {
    const isEasyMode = await this.questionEditPage.isEasyMode()
    expect(isEasyMode).toBe(value === 'checked')
})

Then(/I see easy mode is (visible|not visible)/, async function (value: string) {
    const isEasyModeVisible = await this.questionEditPage.isEasyModeVisible()
    expect(isEasyModeVisible).toBe(value === 'visible')
})

const expectAnswer = async (
    world: QuizmasterWorld,
    index: number,
    answer: string,
    isCorrect: boolean,
    explanation: string,
) => {
    const editPage = world.questionEditPage

    expect(await editPage.answerText(index)).toBe(answer)
    expect(await editPage.isAnswerCorrect(index)).toBe(isCorrect)
    expect(await editPage.answerExplanation(index)).toBe(explanation)
}

const expectEmptyAnswers = (world: QuizmasterWorld, index: number) => expectAnswer(world, index, '', false, '')

Then('I see 2 empty answer fields, incorrect, with empty explanations fields, unable to delete', async function () {
    const answerCount = await this.questionEditPage.answerRowCount()
    expect(answerCount).toBe(2)

    await expectEmptyAnswers(this, 0)
    await expectEmptyAnswers(this, 1)

    await expectAnswerDeleteBtnsToBeVisibleAndDisabled(this)
})

Then(/I see answer (\d+) as (correct|incorrect)/, async function (index: number, correctness: string) {
    const isCorrect = correctness === 'correct'
    expect(await this.questionEditPage.isAnswerCorrect(index - 1)).toBe(isCorrect)
})

Then(
    /I see answer (\d+) text "([^"]*)", (correct|incorrect), with explanation "([^"]*)"/,
    async function (index: number, answer: string, correctness: string, explanation: string) {
        await expectAnswer(this, index - 1, answer, correctness === 'correct', explanation)
    },
)

Then(/^I see the answers fields$/, async function (data: TableOf<AnswerRaw>) {
    const answers = data.raw()
    let i = 0

    for (const [answer, star, explanation] of answers) {
        await expectAnswer(this, i++, answer, star === '*', explanation || '')
    }
})

Then('I see empty question explanation field', async function () {
    const explanation = await this.questionEditPage.questionExplanation()
    expect(explanation).toBe('')
})

Then('I see {string} in the question explanation field', async function (explanation: string) {
    const explanationValue = await this.questionEditPage.questionExplanation()
    expect(explanationValue).toBe(explanation)
})

// Field edits

When('I enter question {string}', async function (question: string) {
    await enterQuestion(this, question)
})

When(/I mark the question as (single|multiple) choice/, async function (choice: string) {
    if (choice === 'single') {
        await this.questionEditPage.setSingleChoice()
    } else {
        await this.questionEditPage.setMultipleChoice()
    }
})

When('I enter answer {int} text {string}', async function (index: number, answer: string) {
    await enterAnswerText(this, index - 1, answer)
})

When('I mark answer {int} as correct', async function (index: number) {
    await markAnswerCorrectness(this, index - 1, true)
})

When('I enter answer {int} explanation {string}', async function (index: number, explanation: string) {
    await enterAnswerExplanation(this, index - 1, explanation)
})

When('I enter answer {int} text {string} and mark it as correct', async function (index: number, answer: string) {
    await enterAnswer(this, index - 1, answer, true, '')
})

When(
    /I enter answer (\d+) text "([^"]*)", (correct|incorrect), with explanation "([^"]*)"/,
    async function (index: number, answer: string, correctness: string, explanation: string) {
        await enterAnswer(this, index - 1, answer, correctness === 'correct', explanation)
    },
)

Given('I enter answers', async function (answerRawTable: TableOf<AnswerRaw>) {
    await addAnswers(this, answerRawTable)
})

When('I add an additional answer', async function () {
    await this.questionEditPage.addAdditionalAnswer()
})

When('I enter question explanation {string}', async function (explanation: string) {
    await enterQuestionExplanation(this, explanation)
})

When('mark question as partially scored', async function () {
    await markQuestionAsPartiallyScored(this)
})

// Save question

When('I attempt to save the question', submitQuestion)
When('I submit the question', submitQuestion)

When('I save the question', async function () {
    await saveQuestion(this, 'manual')
})

Then('I see question-take URL and question-edit URL', async function () {
    const takeUrl = await this.questionEditPage.questionUrl()
    const editUrl = await this.questionEditPage.questionEditUrl()

    expect(takeUrl).toBeDefined()
    expect(editUrl).toBeDefined()

    expect(editUrl).toContain('/edit')
    expect(editUrl).not.toContain('/undefined')
})

// Error messages assertions

const expectErrorCount = async (world: QuizmasterWorld, n: number) => {
    await world.page.waitForTimeout(100)
    const errorCount = await world.questionEditPage.errorMessageCount()
    expect(errorCount).toBe(n)
}

Then('I see error messages', async function (table: DataTable) {
    const expectedErrors = table.raw().map(row => row[0])

    await expectErrorCount(this, expectedErrors.length)

    for (const error of expectedErrors) {
        await this.questionEditPage.hasError(error)
    }
})

Then('I see no error messages', async function () {
    await expectErrorCount(this, 0)
})

const expectAnswerDeleteBtnsToBeVisibleAndDisabled = async (
    world: QuizmasterWorld,
    expectedBtnCount = 2,
    expectDisabled = true,
) => {
    const trashIconButtons = world.questionEditPage.answerDeleteButtonsLocator()
    const btnCount = await trashIconButtons.count()

    expect(btnCount).toBe(expectedBtnCount)
    for (let i = 0; i < btnCount; i++) {
        const trashIconBtn = trashIconButtons.nth(i)
        expect(trashIconBtn).toBeVisible()
        if (expectDisabled) {
            expect(trashIconBtn).toBeDisabled()
        } else {
            expect(trashIconBtn).toBeEnabled()
        }
    }
}

Then('I delete answer {int}', async function (answerNumber: number) {
    const answerDeleteButtonLocator = this.questionEditPage.answerDeleteButtonLocator(answerNumber - 1)

    answerDeleteButtonLocator.click()
})

Then('I do not see answer {string}', async function (answer: string) {
    const answerRowsLocator = this.questionEditPage.answerRowsLocator()

    const answerCount = await answerRowsLocator.count()
    for (let i = 0; i < answerCount; i++) {
        expect(await this.questionEditPage.answerText(i)).not.toBe(answer)
    }
})

Then('I see {int} trash icon buttons enabled', async function (buttonCount: number) {
    await expectAnswerDeleteBtnsToBeVisibleAndDisabled(this, buttonCount, false)
})

Then('I see {int} trash icon buttons disabled', async function (buttonCount: number) {
    await expectAnswerDeleteBtnsToBeVisibleAndDisabled(this, buttonCount, true)
})
