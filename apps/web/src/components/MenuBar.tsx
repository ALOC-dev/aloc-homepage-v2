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

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' className={className}>
      <path d='M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zm3.558-3.287c.83-1.013 1.39-2.415 1.234-3.806-1.195.052-2.65.794-3.506 1.807-.767.9-1.44 2.337-1.26 3.715 1.35.104 2.72-.676 3.532-1.716z' />
    </svg>
  )
}

function BatteryIcon({ percent }: { percent: number }) {
  const fillWidth = Math.max(1, (percent / 100) * 15)

  return (
    <svg
      width='22'
      height='11'
      viewBox='0 0 22 11'
      fill='none'
      aria-hidden='true'
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
    <header className='fixed inset-x-0 top-0 z-30 flex h-8 items-center justify-between bg-gradient-to-b from-black/25 to-black/10 px-3 text-[13px] text-white backdrop-blur-md sm:px-4'>
      <div className='flex items-center gap-2.5'>
        <AppleLogo className='h-4 w-4' />
        <img
          src={alocLogo}
          alt=''
          className='h-[18px] w-[18px] object-contain'
          draggable={false}
        />
        <span className='font-apple font-semibold'>ALOC</span>
      </div>

      <div className='flex items-center gap-3 font-apple text-white/90 tabular-nums'>
        <span className='flex items-center gap-1.5' title='6기 진행률'>
          {percent}%
          <BatteryIcon percent={percent} />
        </span>
        <span>{timeFormatter.format(now)}</span>
      </div>
    </header>
  )
}
