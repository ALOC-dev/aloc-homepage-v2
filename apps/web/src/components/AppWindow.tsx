import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

const MENU_BAR_HEIGHT = 56

type DragStart = {
  x: number
  y: number
  posX: number
  posY: number
  rect: DOMRect
}

export type WindowActions = {
  close: () => void
  minimize: () => void
  toggleMaximize: () => void
  maximized: boolean
}

export default function AppWindow({
  onClose,
  minimized = false,
  onMinimize,
  widthClass = 'max-w-4xl',
  onFocus,
  children,
}: {
  onClose: () => void
  minimized?: boolean
  onMinimize?: () => void
  widthClass?: string
  onFocus?: () => void
  children: (actions: WindowActions) => ReactNode
}) {
  const [entered, setEntered] = useState(false)
  const [closing, setClosing] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<DragStart>({
    x: 0,
    y: 0,
    posX: 0,
    posY: 0,
    rect: new DOMRect(),
  })
  const posBeforeMaximize = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  function handleClose() {
    setClosing(true)
    window.setTimeout(onClose, 650)
  }

  function handleMinimize() {
    onMinimize?.()
  }

  function handleToggleMaximize() {
    setMaximized((wasMaximized) => {
      if (!wasMaximized) {
        posBeforeMaximize.current = pos
        setPos({ x: 0, y: 0 })
      } else {
        setPos(posBeforeMaximize.current)
      }
      return !wasMaximized
    })
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (maximized) return
    const target = e.target as HTMLElement
    if (!target.closest('[data-drag-handle]')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: pos.x,
      posY: pos.y,
      rect: e.currentTarget.getBoundingClientRect(),
    }
    setDragging(true)
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return
    const { rect, x, y, posX, posY } = dragStart.current

    const minDx = -rect.left
    const maxDx = window.innerWidth - rect.right
    const minDy = MENU_BAR_HEIGHT - rect.top
    const maxDy = window.innerHeight - rect.bottom

    const dx = Math.min(Math.max(e.clientX - x, minDx), maxDx)
    const dy = Math.min(Math.max(e.clientY - y, minDy), maxDy)

    setPos({ x: posX + dx, y: posY + dy })
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId)
    setDragging(false)
  }

  const visible = entered && !closing && !minimized
  const transition =
    'transform 650ms cubic-bezier(0.4, 0, 0.2, 1), opacity 450ms ease-in-out'

  return (
    <div className='pointer-events-none fixed inset-0 z-[25] flex items-center justify-center px-6'>
      <div
        className={`pointer-events-none w-full transition-[max-width] duration-300 ease-out ${maximized ? 'max-w-[1400px]' : widthClass}`}
        style={{
          transform: visible
            ? 'translateY(0) scale(1)'
            : 'translateY(220px) scale(0.25)',
          opacity: visible ? 1 : 0,
          transformOrigin: 'bottom center',
          transition: `${transition}, max-width 300ms ease-out`,
        }}
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerDownCapture={onFocus}
          style={{
            pointerEvents: visible ? 'auto' : 'none',
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            transition: dragging ? 'none' : 'transform 200ms ease-out',
          }}
        >
          {children({
            close: handleClose,
            minimize: handleMinimize,
            toggleMaximize: handleToggleMaximize,
            maximized,
          })}
        </div>
      </div>
    </div>
  )
}
