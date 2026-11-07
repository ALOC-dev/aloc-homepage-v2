import { ChevronLeft, Heart } from 'lucide-react'
import { type PointerEvent as ReactPointerEvent, useRef, useState } from 'react'
import dinner1 from '../assets/photos/dinner-1.jpg'
import dinner2 from '../assets/photos/dinner-2.jpg'
import dinnerClose from '../assets/photos/dinner-close.jpg'
import dinnerWide from '../assets/photos/dinner-wide.jpg'
import graduationBanner from '../assets/photos/graduation-banner.jpg'
import otGroup from '../assets/photos/ot-group.jpg'
import TrafficLights from './TrafficLights'

type Photo = {
  id: string
  caption: string
  src: string
  fit?: 'cover' | 'contain'
}

const PHOTOS: Photo[] = [
  { id: 'ot-group', caption: '5기 OT', src: otGroup },
  { id: 'dinner-1', caption: '뒤풀이', src: dinner1 },
  { id: 'dinner-2', caption: '저녁 모임', src: dinner2 },
  {
    id: 'graduation',
    caption: '졸업 축하',
    src: graduationBanner,
    fit: 'contain',
  },
  { id: 'dinner-wide', caption: '정기 모임', src: dinnerWide },
  { id: 'dinner-close', caption: '다같이 한 끼', src: dinnerClose },
]

const MENU_BAR_HEIGHT = 56

type DragStart = {
  x: number
  y: number
  posX: number
  posY: number
  rect: DOMRect
}

export default function PhotoWindow() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [closed, setClosed] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)
  const selectedPhoto = PHOTOS.find((p) => p.id === selectedPhotoId)
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

      {!collapsed &&
        (selectedPhoto ? (
          <div className='flex flex-col'>
            <div className='flex items-center gap-2 border-b border-black/5 px-3 py-1.5'>
              <button
                type='button'
                onClick={() => setSelectedPhotoId(null)}
                className='rounded-md p-0.5 text-muted hover:bg-black/5'
                aria-label='뒤로'
              >
                <ChevronLeft className='h-4 w-4' strokeWidth={2} />
              </button>
              <div className='min-w-0 flex-1 text-center'>
                <p className='truncate text-xs font-semibold text-ink'>
                  {selectedPhoto.caption}
                </p>
                <p className='truncate text-[10px] text-muted'>
                  {PHOTOS.findIndex((p) => p.id === selectedPhoto.id) + 1}/
                  {PHOTOS.length}
                </p>
              </div>
              <Heart className='h-3.5 w-3.5 text-muted' strokeWidth={1.75} />
              <button
                type='button'
                className='rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium text-ink hover:bg-black/10'
              >
                편집
              </button>
            </div>
            <div
              className={`flex items-center justify-center overflow-hidden bg-black/5 p-3 transition-[height] duration-300 ease-out ${
                maximized ? 'h-80' : 'h-56'
              }`}
            >
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.caption}
                draggable={false}
                className='max-h-full max-w-full rounded-lg object-contain'
              />
            </div>
          </div>
        ) : (
          <div
            className={`grid gap-2 p-3 transition-[grid-template-columns] duration-300 ease-out ${
              maximized ? 'grid-cols-4' : 'grid-cols-3'
            }`}
          >
            {PHOTOS.map((photo) => (
              <figure
                key={photo.id}
                onClick={() => setSelectedPhotoId(photo.id)}
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
        ))}
    </section>
  )
}
