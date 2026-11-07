import { type PointerEvent as ReactPointerEvent, useRef, useState } from 'react'
import dinner1 from '../assets/photos/dinner-1.jpg'
import dinner2 from '../assets/photos/dinner-2.jpg'
import dinnerClose from '../assets/photos/dinner-close.jpg'
import dinnerWide from '../assets/photos/dinner-wide.jpg'
import graduationBanner from '../assets/photos/graduation-banner.jpg'
import otGroup from '../assets/photos/ot-group.jpg'
import type { PreviewPhoto } from './PhotoPreviewWindow'
import TrafficLights from './TrafficLights'

type Photo = PreviewPhoto & { id: string }

const PHOTOS: Photo[] = [
  {
    id: 'ot-group',
    fileName: '알록 5기 OT.jpg',
    caption: '5기 OT',
    src: otGroup,
  },
  {
    id: 'dinner-1',
    fileName: '알록 뒤풀이.jpg',
    caption: '뒤풀이',
    src: dinner1,
  },
  {
    id: 'dinner-2',
    fileName: '알록 저녁 모임.jpg',
    caption: '저녁 모임',
    src: dinner2,
  },
  {
    id: 'graduation',
    fileName: '알록 졸업 축하.jpg',
    caption: '졸업 축하',
    src: graduationBanner,
    fit: 'contain',
  },
  {
    id: 'dinner-wide',
    fileName: '알록 정기 모임.jpg',
    caption: '정기 모임',
    src: dinnerWide,
  },
  {
    id: 'dinner-close',
    fileName: '알록 다같이 한 끼.jpg',
    caption: '다같이 한 끼',
    src: dinnerClose,
  },
]

const MENU_BAR_HEIGHT = 56

type DragStart = {
  x: number
  y: number
  posX: number
  posY: number
  rect: DOMRect
}

export default function PhotoWindow({
  onOpenPhoto,
}: {
  onOpenPhoto: (photo: PreviewPhoto) => void
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [closed, setClosed] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const dragStart = useRef<DragStart>({
    x: 0,
    y: 0,
    posX: 0,
    posY: 0,
    rect: new DOMRect(),
  })

  function handlePointerDown(e: ReactPointerEvent<HTMLElement>) {
    if (maximized || !sectionRef.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: pos.x,
      posY: pos.y,
      rect: sectionRef.current.getBoundingClientRect(),
    }
    setDragging(true)
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLElement>) {
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

  function handlePointerUp(e: ReactPointerEvent<HTMLElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId)
    setDragging(false)
  }

  if (closed) return null

  return (
    <section
      ref={sectionRef}
      aria-label='사진'
      className={`w-full overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-20px_rgba(28,27,41,0.55)] transition-[max-width] duration-300 ease-out ${
        maximized ? 'max-w-3xl' : 'max-w-xl'
      }`}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: dragging ? 'none' : 'transform 200ms ease-out',
        position: 'relative',
        zIndex: dragging ? 20 : 'auto',
      }}
    >
      <header
        className={`flex items-center gap-4 border-b border-black/5 px-4 py-3 select-none ${
          maximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
        }`}
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <TrafficLights
          onClose={() => setClosed(true)}
          onMinimize={() => setCollapsed((v) => !v)}
          onToggleMaximize={() => setMaximized((v) => !v)}
        />
        <p className='font-display text-sm font-semibold text-muted'>사진</p>
      </header>

      {!collapsed && (
        <div
          className={`grid gap-2 p-3 transition-[grid-template-columns] duration-300 ease-out ${
            maximized ? 'grid-cols-4' : 'grid-cols-3'
          }`}
        >
          {PHOTOS.map((photo) => (
            <figure
              key={photo.id}
              onClick={() => onOpenPhoto(photo)}
              className='group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-ink'
            >
              <img
                src={photo.src}
                alt={photo.caption}
                draggable={false}
                className={`h-full w-full transition-transform duration-300 group-hover:scale-110 ${
                  photo.fit === 'contain' ? 'object-contain' : 'object-cover'
                }`}
              />
              <figcaption className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pt-6 pb-1.5 text-[11px] font-medium text-white'>
                {photo.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  )
}
