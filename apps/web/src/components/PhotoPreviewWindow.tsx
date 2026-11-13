import {
  ChevronDown,
  Crop,
  Info,
  Lasso,
  PanelLeft,
  PenTool,
  RotateCw,
  Search,
  Share,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import TrafficLights from './TrafficLights'

export type PreviewPhoto = {
  fileName: string
  caption: string
  src: string
  fit?: 'cover' | 'contain'
}

type DragStart = {
  x: number
  y: number
  posX: number
  posY: number
}

export default function PhotoPreviewWindow({
  photo,
  onClose,
}: {
  photo: PreviewPhoto
  onClose: () => void
}) {
  const [entered, setEntered] = useState(false)
  const [closing, setClosing] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<DragStart>({ x: 0, y: 0, posX: 0, posY: 0 })

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  function handleClose() {
    setClosing(true)
    window.setTimeout(onClose, 300)
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    if (maximized || !target.closest('[data-drag-handle]')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStart.current = { x: e.clientX, y: e.clientY, posX: pos.x, posY: pos.y }
    setDragging(true)
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return
    const { x, y, posX, posY } = dragStart.current
    setPos({ x: posX + (e.clientX - x), y: posY + (e.clientY - y) })
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId)
    setDragging(false)
  }

  const visible = entered && !closing

  return (
    <div className='pointer-events-none fixed inset-0 z-[30] flex items-center justify-center px-6'>
      <div
        className={`w-full transition-[max-width] duration-300 ease-out ${maximized ? 'max-w-[1400px]' : 'max-w-3xl'}`}
        style={{
          pointerEvents: visible ? 'auto' : 'none',
          transform: visible
            ? `translate(${pos.x}px, ${pos.y}px) scale(1)`
            : 'translateY(160px) scale(0.3)',
          opacity: visible ? 1 : 0,
          transformOrigin: 'bottom center',
          transition: dragging
            ? 'none'
            : 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease-in-out, max-width 300ms ease-out',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <section
          aria-label={photo.fileName}
          className='flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-24px_rgba(28,27,41,0.6)]'
        >
          <header className='flex flex-wrap items-center gap-2 border-b border-black/5 px-4 py-2.5'>
            <TrafficLights
              onClose={handleClose}
              onMinimize={() => setCollapsed((v) => !v)}
              onToggleMaximize={() => setMaximized((v) => !v)}
            />

            <PanelLeft
              className='h-[18px] w-[18px] shrink-0 text-muted'
              strokeWidth={1.75}
            />

            <p
              data-drag-handle
              className={`min-w-0 flex-1 touch-none truncate py-1 text-center text-sm font-medium text-ink select-none ${
                maximized
                  ? 'cursor-default'
                  : 'cursor-grab active:cursor-grabbing'
              }`}
            >
              {photo.fileName}
            </p>

            <div className='hidden items-center gap-1.5 text-muted lg:flex'>
              <ZoomOut className='h-4 w-4' strokeWidth={1.75} />
              <ZoomIn className='h-4 w-4' strokeWidth={1.75} />
            </div>

            <div className='hidden items-center gap-0.5 text-muted lg:flex'>
              <PenTool className='h-4 w-4' strokeWidth={1.75} />
              <ChevronDown className='h-3 w-3' strokeWidth={2} />
            </div>

            <div className='hidden items-center gap-2.5 text-muted lg:flex'>
              <Lasso className='h-4 w-4' strokeWidth={1.75} />
              <RotateCw className='h-4 w-4' strokeWidth={1.75} />
              <Crop className='h-4 w-4' strokeWidth={1.75} />
            </div>

            <div className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'>
              <Sparkles className='h-3.5 w-3.5' strokeWidth={2} />
            </div>

            <div className='hidden items-center gap-2.5 text-muted md:flex'>
              <Info className='h-4 w-4' strokeWidth={1.75} />
              <Share className='h-4 w-4' strokeWidth={1.75} />
            </div>

            <div className='flex items-center gap-1.5 rounded-md bg-black/5 px-2 py-1 text-muted'>
              <Search className='h-3.5 w-3.5' strokeWidth={2} />
              <input
                placeholder='검색'
                className='w-16 bg-transparent text-xs text-ink placeholder:text-muted focus:outline-none'
              />
            </div>
          </header>

          {!collapsed && (
            <div
              className={`flex items-center justify-center bg-black/[0.03] p-4 transition-[height] duration-300 ease-out ${
                maximized ? 'h-[min(820px,85vh)]' : 'h-[min(560px,75vh)]'
              }`}
            >
              <img
                src={photo.src}
                alt={photo.caption}
                draggable={false}
                className={`max-h-full max-w-full ${
                  photo.fit === 'contain' ? 'object-contain' : 'object-cover'
                }`}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
