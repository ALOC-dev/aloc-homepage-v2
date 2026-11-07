import {
  ChevronLeft,
  Clock,
  Crop,
  Heart,
  History,
  Image as ImageIcon,
  Images,
  Info,
  Minus,
  PanelLeft,
  Plus,
  Search,
  Share,
  Sparkles,
  Wand2,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
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

const PINNED_ITEMS: { icon: LucideIcon; label: string }[] = [
  { icon: Heart, label: '즐겨찾기' },
  { icon: Clock, label: '최근 저장된 항목' },
  { icon: History, label: '이전 알록사진' },
  { icon: Sparkles, label: '현재 알록 사진' },
]

export default function PhotosAppWindow({
  onClose,
  onMinimize,
  onToggleMaximize,
  maximized,
}: {
  onClose: () => void
  onMinimize: () => void
  onToggleMaximize: () => void
  maximized: boolean
}) {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 640,
  )
  const [view, setView] = useState<'year' | 'month' | 'all'>('all')
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)
  const selectedPhoto = PHOTOS.find((p) => p.id === selectedPhotoId)

  return (
    <section
      aria-label='사진'
      className={`flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-24px_rgba(28,27,41,0.6)] transition-[height,max-width] duration-300 ease-out ${
        maximized
          ? 'h-[min(900px,90vh)] max-w-[1400px]'
          : 'h-[min(600px,80vh)] max-w-4xl'
      }`}
    >
      <header className='flex items-center gap-3 border-b border-black/5 px-4 py-2.5'>
        <TrafficLights
          onClose={onClose}
          onMinimize={onMinimize}
          onToggleMaximize={onToggleMaximize}
        />

        <button
          type='button'
          onClick={() => setSidebarOpen((v) => !v)}
          className='rounded-md p-1 text-muted hover:bg-black/5'
          aria-label='사이드바 토글'
        >
          <PanelLeft className='h-[18px] w-[18px]' strokeWidth={1.75} />
        </button>

        <div
          data-drag-handle
          className={`min-w-0 flex-1 touch-none py-1 select-none ${
            maximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
          }`}
        >
          <p className='truncate font-display text-sm font-semibold text-ink'>
            보관함
          </p>
          <p className='truncate text-[11px] text-muted'>
            ALOC와 함께한 순간들
          </p>
        </div>

        <div className='hidden items-center gap-0.5 rounded-md bg-black/5 p-0.5 text-[11px] font-medium text-muted sm:flex'>
          <button
            type='button'
            onClick={() => setView('year')}
            className={`rounded px-2 py-1 transition-colors ${view === 'year' ? 'bg-white text-ink shadow-sm' : 'hover:text-ink'}`}
          >
            년
          </button>
          <button
            type='button'
            onClick={() => setView('month')}
            className={`rounded px-2 py-1 transition-colors ${view === 'month' ? 'bg-white text-ink shadow-sm' : 'hover:text-ink'}`}
          >
            월
          </button>
          <button
            type='button'
            onClick={() => setView('all')}
            className={`rounded px-2 py-1 transition-colors ${view === 'all' ? 'bg-white text-ink shadow-sm' : 'hover:text-ink'}`}
          >
            모든 사진
          </button>
        </div>

        <div className='hidden items-center gap-2.5 text-muted md:flex'>
          <Info className='h-4 w-4' strokeWidth={1.75} />
          <Share className='h-4 w-4' strokeWidth={1.75} />
          <Heart className='h-4 w-4' strokeWidth={1.75} />
        </div>

        <div className='flex items-center gap-1.5 rounded-md bg-black/5 px-2 py-1 text-muted'>
          <Search className='h-3.5 w-3.5' strokeWidth={2} />
          <input
            placeholder='검색'
            className='w-20 bg-transparent text-xs text-ink placeholder:text-muted focus:outline-none'
          />
        </div>
      </header>

      <div className='flex min-h-0 flex-1'>
        {sidebarOpen && (
          <nav className='flex w-44 shrink-0 flex-col gap-4 overflow-y-auto border-r border-black/5 bg-black/[0.03] px-3 pt-3 pb-4 sm:w-52'>
            <div>
              <ul className='flex flex-col gap-0.5'>
                <li>
                  <span className='flex w-full items-center gap-2 rounded-md bg-[#0A84FF] px-2 py-1.5 text-left text-[13px] text-white'>
                    <Images className='h-[15px] w-[15px]' strokeWidth={2} />
                    보관함
                  </span>
                </li>
                <li>
                  <span className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-ink hover:bg-black/5'>
                    <ImageIcon className='h-[15px] w-[15px]' strokeWidth={2} />
                    모음
                  </span>
                </li>
              </ul>
            </div>

            <SidebarGroup label='고정됨' items={PINNED_ITEMS} />
          </nav>
        )}

        <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
          {selectedPhoto ? (
            <div className='flex min-h-0 flex-1 flex-col'>
              <div className='flex items-center gap-3 border-b border-black/5 px-4 py-2'>
                <button
                  type='button'
                  onClick={() => setSelectedPhotoId(null)}
                  className='rounded-md p-1 text-muted hover:bg-black/5'
                  aria-label='뒤로'
                >
                  <ChevronLeft className='h-5 w-5' strokeWidth={2} />
                </button>

                <div className='hidden items-center gap-1.5 text-muted sm:flex'>
                  <Minus className='h-3.5 w-3.5' strokeWidth={2} />
                  <input
                    type='range'
                    defaultValue={50}
                    readOnly
                    className='h-1 w-20 accent-[#0A84FF]'
                  />
                  <Plus className='h-3.5 w-3.5' strokeWidth={2} />
                </div>

                <div className='min-w-0 flex-1 text-center'>
                  <p className='truncate text-sm font-semibold text-ink'>
                    {selectedPhoto.caption}
                  </p>
                  <p className='truncate text-[11px] text-muted'>
                    {PHOTOS.findIndex((p) => p.id === selectedPhoto.id) + 1}/
                    {PHOTOS.length}
                  </p>
                </div>

                <div className='hidden items-center gap-3 text-muted md:flex'>
                  <Info className='h-4 w-4' strokeWidth={1.75} />
                  <Share className='h-4 w-4' strokeWidth={1.75} />
                  <Heart className='h-4 w-4' strokeWidth={1.75} />
                  <Crop className='h-4 w-4' strokeWidth={1.75} />
                  <Wand2 className='h-4 w-4' strokeWidth={1.75} />
                </div>

                <button
                  type='button'
                  className='rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-ink hover:bg-black/10'
                >
                  편집
                </button>
              </div>

              <div className='flex min-h-0 flex-1 items-center justify-center bg-black/[0.03] p-5'>
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.caption}
                  draggable={false}
                  className='max-h-full max-w-full rounded-lg object-contain shadow-[0_20px_40px_-12px_rgba(28,27,41,0.4)]'
                />
              </div>
            </div>
          ) : (
            <div className='p-5'>
              <p className='mb-3 text-sm font-semibold text-ink'>모든 사진</p>
              <div className='grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2'>
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
                        photo.fit === 'contain'
                          ? 'object-contain'
                          : 'object-cover'
                      }`}
                    />
                    <figcaption className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 pt-6 pb-1.5 text-[11px] font-medium text-white'>
                      {photo.caption}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function SidebarGroup({
  label,
  items,
}: {
  label: string
  items: { icon: LucideIcon; label: string }[]
}) {
  return (
    <div>
      <p className='px-2 text-[11px] font-medium text-muted'>{label}</p>
      <ul className='mt-1 flex flex-col gap-0.5'>
        {items.map((item) => (
          <li key={item.label}>
            <span className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-ink hover:bg-black/5'>
              <item.icon
                className='h-[15px] w-[15px] text-muted'
                strokeWidth={2}
              />
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
