import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DOCK_ITEMS } from '../dockItems'

function scaleFor(distance: number | null) {
  if (distance === null) return 1
  if (distance === 0) return 1.5
  if (distance === 1) return 1.2
  if (distance === 2) return 1.05
  return 1
}

export default function Dock() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <nav
      aria-label='주요 기능'
      className='fixed bottom-4 left-1/2 flex -translate-x-1/2 items-end gap-1.5 rounded-3xl border border-white/40 bg-white/25 px-2.5 pt-2.5 pb-2 shadow-[0_20px_40px_-15px_rgba(28,27,41,0.45)] backdrop-blur-2xl sm:bottom-6 sm:gap-3 sm:px-4 sm:pt-3 sm:pb-2.5'
      onMouseLeave={() => setHovered(null)}
    >
      {DOCK_ITEMS.map((item, index) => {
        const distance = hovered === null ? null : Math.abs(hovered - index)
        const scale = scaleFor(distance)
        const isActive = distance === 0

        return (
          <Link
            key={item.id}
            to={item.to}
            onMouseEnter={() => setHovered(index)}
            onFocus={() => setHovered(index)}
            onBlur={() => setHovered(null)}
            className='relative flex flex-col items-center focus:outline-none'
            style={{
              transform: `translateY(${isActive ? -16 : 0}px) scale(${scale})`,
              transformOrigin: 'bottom center',
              transition: 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              willChange: 'transform',
            }}
          >
            <span
              role='tooltip'
              className='pointer-events-none absolute -top-8 rounded-md bg-ink/90 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white shadow-lg sm:-top-10'
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive
                  ? 'translateY(0) scale(1)'
                  : 'translateY(4px) scale(0.85)',
                transition: 'opacity 180ms ease-out, transform 180ms ease-out',
                transitionDelay: isActive ? '60ms' : '0ms',
              }}
            >
              {item.label}
            </span>
            <span className='flex h-10 w-10 items-center justify-center drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)] sm:h-14 sm:w-14'>
              <img
                src={item.icon}
                alt=''
                className='h-full w-full object-contain'
                draggable={false}
              />
            </span>
            <span className='sr-only'>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
