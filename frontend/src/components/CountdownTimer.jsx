import { useEffect, useState } from 'react'

function getTimeLeft(target) {
  const diff = new Date(target) - new Date()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function Pad({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="font-mono text-2xl font-bold text-hack-cyan tabular-nums w-14 text-center bg-hack-bg border border-hack-border rounded-lg py-2">
        {String(value).padStart(2, '0')}
      </div>
      <span className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{label}</span>
    </div>
  )
}

export default function CountdownTimer({ targetDate, label, expiredLabel = 'Time is up' }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate))

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate])

  if (!timeLeft) {
    return (
      <div className="inline-flex items-center gap-2 text-sm text-gray-500 font-mono">
        <span className="w-2 h-2 rounded-full bg-gray-600 inline-block" />
        {expiredLabel}
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <Pad value={timeLeft.days} label="days" />
        <span className="text-hack-cyan font-mono text-xl mb-3">:</span>
        <Pad value={timeLeft.hours} label="hrs" />
        <span className="text-hack-cyan font-mono text-xl mb-3">:</span>
        <Pad value={timeLeft.minutes} label="min" />
        <span className="text-hack-cyan font-mono text-xl mb-3">:</span>
        <Pad value={timeLeft.seconds} label="sec" />
      </div>
    </div>
  )
}
