import { KNOWLEDGE_GENERATIONS } from '../knowledgeData'
import TrafficLights from './TrafficLights'

function SlideThumbnail({ title }: { title: string }) {
  return (
    <div className='flex aspect-[4/3] flex-col overflow-hidden rounded-md border border-black/10 bg-white p-3 shadow-sm'>
      <div className='h-1 w-10 rounded-full bg-black/10' />
      <div className='flex flex-1 flex-col items-center justify-center gap-1.5 px-2 text-center'>
        <p className='line-clamp-2 text-[10px] font-semibold text-ink'>
          {title}
        </p>
        <div className='h-0.5 w-10 rounded-full bg-black/10' />
      </div>
    </div>
  )
}

export default function KnowledgeWindow({
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
  const nonEmptyGenerations = KNOWLEDGE_GENERATIONS.filter(
    (gen) => gen.talks.length > 0,
  ).toReversed()

  return (
    <section
      aria-label='지식공유회'
      className={`flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-24px_rgba(28,27,41,0.6)] transition-[height,max-width] duration-300 ease-out ${
        maximized
          ? 'h-[min(900px,90vh)] max-w-[1400px]'
          : 'h-[min(600px,80vh)] max-w-4xl'
      }`}
    >
      <header className='relative border-b border-black/5 py-4'>
        <div className='absolute top-1/2 left-5 -translate-y-1/2'>
          <TrafficLights
            onClose={onClose}
            onMinimize={onMinimize}
            onToggleMaximize={onToggleMaximize}
          />
        </div>
        <div
          data-drag-handle
          className={`flex touch-none justify-center px-20 select-none ${
            maximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
          }`}
        >
          <h1 className='truncate font-display text-2xl font-bold text-ink'>
            지식공유회
          </h1>
        </div>
      </header>

      <div className='flex-1 overflow-y-auto px-10 py-8'>
        {nonEmptyGenerations.length === 0 ? (
          <p className='text-sm text-muted'>
            아직 발표 기록이 없어요. 자료를 보내주시면 채울게요.
          </p>
        ) : (
          <div className='flex flex-col gap-10'>
            {nonEmptyGenerations.map((gen) => (
              <section key={gen.id}>
                <h2 className='mb-4 text-sm font-semibold text-muted'>
                  {gen.label}
                </h2>
                <div className='grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-6 gap-y-5'>
                  {gen.talks.map((talk) => (
                    <div key={talk.id} className='flex flex-col gap-2'>
                      <SlideThumbnail title={talk.title} />
                      <p className='line-clamp-2 text-sm font-medium text-ink'>
                        {talk.title}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
