import { expect } from '@playwright/test'
import { When, Then } from '../fixture.ts'
import type { QuizmasterWorld } from '../world'

const openStats = async (world: QuizmasterWorld, quizId: string) => {
    const quizUrl = `${world.quizBookmarks[quizId]?.url}/stats` || `/quiz/${quizId}/stats`
    await world.page.goto(quizUrl)
}

Then('I see the quiz statistics page', async function () {
    expect(await this.quizStatisticsPage.header()).toBe('Quiz statistics')
})

Then('I see quiz name on stats page {string}', async function (quizName: string) {
    expect(await this.quizStatisticsPage.name()).toBe(quizName)
})

Then('I see quiz description on stats page {string}', async function (description: string) {
    expect(await this.quizStatisticsPage.description()).toBe(description)
})

Then('I see times taken {int}', async function (timesTaken: number) {
    expect(await this.quizStatisticsPage.timesTaken()).toBe(timesTaken)
})

Then('I see times finished {int}', async function (timesFinished: number) {
    expect(await this.quizStatisticsPage.timesFinished()).toBe(timesFinished)
})

Then('I see average score {float} %', async function (averageScore: number) {
    expect(await this.quizStatisticsPage.averageScore()).toBe(averageScore)
})

Then('I see average time {float} s', async function (averageTime: number) {
    expect(await this.quizStatisticsPage.averageTime()).toBe(averageTime)
})

Then('I see success rate {float} %', async function (successRate: number) {
    expect(await this.quizStatisticsPage.successRate()).toBe(successRate)
})

Then('I see failure rate {float} %', async function (failureRate: number) {
    expect(await this.quizStatisticsPage.failureRate()).toBe(failureRate)
})


Then('I see timeout count {int}', async function (timeoutCount: number) {
    expect(await this.quizStatisticsPage.timeoutCount()).toBe(timeoutCount)
})

When('I open quiz stats', async function () {
    await openStats(this, this.activeQuizBookmark)
})
