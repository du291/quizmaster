import { expect } from '@playwright/test'
import { When, Then } from '../fixture.ts'
import type { QuizmasterWorld } from '../world/world.ts'
import { expectTextToBe } from '../common.ts'

const answer = async (world: QuizmasterWorld, n: number) => {
    await world.takeQuestionPage.selectAnswerNth(n)
    await world.takeQuestionPage.submit()
}

const answerCorrectly = (world: QuizmasterWorld) => async () => answer(world, 0)
const answerIncorrectly = (world: QuizmasterWorld) => async () => answer(world, 1)

const nTimes = async (n: number, fn: () => Promise<void>) => {
    for (let i = 0; i < n; i++) await fn()
}

When('I answer the question', async function () {
    await answerCorrectly(this)()
})

When('I answer correctly', async function () {
    await answerCorrectly(this)()
})

When('I answer incorrectly', async function () {
    await answerIncorrectly(this)()
})

When('I answer {int} questions correctly', async function (correct: number) {
    await nTimes(correct, answerCorrectly(this))
})

When('I answer {int} questions incorrectly', async function (incorrect: number) {
    await nTimes(incorrect, answerIncorrectly(this))
})

Then('I see feedback mode {string}', async function (modeLabel: string) {
    const feedbackModeElement = this.quizCreatePage.feedbackModeElement()
    const feedbackModeElementLabel = feedbackModeElement.locator('xpath=..').locator('label')
    await expect(feedbackModeElement).toBeVisible()
    await expectTextToBe(feedbackModeElementLabel, modeLabel)
})
