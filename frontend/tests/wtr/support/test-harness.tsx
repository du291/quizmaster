import { createRoot, type Root } from 'react-dom/client'
import { App } from '../../../src/app.tsx'

export const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

export const waitFor = async (check: () => boolean, timeoutMs = 2500): Promise<void> => {
    const start = performance.now()
    while (performance.now() - start < timeoutMs) {
        if (check()) return
        await nextFrame()
    }
    throw new Error(`Condition not met within ${timeoutMs}ms`)
}

export const waitForElement = async <T extends Element>(selector: string, timeoutMs = 2500): Promise<T> => {
    let found: T | null = null
    await waitFor(() => {
        found = document.querySelector<T>(selector)
        return found !== null
    }, timeoutMs)
    return found as T
}

export const setTextValue = async (selector: string, value: string) => {
    const element = await waitForElement<HTMLInputElement | HTMLTextAreaElement>(selector)
    await setElementValue(element, value)
}

export const setElementValue = async (
    element: HTMLInputElement | HTMLTextAreaElement,
    value: string | number,
): Promise<void> => {
    const valueSetter =
        Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), 'value')?.set ??
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set ??
        Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set

    if (!valueSetter) throw new Error('Unable to resolve native value setter')
    valueSetter.call(element, String(value))
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.dispatchEvent(new Event('change', { bubbles: true }))
    await nextFrame()
}

export const clickElement = async (selector: string) => {
    const element = await waitForElement<HTMLElement>(selector)
    element.click()
    await nextFrame()
}

export const textContent = (selector: string): string => {
    const element = document.querySelector(selector)
    return element?.textContent?.trim() ?? ''
}

export const renderAppAt = async (path: string) => {
    window.history.replaceState({}, '', path)
    const host = document.createElement('div')
    document.body.append(host)

    const root: Root = createRoot(host)
    root.render(<App />)
    await nextFrame()

    const cleanup = async () => {
        root.unmount()
        host.remove()
        await nextFrame()
    }

    return { cleanup }
}
