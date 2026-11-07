import {
  FolderGit2,
  Info,
  PanelLeft,
  Plus,
  Search,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { PROFILE_GENERATIONS } from '../profileData'
import TrafficLights from './TrafficLights'

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' className={className} fill='currentColor'>
      <path d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' />
    </svg>
  )
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' className={className} fill='currentColor'>
      <path d='M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z' />
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
      </header>

      <div className='flex min-h-0 flex-1'>
        {sidebarOpen && (
          <nav className='flex w-40 shrink-0 flex-col overflow-y-auto border-r border-black/5 bg-black/[0.03] sm:w-52'>
            <div className='px-3 pt-3'>
              <div className='flex items-center gap-1.5 rounded-md bg-black/5 px-2 py-1.5 text-muted'>
                <Search className='h-3.5 w-3.5 shrink-0' strokeWidth={2} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='검색'
                  className='w-full bg-transparent text-xs text-ink placeholder:text-muted focus:outline-none'
                />
              </div>
            </div>
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
            <div className='mx-auto flex max-w-xl flex-col gap-6'>
              <div className='flex items-center gap-5'>
                <div
                  className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-full font-display text-4xl font-semibold text-white ${
                    AVATAR_COLORS[
                      allPeople.findIndex((p) => p.id === selected.id) %
                        AVATAR_COLORS.length
                    ]
                  }`}
                >
                  {selected.name.slice(0, 1)}
                </div>
                <div className='flex flex-col gap-3'>
                  <div>
                    <h2 className='font-display text-2xl font-bold text-ink'>
                      {selected.name}
                    </h2>
                    <p className='text-sm text-muted'>
                      ALOC {selected.generation}
                    </p>
                  </div>

                  <div className='flex items-center gap-3'>
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

                    {selected.discordUrl ? (
                      <a
                        href={selected.discordUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='flex h-10 w-10 items-center justify-center rounded-full bg-[#5865F2] text-white transition-transform hover:scale-105'
                        aria-label={`${selected.name} Discord`}
                      >
                        <DiscordIcon className='h-[18px] w-[18px]' />
                      </a>
                    ) : (
                      <span
                        className='flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full bg-black/10 text-muted'
                        aria-label='디스코드 미등록'
                      >
                        <DiscordIcon className='h-[18px] w-[18px]' />
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className='flex flex-col divide-y divide-black/5 border-t border-black/5'>
                <InfoRow icon={Info} label='소개'>
                  {selected.bio ?? '아직 소개가 없어요.'}
                </InfoRow>

                <InfoRow icon={FolderGit2} label='지난 프로젝트'>
                  {selected.projects && selected.projects.length > 0 ? (
                    <div className='flex flex-wrap gap-1.5'>
                      {selected.projects.map((project) => (
                        <span
                          key={project}
                          className='rounded-full bg-[#0A84FF]/10 px-2.5 py-1 text-xs font-medium text-[#0A84FF]'
                        >
                          {project}
                        </span>
                      ))}
                    </div>
                  ) : (
                    '참여한 프로젝트가 아직 없어요.'
                  )}
                </InfoRow>

                <InfoRow icon={Trophy} label='대회'>
                  {selected.competitions && selected.competitions.length > 0 ? (
                    <div className='flex flex-wrap gap-1.5'>
                      {selected.competitions.map((competition) => (
                        <span
                          key={competition}
                          className='rounded-full bg-[#BF5AF2]/10 px-2.5 py-1 text-xs font-medium text-[#BF5AF2]'
                        >
                          {competition}
                        </span>
                      ))}
                    </div>
                  ) : (
                    '참가한 대회가 아직 없어요.'
                  )}
                </InfoRow>
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

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: ReactNode
}) {
  return (
    <div className='flex items-start gap-3 py-3'>
      <Icon className='mt-0.5 h-4 w-4 shrink-0 text-muted' strokeWidth={1.75} />
      <div className='flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2'>
        <span className='text-sm font-medium text-muted'>{label}:</span>
        <span className='text-sm text-ink'>{children}</span>
      </div>
    </div>
  )
}
