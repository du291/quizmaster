import { expect } from '@playwright/test'
import { Given, Then } from 'steps/fixture.ts'
import type { QuizmasterWorld } from 'steps/world/world.ts'

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

Then('the home cube should change rotation on {int} clicks', async function (this: QuizmasterWorld, clickCount: number) {
    expect(clickCount).toBeGreaterThan(0)

    const transforms = new Set<string>()
    let previousTransform = await this.homePage.getCubeTransform()
    transforms.add(previousTransform)

    for (let clickIndex = 0; clickIndex < clickCount; clickIndex += 1) {
        await this.homePage.clickCube()

        await expect
            .poll(() => this.homePage.getCubeTransform(), {
                message: `Expected cube transform to change after click ${clickIndex + 1}`,
            })
            .not.toBe(previousTransform)

        previousTransform = await this.homePage.getCubeTransform()
        transforms.add(previousTransform)
    }

    expect(transforms.size).toBe(clickCount + 1)
})
