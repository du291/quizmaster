import { expect } from '@playwright/test'
import { expectedNumberOfChildrenToBe } from '../common.ts'
import { Then, When } from '../fixture.ts'
import type { DataTable } from '@cucumber/cucumber'
import { fail } from 'node:assert'

When('I start creating a new quiz', async function () {
    await this.workspacePage.createNewQuiz()
})

When('I enter quiz name {string}', async function (title: string) {
    await this.quizCreatePage.enterQuizName(title)
})

When('I see empty quiz title', async function () {
    await this.quizCreatePage.getQuizTitleValue().then(value => expect(value).toBe(''))
})

When('I see empty quiz description', async function () {
    await this.quizCreatePage.getQuizDescriptionValue().then(value => expect(value).toBe(''))
})

When('I see time limit {string} seconds', async function (timeLimit: string) {
    await this.quizCreatePage
        .timeLimitInput()
        .inputValue()
        .then(value => expect(value).toBe(timeLimit))
})

When('I see pass score {string}', async function (score: string) {
    await this.quizCreatePage
        .passScoreInput()
        .inputValue()
        .then(value => expect(value).toBe(score))
})

When('I see quiz question {string}', async function (title: string) {
    await this.quizCreatePage
        .getQuestion(title)
        .first()
        .isVisible()
        .then(visible => expect(visible).toEqual(true))
})

When('I enter quiz description {string}', async function (title: string) {
    await this.quizCreatePage.enterDescription(title)
})

When('I select question {string}', async function (question: string) {
    await this.quizCreatePage.selectQuestion(question)
})

When('I submit the quiz', async function () {
    await this.quizCreatePage.submit()
})

When('I take the quiz', async function () {
    await this.quizCreatePage.takeQuiz()
})

When('I enter pass score {string}', async function (score: string) {
    await this.quizCreatePage.passScoreInput().fill(score)
})

When('I enter time limit {string}', async function (limit: string) {
    await this.quizCreatePage.timeLimitInput().fill(limit)
})

Then('I display the quiz statistics', async function () {
    await this.quizCreatePage.showQuizStatistics()
})

Then('I see workspace with {int} available questions', async function (count: number) {
    await expectedNumberOfChildrenToBe(this.quizCreatePage.questionsInList(), count)
})

Then('I clear time limit', async function () {
    await this.quizCreatePage.clearTimeLimit()
})

Then('I clear score', async function () {
    await this.quizCreatePage.clearScore()
})

Then('I see error messages in quiz form', async function (table: DataTable) {
    const expectedErrors = table.raw().map(row => row[0])
    for (const error of expectedErrors) {
        const hasError = await this.quizCreatePage.hasError(error)
        expect(hasError).toBe(true)
    }
})

Then('I see no error messages in quiz form', async function () {
    await this.quizCreatePage.hasAnyError().then(result => expect(result).toBe(false))
})

When('I filter questions by {string}', (s: string) => {
  fail('Not implemented yet')
})

Then("I don't see questions in quiz creation form", () => {
  fail('Not implemented yet')
})

Then('I see questions in quiz creation form', () => {
  fail('Not implemented yet')
})
