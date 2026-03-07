import { expect } from '@esm-bundle/chai'
import { createRealClock, createSimulatedClock } from '../../../src/infrastructure/clock.tsx'

describe('Clock infrastructure', () => {
    it('delegates real clock calls to the provided environment', () => {
        const calls: string[] = []
        const intervalId = 42 as ReturnType<typeof setInterval>

        const clock = createRealClock({
            now: () => {
                calls.push('now')
                return 1_700_000_000_000
            },
            setInterval: (_callback, intervalMs) => {
                calls.push(`setInterval:${intervalMs}`)
                return intervalId
            },
            clearInterval: receivedIntervalId => {
                calls.push(`clearInterval:${String(receivedIntervalId)}`)
            },
        })

        expect(clock.now()).to.equal(1_700_000_000_000)
        expect(clock.setInterval(() => undefined, 1000)).to.equal(intervalId)
        clock.clearInterval(intervalId)

        expect(calls).to.deep.equal(['now', 'setInterval:1000', 'clearInterval:42'])
    })

    it('advances simulated time and fires interval callbacks at each boundary', () => {
        const clock = createSimulatedClock(1_000)
        const callbackTimes: number[] = []

        clock.setInterval(() => {
            callbackTimes.push(clock.now())
        }, 1_000)

        clock.advanceBy(2_500)

        expect(clock.now()).to.equal(3_500)
        expect(callbackTimes).to.deep.equal([2_000, 3_000])
    })

    it('stops firing simulated intervals once they are cleared', () => {
        const clock = createSimulatedClock(5_000)
        let callbackCount = 0

        const intervalId = clock.setInterval(() => {
            callbackCount += 1
        }, 1_000)

        clock.advanceBy(1_000)
        clock.clearInterval(intervalId)
        clock.advanceBy(5_000)

        expect(callbackCount).to.equal(1)
        expect(clock.now()).to.equal(11_000)
    })
})
