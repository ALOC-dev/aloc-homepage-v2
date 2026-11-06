import type { DockItem } from '../dockItems'
import TrafficLights from './TrafficLights'

export default function PlaceholderWindow({
  item,
  onClose,
  onMinimize,
  onToggleMaximize,
  maximized,
}: {
  item: DockItem
  onClose: () => void
  onMinimize: () => void
  onToggleMaximize: () => void
  maximized: boolean
}) {
  return (
    <section
      aria-label={item.label}
      className={`mx-auto w-full overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-24px_rgba(28,27,41,0.6)] transition-[max-width] duration-300 ease-out ${
        maximized ? 'max-w-2xl' : 'max-w-sm'
      }`}
    >
      <header className='flex items-center gap-2 border-b border-black/5 px-4 py-3'>
        <TrafficLights
          onClose={onClose}
          onMinimize={onMinimize}
          onToggleMaximize={onToggleMaximize}
        />
        <p
          data-drag-handle
          className='ml-2 min-w-0 flex-1 cursor-grab touch-none truncate py-1 font-display text-sm font-semibold text-muted select-none active:cursor-grabbing'
        >
          {item.label}
        </p>
      </header>

      <div
        className={`flex flex-col items-center gap-3 text-center transition-[padding] duration-300 ease-out ${
          maximized ? 'px-8 py-24' : 'px-8 py-12'
        }`}
      >
        <img
          src={item.icon}
          alt=''
          className='h-14 w-14 object-contain'
          draggable={false}
        />
        <p className='text-sm text-muted'>
          아직 준비 중이에요. 곧 채워질 예정이에요.
        </p>
      </div>
    </section>
  )
}
