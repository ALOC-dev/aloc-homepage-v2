import { Maximize2, Minus, X } from 'lucide-react'

export default function TrafficLights({
  onClose,
  onMinimize,
  onToggleMaximize,
}: {
  onClose: () => void
  onMinimize: () => void
  onToggleMaximize: () => void
}) {
  return (
    <div className='group flex gap-2'>
      <button
        type='button'
        onClick={onClose}
        aria-label='닫기'
        className='relative -m-1 flex h-5 w-5 items-center justify-center rounded-full p-1'
      >
        <span className='h-3 w-3 rounded-full bg-[#ff5f57]' />
        <X
          className='absolute h-2 w-2 text-black/50 opacity-0 transition-opacity group-hover:opacity-100'
          strokeWidth={3}
        />
      </button>
      <button
        type='button'
        onClick={onMinimize}
        aria-label='최소화'
        className='relative -m-1 flex h-5 w-5 items-center justify-center rounded-full p-1'
      >
        <span className='h-3 w-3 rounded-full bg-[#febc2e]' />
        <Minus
          className='absolute h-2 w-2 text-black/50 opacity-0 transition-opacity group-hover:opacity-100'
          strokeWidth={3}
        />
      </button>
      <button
        type='button'
        onClick={onToggleMaximize}
        aria-label='확장'
        className='relative -m-1 flex h-5 w-5 items-center justify-center rounded-full p-1'
      >
        <span className='h-3 w-3 rounded-full bg-[#28c840]' />
        <Maximize2
          className='absolute h-2 w-2 text-black/50 opacity-0 transition-opacity group-hover:opacity-100'
          strokeWidth={3}
        />
      </button>
    </div>
  )
}
