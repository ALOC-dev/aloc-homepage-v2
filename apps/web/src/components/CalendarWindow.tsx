import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Plus,
  Search,
  Waves,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { ALL_ARCHIVE_PEOPLE } from '../archiveData'
import TrafficLights from './TrafficLights'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const ALOC_WEEKDAY = 4 // 목요일

type DayCell = {
  date: Date
  day: number
  currentMonth: boolean
}

function buildMonthGrid(year: number, month: number): DayCell[] {
  const firstDay = new Date(year, month, 1)
  const startWeekday = firstDay.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: DayCell[] = []

  for (let i = startWeekday; i > 0; i--) {
    const d = new Date(year, month, 1 - i)
    cells.push({ date: d, day: d.getDate(), currentMonth: false })
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), day, currentMonth: true })
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1].date
    const next = new Date(last)
    next.setDate(next.getDate() + 1)
    cells.push({ date: next, day: next.getDate(), currentMonth: false })
  }
  return cells
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const MY_CALENDARS: { label: string; color: string; active?: boolean }[] = [
  { label: 'Untitled', color: 'bg-[#0A84FF]' },
  { label: '캘린더', color: 'bg-[#34C759]' },
  { label: '집', color: 'bg-[#0A84FF]', active: true },
  { label: '알록', color: 'bg-[#BF5AF2]' },
]

const OTHER_CALENDARS: {
  label: string
  color: string
  subscribed?: boolean
}[] = [{ label: '대한민국 공휴일', color: 'bg-[#BF5AF2]', subscribed: true }]

