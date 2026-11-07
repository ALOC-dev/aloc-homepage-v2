import { PanelLeft, Plus, Search } from 'lucide-react'
import { useState } from 'react'
import { PROFILE_GENERATIONS } from '../profileData'
import TrafficLights from './TrafficLights'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' className={className} fill='currentColor'>
      <path d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' />
    </svg>
  )
}

const AVATAR_COLORS = [
  'bg-[#0A84FF]',
  'bg-[#34C759]',
  'bg-[#BF5AF2]',
  'bg-[#FF9F0A]',
  'bg-[#FF375F]',
]

export default function ProfileWindow({
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
  const allPeople = PROFILE_GENERATIONS.flatMap((gen) => gen.people)
  const [selectedId, setSelectedId] = useState<string | null>(
    () => allPeople[0]?.id ?? null,
  )
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 640,
  )
  const [query, setQuery] = useState('')

  const selected = allPeople.find((p) => p.id === selectedId)

  const filteredGenerations = PROFILE_GENERATIONS.map((gen) => ({
    ...gen,
    people: gen.people.filter((p) =>
      p.name.toLowerCase().includes(query.trim().toLowerCase()),
    ),
  })).filter((gen) => gen.people.length > 0)

  return (
    <section
      aria-label='개인 프로필'
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
            개인 프로필
          </p>
          <p className='truncate text-[11px] text-muted'>ALOC 멤버 연락처</p>
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
          <nav className='flex w-40 shrink-0 flex-col overflow-y-auto border-r border-black/5 bg-black/[0.03] sm:w-52'>
            <div className='flex-1 px-3 pt-3'>
              {filteredGenerations.length === 0 ? (
                <p className='px-2 text-[13px] text-muted'>
                  검색 결과가 없어요.
                </p>
              ) : (
                <div className='flex flex-col gap-4'>
                  {filteredGenerations.map((gen) => (
                    <div key={gen.id}>
                      <div className='flex items-center justify-between px-2'>
                        <p className='text-[11px] font-medium text-muted'>
                          {gen.label}
                        </p>
                        <span className='text-[11px] text-muted'>
                          {gen.people.length}
                        </span>
                      </div>
                      <ul className='mt-1 flex flex-col gap-0.5'>
                        {gen.people.map((person) => {
                          const isSelected = selectedId === person.id
                          return (
                            <li key={person.id}>
                              <button
                                type='button'
                                onClick={() => setSelectedId(person.id)}
                                className={`flex w-full items-center gap-2 rounded-md px-2 py-1 text-left text-[13px] transition-colors ${
                                  isSelected
                                    ? 'bg-[#0A84FF] text-white'
                                    : 'text-ink hover:bg-black/5'
                                }`}
                              >
                                <span
                                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-semibold text-white ${
                                    AVATAR_COLORS[
                                      allPeople.findIndex(
                                        (p) => p.id === person.id,
                                      ) % AVATAR_COLORS.length
                                    ]
                                  } ${isSelected ? 'ring-2 ring-white/70' : ''}`}
                                >
                                  {person.name.slice(0, 1)}
                                </span>
                                <span className='truncate'>{person.name}</span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type='button'
              className='flex items-center gap-1.5 border-t border-black/5 px-4 py-2 text-xs text-muted hover:bg-black/5'
              aria-label='멤버 추가'
            >
              <Plus className='h-3.5 w-3.5' strokeWidth={2} />
              멤버 추가
            </button>
          </nav>
        )}

        <div className='flex-1 overflow-y-auto p-8'>
          {selected ? (
            <div className='mx-auto flex max-w-md flex-col gap-5'>
              <div className='flex items-center gap-4'>
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-2xl font-semibold text-white ${
                    AVATAR_COLORS[
                      allPeople.findIndex((p) => p.id === selected.id) %
                        AVATAR_COLORS.length
                    ]
                  }`}
                >
                  {selected.name.slice(0, 1)}
                </div>
                <div>
                  <h2 className='font-display text-xl font-bold text-ink'>
                    {selected.name}
                  </h2>
                  <p className='text-sm text-muted'>
                    ALOC {selected.generation}
                  </p>
                </div>
              </div>

              {selected.githubUrl ? (
                <a
                  href={selected.githubUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white transition-transform hover:scale-105'
                  aria-label={`${selected.name} GitHub`}
                >
                  <GithubIcon className='h-[18px] w-[18px]' />
                </a>
              ) : (
                <span
                  className='flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full bg-black/10 text-muted'
                  aria-label='깃허브 미등록'
                >
                  <GithubIcon className='h-[18px] w-[18px]' />
                </span>
              )}

              <div className='rounded-xl border border-black/5 bg-black/[0.02] p-4'>
                <p className='mb-1 text-xs font-medium text-muted'>소개</p>
                <p className='text-sm leading-relaxed text-ink'>
                  {selected.bio ?? '아직 소개가 없어요.'}
                </p>
              </div>
            </div>
          ) : (
            <p className='pt-20 text-center text-sm text-muted'>
              표시할 멤버가 없어요.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
