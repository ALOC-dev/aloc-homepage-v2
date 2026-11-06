import Dock from '../components/Dock'
import MenuBar from '../components/MenuBar'
import NoticeAlert from '../components/NoticeAlert'
import PhotoWindow from '../components/PhotoWindow'

export default function Home() {
  return (
    <div className='relative flex min-h-svh flex-col overflow-hidden bg-canvas-deep'>
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background:
            'radial-gradient(120% 90% at 12% 15%, #e6c9ff 0%, transparent 55%), radial-gradient(90% 70% at 85% 10%, #ffd9c2 0%, transparent 50%), radial-gradient(100% 80% at 80% 90%, #ffb199 0%, transparent 55%), linear-gradient(160deg, #3a2d6b 0%, #7a4fb0 45%, #c87f9e 100%)',
        }}
      />
      <div
        className='pointer-events-none absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full opacity-60 blur-3xl'
        style={{
          background:
            'radial-gradient(circle, rgba(170,59,255,0.55), transparent 70%)',
        }}
      />
      <div
        className='pointer-events-none absolute -right-24 bottom-0 h-[460px] w-[460px] rounded-full opacity-50 blur-3xl'
        style={{
          background:
            'radial-gradient(circle, rgba(255,177,153,0.55), transparent 70%)',
        }}
      />

      <MenuBar />

      <main className='relative z-10 flex flex-1 items-center justify-center px-6 pt-14 pb-32'>
        <div className='flex w-full max-w-4xl flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center'>
          <PhotoWindow />
          <NoticeAlert />
        </div>
      </main>

      <Dock />
    </div>
  )
}
