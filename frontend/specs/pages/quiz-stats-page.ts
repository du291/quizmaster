import type { Page } from '@playwright/test'

export class QuizStatsPage {
    constructor(private page: Page) {}

    header = () => this.page.locator('h2').textContent()
    name = () => this.page.locator('h3#quiz-name').textContent()
}