export default function CalendarWindow({
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
  const today = useMemo(() => new Date(), [])
  const [cursor, setCursor] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  )
  const [birthdaysOpen, setBirthdaysOpen] = useState(true)

  const cells = useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth()),
    [cursor],
  )
  const rowCount = cells.length / 7

  function goPrev() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))
  }
  function goNext() {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))
  }
  function goToday() {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  return (
    <section
      aria-label='알록일정'
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

        <div className='flex items-center gap-1 text-muted'>
          <CalendarIcon
            className='h-[18px] w-[18px] rounded bg-black/5 p-0.5'
            strokeWidth={1.75}
          />
          <Inbox className='h-[18px] w-[18px]' strokeWidth={1.75} />
        </div>

        <div
          data-drag-handle
          className={`min-w-0 flex-1 touch-none py-1 select-none ${
            maximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
          }`}
        />

        <button
          type='button'
          className='rounded-md p-1 text-muted hover:bg-black/5'
          aria-label='일정 추가'
        >
          <Plus className='h-[18px] w-[18px]' strokeWidth={1.75} />
        </button>

        <div className='hidden items-center gap-0.5 rounded-md bg-black/5 p-0.5 text-[11px] font-medium text-muted sm:flex'>
          <span className='rounded px-2 py-1'>일</span>
          <span className='rounded px-2 py-1'>주</span>
          <span className='rounded bg-white px-2 py-1 text-ink shadow-sm'>
            월
          </span>
          <span className='rounded px-2 py-1'>년</span>
        </div>

        <Search className='h-4 w-4 shrink-0 text-muted' strokeWidth={1.75} />
      </header>

      <div className='flex min-h-0 flex-1'>
        <nav className='flex w-44 shrink-0 flex-col gap-4 overflow-y-auto border-r border-black/5 bg-black/[0.03] px-3 pt-3 pb-3 sm:w-52'>
          <div>
            <p className='px-2 text-[11px] font-medium text-muted'>iCloud</p>
            <ul className='mt-1 flex flex-col gap-0.5'>
              {MY_CALENDARS.map((cal) => (
                <li key={cal.label}>
                  <span
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[13px] ${
                      cal.active
                        ? 'bg-black/[0.06] text-ink'
                        : 'text-ink hover:bg-black/5'
                    }`}
                  >
                    <span
                      className={`h-3 w-3 shrink-0 rounded-[3px] ${cal.color}`}
                    />
                    <span
                      className={cal.active ? 'font-medium text-[#0A84FF]' : ''}
                    >
                      {cal.label}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className='px-2 text-[11px] font-medium text-muted'>기타</p>
            <ul className='mt-1 flex flex-col gap-0.5'>
              <li>
                <span className='flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[13px] text-ink hover:bg-black/5'>
                  <span className='h-3 w-3 shrink-0 rounded-[3px] bg-[#0A84FF]' />
                  <span className='min-w-0 flex-1 truncate'>
                    예정된 미리 알림
                  </span>
                </span>
              </li>

              <li>
                <button
                  type='button'
                  onClick={() => setBirthdaysOpen((v) => !v)}
                  className='flex w-full items-center gap-1 rounded-md px-2 py-1 text-left text-[13px] text-ink hover:bg-black/5'
                >
                  <ChevronDown
                    className={`h-3 w-3 shrink-0 text-muted transition-transform ${birthdaysOpen ? '' : '-rotate-90'}`}
                    strokeWidth={2.5}
                  />
                  <span className='h-3 w-3 shrink-0 rounded-[3px] bg-[#0A84FF]' />
                  <span className='min-w-0 flex-1 truncate'>생일</span>
                </button>
                {birthdaysOpen && (
                  <ul className='mt-0.5 flex flex-col gap-0.5 pl-5'>
                    {ALL_ARCHIVE_PEOPLE.map((person) => (
                      <li key={person.id}>
                        <span className='flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[13px] text-ink hover:bg-black/5'>
                          <span className='h-2.5 w-2.5 shrink-0 rounded-[3px] bg-[#0A84FF]/60' />
                          <span className='min-w-0 flex-1 truncate'>
                            {person.label}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              {OTHER_CALENDARS.map((cal) => (
                <li key={cal.label}>
                  <span className='flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[13px] text-ink hover:bg-black/5'>
                    <span
                      className={`h-3 w-3 shrink-0 rounded-[3px] ${cal.color}`}
                    />
                    <span className='min-w-0 flex-1 truncate'>{cal.label}</span>
                    {cal.subscribed && (
                      <Waves className='h-3 w-3 shrink-0 text-muted' />
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className='mt-auto'>
            <div className='mb-1 flex items-center justify-between px-1'>
              <button
                type='button'
                onClick={goPrev}
                className='rounded p-0.5 text-muted hover:bg-black/5'
                aria-label='이전 달 (미니)'
              >
                <ChevronLeft className='h-3.5 w-3.5' strokeWidth={2} />
              </button>
              <p className='text-[11px] font-semibold text-ink'>
                {cursor.getFullYear()}년 {cursor.getMonth() + 1}월
              </p>
              <button
                type='button'
                onClick={goNext}
                className='rounded p-0.5 text-muted hover:bg-black/5'
                aria-label='다음 달 (미니)'
              >
                <ChevronRight className='h-3.5 w-3.5' strokeWidth={2} />
              </button>
            </div>
            <div className='grid grid-cols-7 gap-y-0.5 text-center text-[9px]'>
              {WEEKDAYS.map((w) => (
                <span key={w} className='text-muted'>
                  {w}
                </span>
              ))}
              {cells.map((cell) => {
                const isToday = isSameDay(cell.date, today)
                return (
                  <span
                    key={cell.date.toISOString()}
                    className={`flex h-4 items-center justify-center rounded-full ${
                      isToday
                        ? 'bg-[#ff5f57] font-semibold text-white'
                        : cell.currentMonth
                          ? 'text-ink'
                          : 'text-muted/50'
                    }`}
                  >
                    {cell.day}
                  </span>
                )
              })}
            </div>
          </div>
        </nav>

        <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
          <div className='flex items-center justify-between px-5 pt-4 pb-2'>
            <h1 className='font-display text-2xl font-bold text-ink'>
              {cursor.getFullYear()}년 {cursor.getMonth() + 1}월
            </h1>
            <div className='flex items-center gap-1'>
              <button
                type='button'
                onClick={goPrev}
                className='rounded-md p-1 text-muted hover:bg-black/5'
                aria-label='이전 달'
              >
                <ChevronLeft className='h-4 w-4' strokeWidth={2} />
              </button>
              <button
                type='button'
                onClick={goToday}
                className='rounded-md bg-black/5 px-3 py-1 text-xs font-medium text-ink hover:bg-black/10'
              >
                오늘
              </button>
              <button
                type='button'
                onClick={goNext}
                className='rounded-md p-1 text-muted hover:bg-black/5'
                aria-label='다음 달'
              >
                <ChevronRight className='h-4 w-4' strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className='grid grid-cols-7 border-t border-l border-black/5 px-5'>
            {WEEKDAYS.map((w) => (
              <div
                key={w}
                className='border-r border-black/5 py-1.5 text-center text-xs font-medium text-muted'
              >
                {w}
              </div>
            ))}
          </div>

          <div
            className='grid min-h-0 flex-1 grid-cols-7 border-t border-l border-black/5 px-5 pb-5'
            style={{ gridTemplateRows: `repeat(${rowCount}, 1fr)` }}
          >
            {cells.map((cell) => {
              const isToday = isSameDay(cell.date, today)
              const hasAloc = cell.date.getDay() === ALOC_WEEKDAY
              return (
                <div
                  key={cell.date.toISOString()}
                  className='flex flex-col gap-1 border-r border-b border-black/5 p-1.5'
                >
                  <div className='flex justify-end'>
                    <span
                      className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs ${
                        isToday
                          ? 'bg-[#ff5f57] font-semibold text-white'
                          : cell.currentMonth
                            ? 'text-ink'
                            : 'text-muted/50'
                      }`}
                    >
                      {cell.day === 1
                        ? `${cell.date.getMonth() + 1}월 1일`
                        : cell.day}
                    </span>
                  </div>
                  {hasAloc && (
                    <div className='flex items-center gap-1 rounded bg-[#BF5AF2]/15 px-1 py-0.5'>
                      <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-[#BF5AF2]' />
                      <span className='truncate text-[10px] font-medium text-[#BF5AF2]'>
                        19:00 알록
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
