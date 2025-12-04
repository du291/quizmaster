import { When } from './fixture'

When('I refresh the page', async function () {
    await this.page.reload({ waitUntil: 'networkidle' })
})

When('I follow the copied URL', async function () {
    const copiedURL: string = await this.page.evaluate(
        // @ts-ignore - navigator is a browser API
        () => navigator.clipboard.readText(),
    )
    await this.page.goto(copiedURL)
})

When('I use the browser back button', async function () {
    await this.page.goBack()
})

When('I use the browser forward button', async function () {
    await this.page.goForward()
})
