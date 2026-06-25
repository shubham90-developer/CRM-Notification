import { useEffect, useState } from 'react'

const useElapsedTimer = (startedAt?: string | null, stoppedAt?: string | null) => {
  const getElapsed = () => {
    if (!startedAt) return 0
    const start = new Date(startedAt).getTime()
    const end = stoppedAt ? new Date(stoppedAt).getTime() : Date.now()
    return Math.max(0, Math.floor((end - start) / 1000))
  }

  const [elapsed, setElapsed] = useState(getElapsed)

  useEffect(() => {
    setElapsed(getElapsed())

    if (!startedAt || stoppedAt) return

    const interval = setInterval(() => {
      setElapsed(getElapsed())
    }, 1000)

    return () => clearInterval(interval)
  }, [startedAt, stoppedAt])

  return elapsed
}

export default useElapsedTimer
