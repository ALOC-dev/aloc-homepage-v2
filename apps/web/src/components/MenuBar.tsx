import { useEffect, useState } from 'react'
import alocLogo from '../assets/aloc-logo.png'

const timeFormatter = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

const COHORT_START = new Date(2026, 8, 1)
const COHORT_END = new Date(2027, 1, 28)

function cohortProgress(date: Date) {
  const total = COHORT_END.getTime() - COHORT_START.getTime()
  const elapsed = date.getTime() - COHORT_START.getTime()
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)))
}

function BatteryIcon({
  percent,
  className,
}: {
  percent: number
  className?: string
}) {
  const fillWidth = Math.max(1, (percent / 100) * 15)

  return (
    <svg
      viewBox='0 0 22 11'
      fill='none'
      aria-hidden='true'
      className={className}
    >
      <rect
        x='0.5'
        y='0.5'
        width='18'
        height='10'
        rx='2.5'
        stroke='currentColor'
        strokeOpacity='0.7'
      />
      <rect
        x='2'
        y='2'
        width={fillWidth}
        height='7'
        rx='1.2'
        fill='currentColor'
      />
      <rect
        x='19.5'
        y='3.5'
        width='1.5'
        height='4'
        rx='0.8'
        fill='currentColor'
        fillOpacity='0.7'
      />
    </svg>
  )
}

export default function MenuBar() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000)
    return () => clearInterval(id)
  }, [])

  const percent = cohortProgress(now)

  return (
    <header className='fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between px-4 text-[15px] text-white sm:px-5'>
      <div
        className='pointer-events-none absolute inset-0 backdrop-blur-lg'
        style={{
          maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 55%, transparent 100%)',
        }}
      />

      <div className='relative flex items-center gap-2.5'>
        <img
          src={alocLogo}
          alt=''
          className='h-6 w-6 object-contain'
          draggable={false}
        />
        <span className='font-apple font-semibold'>ALOC</span>
      </div>

      <div className='relative flex items-center gap-3 font-apple text-white/90 tabular-nums'>
        <span className='flex items-center gap-1.5' title='6기 진행률'>
          {percent}%
          <BatteryIcon percent={percent} className='h-5 w-auto' />
        </span>
        <span>{timeFormatter.format(now)}</span>
      </div>
    </header>
  )
}
