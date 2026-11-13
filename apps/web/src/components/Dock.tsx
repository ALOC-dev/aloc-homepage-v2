import { useState } from 'react'
import { DOCK_ITEMS, type DockItem } from '../dockItems'

function scaleFor(distance: number | null) {
  return distance === 0 ? 1.5 : 1
}

export default function Dock({
  onSelect,
  minimizedItem,
  onRestore,
}: {
  onSelect: (id: string) => void
  minimizedItem?: DockItem
  onRestore?: () => void
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const [minimizedHovered, setMinimizedHovered] = useState(false)

  return (
    <nav
      aria-label='주요 기능'
      className='fixed bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-end gap-1.5 rounded-3xl border border-white/40 bg-white/25 px-2.5 pt-2.5 pb-2 shadow-[0_20px_40px_-15px_rgba(28,27,41,0.45)] backdrop-blur-2xl sm:bottom-6 sm:gap-3 sm:px-4 sm:pt-3 sm:pb-2.5'
      onMouseLeave={() => setHovered(null)}
    >
      {DOCK_ITEMS.map((item, index) => {
        const distance = hovered === null ? null : Math.abs(hovered - index)
        const scale = scaleFor(distance)
        const isActive = distance === 0

        return (
          <button
            key={item.id}
            type='button'
            onClick={() => onSelect(item.id)}
            onMouseEnter={() => setHovered(index)}
            onFocus={() => setHovered(index)}
            onBlur={() => setHovered(null)}
            className='relative flex flex-col items-center border-0 bg-transparent p-0 focus:outline-none'
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
          </button>
        )
      })}

      {minimizedItem && (
        <>
          <span className='mx-0.5 mb-1.5 h-10 w-px self-stretch bg-white/40 sm:h-14' />
          <button
            type='button'
            onClick={onRestore}
            onMouseEnter={() => setMinimizedHovered(true)}
            onMouseLeave={() => setMinimizedHovered(false)}
            onFocus={() => setMinimizedHovered(true)}
            onBlur={() => setMinimizedHovered(false)}
            className='relative flex flex-col items-center border-0 bg-transparent p-0 transition-transform duration-150 hover:-translate-y-1 focus:outline-none'
          >
            <span
              role='tooltip'
              className='pointer-events-none absolute -top-8 rounded-md bg-ink/90 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-white shadow-lg sm:-top-10'
              style={{
                opacity: minimizedHovered ? 1 : 0,
                transform: minimizedHovered
                  ? 'translateY(0) scale(1)'
                  : 'translateY(4px) scale(0.85)',
                transition: 'opacity 180ms ease-out, transform 180ms ease-out',
                transitionDelay: minimizedHovered ? '60ms' : '0ms',
              }}
            >
              {minimizedItem.label}
            </span>
            <span className='relative flex h-10 w-10 items-center justify-center opacity-80 drop-shadow-[0_6px_10px_rgba(0,0,0,0.3)] sm:h-14 sm:w-14'>
              <img
                src={minimizedItem.icon}
                alt=''
                className='h-full w-full object-contain'
                draggable={false}
              />
              <span className='absolute -bottom-1 h-1 w-1 rounded-full bg-ink/60' />
            </span>
            <span className='sr-only'>{minimizedItem.label} 복원</span>
          </button>
        </>
      )}
    </nav>
  )
}
