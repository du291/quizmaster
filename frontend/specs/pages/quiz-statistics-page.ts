import type { Page } from '@playwright/test'

export class QuizStatisticsPage {
    constructor(private page: Page) {}

    header = () => this.page.locator('h2').textContent()
    name = () => this.page.locator('h3#quiz-name').textContent()
    description = () => this.page.locator('p#quiz-description').textContent()
    timesTaken = async () => Number.parseInt((await this.page.locator('span#times-taken').textContent()) ?? '')
    timesFinished = async () => Number.parseInt((await this.page.locator('span#times-finished').textContent()) ?? '')
    averageScore = async () => Number.parseInt((await this.page.locator('span#average-score').textContent()) ?? '')

    startedCount = async () => Number.parseInt((await this.page.locator('span#started-count').textContent()) ?? '')
    finishedCount = async () => Number.parseInt((await this.page.locator('span#finished-count').textContent()) ?? '')
    successRate = async () => Number.parseInt((await this.page.locator('span#success-rate').textContent()) ?? '')
    failureRate = async () => Number.parseInt((await this.page.locator('span#failure-rate').textContent()) ?? '')
    timeoutCount = async () => Number.parseInt((await this.page.locator('span#timeout-count').textContent()) ?? '')
    averageTime = async () => Number.parseInt((await this.page.locator('span#average-time').textContent()) ?? '')

}
