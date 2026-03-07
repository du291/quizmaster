import { createContext, useContext, type ReactNode } from 'react'

export type ClockInterval = number

export interface Clock {
    now: () => number
    setInterval: (callback: () => void, intervalMs: number) => ClockInterval
    clearInterval: (intervalId: ClockInterval) => void
}

export interface SimulatedClock extends Clock {
    advanceBy: (milliseconds: number) => void
}

interface RealClockEnvironment {
    readonly now: () => number
    readonly setInterval: (callback: () => void, intervalMs: number) => ClockInterval
    readonly clearInterval: (intervalId: ClockInterval) => void
}

const browserClockEnvironment: RealClockEnvironment = {
    now: () => Date.now(),
    setInterval: (callback, intervalMs) => window.setInterval(callback, intervalMs),
    clearInterval: intervalId => window.clearInterval(intervalId),
}

export const createRealClock = (environment: RealClockEnvironment = browserClockEnvironment): Clock => ({
    now: () => environment.now(),
    setInterval: (callback, intervalMs) => environment.setInterval(callback, intervalMs),
    clearInterval: intervalId => environment.clearInterval(intervalId),
})

interface ScheduledInterval {
    readonly id: number
    readonly callback: () => void
    readonly intervalMs: number
    nextRunAt: number
}

const nextScheduledInterval = (intervals: Map<number, ScheduledInterval>): ScheduledInterval | undefined =>
    Array.from(intervals.values()).sort((left, right) => {
        if (left.nextRunAt === right.nextRunAt) return left.id - right.id
        return left.nextRunAt - right.nextRunAt
    })[0]

export const createSimulatedClock = (initialTimeMs = 0): SimulatedClock => {
    let currentTimeMs = initialTimeMs
    let nextIntervalId = 1
    const intervals = new Map<number, ScheduledInterval>()

    return {
        now: () => currentTimeMs,
        setInterval: (callback, intervalMs) => {
            if (intervalMs <= 0) {
                throw new Error('Simulated clock requires a positive interval')
            }

            const intervalId = nextIntervalId
            nextIntervalId += 1
            intervals.set(intervalId, {
                id: intervalId,
                callback,
                intervalMs,
                nextRunAt: currentTimeMs + intervalMs,
            })
            return intervalId
        },
        clearInterval: intervalId => {
            intervals.delete(intervalId)
        },
        advanceBy: milliseconds => {
            if (milliseconds < 0) {
                throw new Error('Simulated clock cannot go backwards')
            }

            const targetTimeMs = currentTimeMs + milliseconds
            while (true) {
                const interval = nextScheduledInterval(intervals)
                if (!interval || interval.nextRunAt > targetTimeMs) break

                currentTimeMs = interval.nextRunAt
                interval.callback()

                const updatedInterval = intervals.get(interval.id)
                if (updatedInterval) {
                    updatedInterval.nextRunAt += updatedInterval.intervalMs
                }
            }

            currentTimeMs = targetTimeMs
        },
    }
}

const defaultClock = createRealClock()

const ClockContext = createContext<Clock>(defaultClock)

interface ClockProviderProps {
    readonly children: ReactNode
    readonly clock?: Clock
}

export const ClockProvider = ({ children, clock }: ClockProviderProps) => (
    <ClockContext.Provider value={clock ?? defaultClock}>{children}</ClockContext.Provider>
)

export const useClock = () => useContext(ClockContext)
