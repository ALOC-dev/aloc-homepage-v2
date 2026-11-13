import {
  ChevronLeft,
  Columns3,
  GalleryHorizontalEnd,
  LayoutGrid,
  List,
  PanelLeft,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import folderIcon from '../assets/dock-icons/folder.png'
import giutInterimThumb from '../assets/presentation-thumbs/giut-interim.png'
import { CURRENT_PROJECTS, PAST_GENERATIONS } from '../finderData'
import TrafficLights from './TrafficLights'

const OVERVIEW_ID = 'current-overview'

const PRESENTATION_ASSETS: Record<string, { thumbnail: string; href: string }> =
  {
    'giut-interim': {
      thumbnail: giutInterimThumb,
      href: '/presentations/giut-interim.pdf',
    },
  }

function FileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 64 64' className={className}>
      <path
        d='M14 4h26l10 10v46a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z'
        fill='#fff'
        stroke='#d8d8dc'
        strokeWidth='1.5'
      />
      <path
        d='M40 4v8a2 2 0 0 0 2 2h8z'
        fill='#ececef'
        stroke='#d8d8dc'
        strokeWidth='1.5'
      />
    </svg>
  )
}

export default function FinderWindow({
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
  const [selected, setSelected] = useState<string>(OVERVIEW_ID)
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 640,
  )
  const [query, setQuery] = useState('')

  function handleSelectCategory(id: string) {
    setSelected(id)
    setSelectedEntryId(null)
  }

  const selectedSource = useMemo<SidebarSelection>(() => {
    if (selected === OVERVIEW_ID) {
      return {
        title: '현재 진행 중인 프로젝트',
        kind: 'folders',
        entries: CURRENT_PROJECTS.map((p) => ({ id: p.id, label: p.label })),
      }
    }
    const current = CURRENT_PROJECTS.find((p) => p.id === selected)
    if (current) {
      return {
        title: current.label,
        kind: 'files',
        entries: [
          { id: `${current.id}-interim`, label: `${current.label}_중간발표` },
          { id: `${current.id}-final`, label: `${current.label}_최종발표` },
        ],
      }
    }
    const past = PAST_GENERATIONS.find((p) => p.id === selected)
    if (past) {
      return {
        title: past.label,
        kind: 'folders',
        entries: past.folders,
        empty: past.folders.length === 0,
      }
    }
    return { title: '', kind: 'folders', entries: [] }
  }, [selected])

  const visibleEntries = selectedSource.entries.filter((f) =>
    f.label.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <section
      aria-label='프로젝트'
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

        {selected !== OVERVIEW_ID && (
          <button
            type='button'
            onClick={() => handleSelectCategory(OVERVIEW_ID)}
            className='rounded-md p-1 text-muted hover:bg-black/5'
            aria-label='뒤로'
          >
            <ChevronLeft className='h-[18px] w-[18px]' strokeWidth={1.75} />
          </button>
        )}

        <div
          data-drag-handle
          className={`min-w-0 flex-1 touch-none py-1 select-none ${
            maximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
          }`}
        >
          <p className='truncate font-display text-sm font-semibold text-ink'>
            {selectedSource.title || '프로젝트'}
          </p>
          <p className='truncate text-[11px] text-muted'>
            ALOC 프로젝트 아카이브
          </p>
        </div>

        <div className='flex items-center gap-0.5 rounded-md bg-black/5 p-0.5 text-muted'>
          <List className='h-[15px] w-[15px] p-0.5' strokeWidth={2} />
          <LayoutGrid
            className='h-[15px] w-[15px] rounded bg-white p-0.5 text-ink shadow-sm'
            strokeWidth={2}
          />
          <Columns3 className='h-[15px] w-[15px] p-0.5' strokeWidth={2} />
          <GalleryHorizontalEnd
            className='h-[15px] w-[15px] p-0.5'
            strokeWidth={2}
          />
        </div>

        <div className='flex items-center gap-1.5 rounded-md bg-black/5 px-2 py-1 text-muted'>
          <Search className='h-3.5 w-3.5' strokeWidth={2} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='검색'
            className='w-20 bg-transparent text-xs text-ink placeholder:text-muted focus:outline-none'
          />
        </div>
      </header>

      <div className='flex min-h-0 flex-1'>
        {sidebarOpen && (
          <nav className='flex w-36 shrink-0 flex-col gap-4 overflow-y-auto border-r border-black/5 bg-black/[0.03] px-3 pt-3 pb-4 sm:w-48'>
            <SidebarGroup
              label='지난 프로젝트'
              items={PAST_GENERATIONS}
              selected={selected}
              onSelect={handleSelectCategory}
            />
            <SidebarGroup
              label='현재 진행 중인 프로젝트'
              items={CURRENT_PROJECTS}
              selected={selected}
              onSelect={handleSelectCategory}
              overviewId={OVERVIEW_ID}
            />
          </nav>
        )}

        <div
          className='flex-1 overflow-y-auto p-5'
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEntryId(null)
          }}
        >
          {selectedSource.empty ? (
            <p className='text-sm text-muted'>
              아직 기록이 없어요. 곧 채워질 예정이에요.
            </p>
          ) : (
            <div className='grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-x-2 gap-y-5'>
              {visibleEntries.map((entry) => {
                const isFolderOpenable =
                  selected === OVERVIEW_ID && selectedSource.kind === 'folders'
                const presentation =
                  selectedSource.kind === 'files'
                    ? PRESENTATION_ASSETS[entry.id]
                    : undefined
                const isOpenable = isFolderOpenable || Boolean(presentation)
                const isSelected = selectedEntryId === entry.id

                function handleOpen() {
                  if (isFolderOpenable) {
                    handleSelectCategory(entry.id)
                  } else if (presentation) {
                    const link = document.createElement('a')
                    link.href = presentation.href
                    link.target = '_blank'
                    link.rel = 'noopener'
                    link.click()
                  }
                }

                return (
                  <div
                    key={entry.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedEntryId(entry.id)
                    }}
                    onDoubleClick={isOpenable ? handleOpen : undefined}
                    className={`flex flex-col items-center gap-1.5 rounded-lg px-2 py-2 text-center ${isOpenable ? 'cursor-pointer' : ''}`}
                  >
                    {presentation ? (
                      <img
                        src={presentation.thumbnail}
                        alt=''
                        className='h-14 w-20 rounded-sm border border-black/10 object-cover shadow-sm'
                        draggable={false}
                      />
                    ) : selectedSource.kind === 'files' ? (
                      <FileIcon className='h-14 w-14 drop-shadow-sm' />
                    ) : (
                      <img
                        src={folderIcon}
                        alt=''
                        className='h-14 w-14 object-contain'
                        draggable={false}
                      />
                    )}
                    <p
                      className={`line-clamp-2 rounded px-1.5 py-0.5 text-xs ${
                        isSelected ? 'bg-[#0A84FF] text-white' : 'text-ink'
                      }`}
                    >
                      {entry.label}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

type SidebarSelection = {
  title: string
  kind: 'folders' | 'files'
  entries: { id: string; label: string }[]
  empty?: boolean
}

function SidebarGroup({
  label,
  items,
  selected,
  onSelect,
  overviewId,
}: {
  label: string
  items: { id: string; label: string }[]
  selected: string
  onSelect: (id: string) => void
  overviewId?: string
}) {
  return (
    <div>
      <p className='px-2 text-[11px] font-medium text-muted'>{label}</p>
      <ul className='mt-1 flex flex-col gap-0.5'>
        {overviewId && (
          <SidebarRow
            label='전체'
            active={selected === overviewId}
            onClick={() => onSelect(overviewId)}
          />
        )}
        {items.map((item) => (
          <SidebarRow
            key={item.id}
            label={item.label}
            active={selected === item.id}
            onClick={() => onSelect(item.id)}
          />
        ))}
      </ul>
    </div>
  )
}

function SidebarRow({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <li>
      <button
        type='button'
        onClick={onClick}
        className={`w-full rounded-md px-2 py-1 text-left text-[13px] transition-colors ${
          active ? 'bg-[#0A84FF] text-white' : 'text-ink hover:bg-black/5'
        }`}
      >
        {label}
      </button>
    </li>
  )
}
