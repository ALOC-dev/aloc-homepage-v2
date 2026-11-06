import type { DockItem } from '../dockItems'

export default function PlaceholderWindow({
  item,
  onClose,
  onMinimize,
}: {
  item: DockItem
  onClose: () => void
  onMinimize: () => void
}) {
  return (
    <section
      aria-label={item.label}
      className='mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-24px_rgba(28,27,41,0.6)]'
    >
      <header className='flex items-center gap-2 border-b border-black/5 px-4 py-3'>
        <button
          type='button'
          onClick={onClose}
          aria-label='닫기'
          className='h-3 w-3 rounded-full bg-[#ff5f57] transition-opacity hover:opacity-80'
        />
        <button
          type='button'
          onClick={onMinimize}
          aria-label='최소화'
          className='h-3 w-3 rounded-full bg-[#febc2e] transition-opacity hover:opacity-80'
        />
        <span className='h-3 w-3 rounded-full bg-[#28c840]' />
        <p
          data-drag-handle
          className='ml-2 min-w-0 flex-1 cursor-grab touch-none truncate py-1 font-display text-sm font-semibold text-muted select-none active:cursor-grabbing'
        >
          {item.label}
        </p>
      </header>

      <div className='flex flex-col items-center gap-3 px-8 py-12 text-center'>
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
