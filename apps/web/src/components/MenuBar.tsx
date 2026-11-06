import { BatteryFull } from 'lucide-react'
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

export default function MenuBar() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15_000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className='fixed inset-x-0 top-0 z-30 flex h-8 items-center justify-between border-b border-white/10 bg-black/30 px-3 text-[13px] text-white backdrop-blur-xl sm:px-4'>
      <div className='flex items-center gap-2'>
        <img
          src={alocLogo}
          alt=''
          className='h-[18px] w-[18px] object-contain'
          draggable={false}
        />
        <span className='font-apple font-semibold'>ALOC</span>
      </div>

      <div className='flex items-center gap-3 font-apple text-white/90 tabular-nums'>
        <span className='flex items-center gap-1'>
          100%
          <BatteryFull
            className='h-[18px] w-[18px]'
            strokeWidth={1.5}
            aria-hidden='true'
          />
        </span>
        <span>{timeFormatter.format(now)}</span>
      </div>
    </header>
  )
}
