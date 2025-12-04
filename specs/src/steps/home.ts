import { Given, Then } from './fixture.ts'
import { expect } from '@playwright/test'
import type { QuizmasterWorld } from './world/world.ts'

Given('I am on the home page', async function (this: QuizmasterWorld) {
    await this.homePage.goto()
    await this.homePage.waitForLoaded()
})

Then('I should see a link to create a new question', async function (this: QuizmasterWorld) {
    const hasLink = await this.homePage.hasCreateQuestionLink()
    expect(hasLink).toBeTruthy()
})

Then('I should see a link to create a new workspace', async function (this: QuizmasterWorld) {
    const hasLink = await this.homePage.hasCreateWorkspaceLink()
    expect(hasLink).toBeTruthy()
})
