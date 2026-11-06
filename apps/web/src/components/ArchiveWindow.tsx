import {
  Columns3,
  GalleryHorizontalEnd,
  LayoutGrid,
  List,
  PanelLeft,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { ALL_ARCHIVE_PEOPLE } from '../archiveData'

export default function ArchiveWindow({
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
  const [selected, setSelected] = useState<string>(
    ALL_ARCHIVE_PEOPLE[0]?.id ?? '',
  )
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 640,
  )
  const [query, setQuery] = useState('')

  const selectedTitle = useMemo(() => {
    const person = ALL_ARCHIVE_PEOPLE.find((p) => p.id === selected)
    return person?.label ?? ''
  }, [selected])

  const filteredPeople = ALL_ARCHIVE_PEOPLE.filter((p) =>
    p.label.toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <section
      aria-label='아카이브'
      className={`flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-24px_rgba(28,27,41,0.6)] transition-[height,max-width] duration-300 ease-out ${
        maximized
          ? 'h-[min(900px,90vh)] max-w-[1400px]'
          : 'h-[min(600px,80vh)] max-w-4xl'
      }`}
    >
      <header className='flex items-center gap-3 border-b border-black/5 px-4 py-2.5'>
        <div className='flex gap-2'>
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
          <button
            type='button'
            onClick={onToggleMaximize}
            aria-label='확장'
            className='h-3 w-3 rounded-full bg-[#28c840] transition-opacity hover:opacity-80'
          />
        </div>

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
          className='min-w-0 flex-1 cursor-grab touch-none py-1 select-none active:cursor-grabbing'
        >
          <p className='truncate font-display text-sm font-semibold text-ink'>
            {selectedTitle || '아카이브'}
          </p>
          <p className='truncate text-[11px] text-muted'>ALOC 멤버 아카이브</p>
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
              items={filteredPeople}
              selected={selected}
              onSelect={setSelected}
            />
          </nav>
        )}

        <div className='flex-1 overflow-y-auto p-5'>
          <p className='text-sm text-muted'>
            아직 기록이 없어요. 자료를 보내주시면 채울게요.
          </p>
        </div>
      </div>
    </section>
  )
}

function SidebarGroup({
  label,
  items,
  selected,
  onSelect,
}: {
  label: string
  items: { id: string; label: string }[]
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <p className='px-2 text-[11px] font-medium text-muted'>{label}</p>
      <ul className='mt-1 flex flex-col gap-0.5'>
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
