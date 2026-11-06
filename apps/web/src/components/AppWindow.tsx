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

export default function AppWindow({
  onClose,
  widthClass = 'max-w-4xl',
  children,
}: {
  onClose: () => void
  widthClass?: string
  children: (close: () => void) => ReactNode
}) {
  const [entered, setEntered] = useState(false)
  const [closing, setClosing] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef<DragStart>({
    x: 0,
    y: 0,
    posX: 0,
    posY: 0,
    rect: new DOMRect(),
  })

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  function handleClose() {
    setClosing(true)
    window.setTimeout(onClose, 320)
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
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

  const visible = entered && !closing

  return (
    <div className='pointer-events-none fixed inset-0 z-[25] flex items-center justify-center px-6'>
      <div
        className={`pointer-events-auto w-full ${widthClass}`}
        style={{
          transform: visible
            ? 'translateY(0) scale(1)'
            : 'translateY(220px) scale(0.25)',
          opacity: visible ? 1 : 0,
          transformOrigin: 'bottom center',
          transition:
            'transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 260ms ease-out',
        }}
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px)`,
            transition: dragging ? 'none' : 'transform 200ms ease-out',
          }}
        >
          {children(handleClose)}
        </div>
      </div>
    </div>
  )
}
