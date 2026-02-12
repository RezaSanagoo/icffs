import { useState, useEffect } from 'react'

export default function StatusBar() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black px-4 py-1 flex items-center justify-between text-xs text-white">
      <span>{formatTime(time)}</span>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5">
          <div className="w-4 h-2 border border-white rounded-sm">
            <div className="w-3 h-1.5 bg-white rounded-sm m-0.5" />
          </div>
          <div className="w-1 h-1.5 bg-white rounded-r-sm" />
        </div>
        <div className="w-4 h-2 border border-white rounded-sm">
          <div className="w-3 h-1.5 bg-white rounded-sm m-0.5" />
        </div>
        <span className="text-[10px]">94</span>
      </div>
    </div>
  )
}

