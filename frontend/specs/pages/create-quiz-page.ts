import type { Page } from '@playwright/test'

export class CreateQuizPage {
    constructor(private page: Page) {}

    gotoNew = () => this.page.goto('/quiz-create/new')

    private questionListTitleLocator = () => this.page.locator('#question-list-title')
    enterQuestionListTitle = (title: string) => this.questionListTitleLocator().fill(title)
    questionListTitleValue = () => this.questionListTitleLocator().inputValue()

    submit = () => this.page.locator('button[type="submit"]').click()

    errorMessage = () => this.page.textContent('#error-message')
}
