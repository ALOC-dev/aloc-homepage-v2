import { type PointerEvent as ReactPointerEvent, useRef, useState } from 'react'

type Photo = {
  id: string
  caption: string
  gradient: string
}

const PHOTOS: Photo[] = [
  {
    id: 'demo-day',
    caption: '6기 데모데이',
    gradient: 'linear-gradient(135deg, #aa3bff, #352a63)',
  },
  {
    id: 'study',
    caption: '알고리즘 스터디',
    gradient: 'linear-gradient(135deg, #ffb199, #e11d48)',
  },
  {
    id: 'mt',
    caption: '여름 MT',
    gradient: 'linear-gradient(135deg, #38bdf8, #0891b2)',
  },
  {
    id: 'onboarding',
    caption: '6기 OT',
    gradient: 'linear-gradient(135deg, #fbbf24, #d97706)',
  },
  {
    id: 'knowledge-share',
    caption: '지식공유회',
    gradient: 'linear-gradient(135deg, #2dd4bf, #0ea5e9)',
  },
  {
    id: 'hackathon',
    caption: '해커톤',
    gradient: 'linear-gradient(135deg, #c084fc, #7c3aed)',
  },
]

export default function PhotoWindow() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 })

  function handlePointerDown(e: ReactPointerEvent<HTMLElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      posX: pos.x,
      posY: pos.y,
    }
    setDragging(true)
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLElement>) {
    if (!dragging) return
    setPos({
      x: dragStart.current.posX + (e.clientX - dragStart.current.x),
      y: dragStart.current.posY + (e.clientY - dragStart.current.y),
    })
  }

  function handlePointerUp(e: ReactPointerEvent<HTMLElement>) {
    e.currentTarget.releasePointerCapture(e.pointerId)
    setDragging(false)
  }

  return (
    <section
      aria-label='사진'
      className='w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-20px_rgba(28,27,41,0.55)]'
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: dragging ? 'none' : 'transform 200ms ease-out',
        position: 'relative',
        zIndex: dragging ? 20 : 'auto',
      }}
    >
      <header
        className='flex cursor-grab items-center gap-4 border-b border-black/5 px-4 py-3 select-none active:cursor-grabbing'
        style={{ touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className='flex gap-2'>
          <span className='h-3 w-3 rounded-full bg-[#ff5f57]' />
          <span className='h-3 w-3 rounded-full bg-[#febc2e]' />
          <span className='h-3 w-3 rounded-full bg-[#28c840]' />
        </div>
        <p className='font-display text-sm font-semibold text-muted'>사진</p>
      </header>

      <div className='grid grid-cols-3 gap-2 p-3'>
        {PHOTOS.map((photo) => (
          <figure
            key={photo.id}
            className='group relative aspect-square overflow-hidden rounded-lg'
          >
            <div
              className='h-full w-full transition-transform duration-300 group-hover:scale-110'
              style={{ background: photo.gradient }}
            />
            <figcaption className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pt-6 pb-1.5 text-[11px] font-medium text-white'>
              {photo.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
