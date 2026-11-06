import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import Dock from '../components/Dock'
import FinderWindow from '../components/FinderWindow'
import MenuBar from '../components/MenuBar'

export default function Projects() {
  return (
    <div className='relative flex min-h-svh flex-col items-center overflow-hidden bg-canvas-deep'>
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background:
            'radial-gradient(90% 70% at 50% 0%, #6a4aa0 0%, transparent 60%), linear-gradient(170deg, #3a2d6b 0%, #5a3f8f 100%)',
        }}
      />

      <MenuBar />

      <Link
        to='/'
        className='relative z-10 mt-20 mb-4 inline-flex items-center gap-1.5 self-start rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/20 sm:ml-8'
      >
        <ArrowLeft className='h-4 w-4' aria-hidden='true' />
        데스크탑으로
      </Link>

      <main className='relative z-10 flex w-full flex-1 items-center justify-center px-6 pb-32'>
        <FinderWindow />
      </main>

      <Dock />
    </div>
  )
}
