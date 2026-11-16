import TrafficLights from './TrafficLights'
import { useMaterials, useSemesters, fetchFileBlob, materialsApi, type Semester } from '../api'

function SlideThumbnail({ title }: { title: string }) {
  return (
    <div className='flex aspect-[4/3] flex-col overflow-hidden rounded-md border border-black/10 bg-white p-3 shadow-sm transition-shadow group-hover:shadow-md'>
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
async function openMaterial(materialId: number){
  const tab=window.open('','_blank')
  try{
    const detail = await materialsApi.detail(materialId)
    const file=detail.files[0]
    if(file){
      const blob=await fetchFileBlob(file.url)
      tab!.location.href=URL.createObjectURL(blob)
    }else if(detail.links[0]){
      tab!.location.href=detail.links[0].url
    }else{
      tab?.close()
      alert('첨부된 자료가 없어요.')
    }
  }catch{
    tab?.close()
    alert('자료를 열지 못했어요.')
  }
}
function SemesterSection({ semester }: { semester: Semester }) {
  const { data: materials, isPending, isError } = useMaterials(semester.id)

  if (isPending) return null
  if (isError) return <p className='text-sm text-muted'>{semester.name} 자료를 불러오지 못했어요.</p>
  if (materials.length === 0) return null

  return (
    <section>
      <h2 className='mb-4 text-sm font-semibold text-muted'>{semester.name}</h2>
      <div className='grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-6 gap-y-5'>
        {materials.map((m) => (
          <button key={m.id} 
          className='text-left group -m-1 flex cursor-pointer flex-col gap-2 rounded-lg p-1 transition-colors hover:bg-black/5'
          type='button'
          onClick={()=>openMaterial(m.id)}>
            <SlideThumbnail title={m.title} />
            <p className='line-clamp-2 text-sm font-medium text-ink group-hover:text-[#0A84FF]'>{m.title}</p>
          </button>
        ))}
      </div>
    </section>
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

  const { data: semesters, isPending, isError } = useSemesters()

  return (
    <section
      aria-label='지식공유회'
      className={`flex w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_40px_80px_-24px_rgba(28,27,41,0.6)] transition-[height,max-width] duration-300 ease-out ${maximized
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
          className={`flex touch-none justify-center px-20 select-none ${maximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
            }`}
        >
          <h1 className='truncate font-display text-2xl font-bold text-ink'>
            지식공유회
          </h1>
        </div>
      </header>

      <div className='flex-1 overflow-y-auto px-10 py-8'>
        {isPending ? (
          <p className='text-sm text-muted'>불러오는 중…</p>
        ) : isError ? (
          <p className='text-sm text-muted'>발표 목록을 불러오지 못했어요.</p>
        ) : semesters.length === 0 ? (
          <p className='text-sm text-muted'>아직 발표 기록이 없어요.</p>
        ) : (<div className='flex flex-col gap-10'>
          {semesters.map((s) => (
            <SemesterSection key={s.id} semester={s} />
          ))}
        </div>)
        }
      </div>
    </section>
  )
}
