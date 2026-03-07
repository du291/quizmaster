import { useEffect, useState } from 'react'
import { useClock } from 'infrastructure/clock.tsx'

interface CountdownProps {
    readonly timeLimit: number
    readonly onTimeLimit: () => void
}

export const Countdown = ({ onTimeLimit, timeLimit }: CountdownProps) => {
    const clock = useClock()
    const durationMs = (timeLimit || 120) * 1000

    const [timeLeft, setTimeLeft] = useState(durationMs)

    useEffect(() => {
        const endTime = clock.now() + durationMs
        const interval = clock.setInterval(() => {
            const newTimeLeft = endTime - clock.now()
            if (newTimeLeft <= 0) {
                clock.clearInterval(interval)
                setTimeLeft(0)
            } else {
                setTimeLeft(newTimeLeft)
            }
        }, 1000)
        return () => clock.clearInterval(interval)
    }, [clock, durationMs])

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeLimit()
        }
    }, [timeLeft, onTimeLimit])

    const minutes = Math.floor(timeLeft / 60000)
    const seconds = Math.floor((timeLeft % 60000) / 1000)

    return (
        <div data-testid="timerID">{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</div>
    )
}
