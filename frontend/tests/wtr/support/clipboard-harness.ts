export interface InstalledClipboardHarness {
    readonly readText: () => string
    readonly readAlerts: () => readonly string[]
    readonly restore: () => void
}

export const installClipboardHarness = (): InstalledClipboardHarness => {
    let copiedText = ''
    const alerts: string[] = []

    const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'clipboard')
    const originalAlert = window.alert

    Object.defineProperty(window.navigator, 'clipboard', {
        configurable: true,
        value: {
            writeText: async (text: string) => {
                copiedText = text
            },
        },
    })

    window.alert = (message?: string) => {
        alerts.push(String(message ?? ''))
    }

    return {
        readText: () => copiedText,
        readAlerts: () => [...alerts],
        restore: () => {
            if (originalClipboardDescriptor) {
                Object.defineProperty(window.navigator, 'clipboard', originalClipboardDescriptor)
            } else {
                delete (window.navigator as Navigator & { clipboard?: unknown }).clipboard
            }

            window.alert = originalAlert
        },
    }
}
