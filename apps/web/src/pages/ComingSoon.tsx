import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DockItem } from '../dockItems'
import Dock from '../components/Dock'

export default function ComingSoon({ item }: { item: DockItem }) {
  return (
    <div className='relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-canvas-deep px-6 pb-32 text-white'>
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background:
            'radial-gradient(90% 70% at 50% 0%, #6a4aa0 0%, transparent 60%), linear-gradient(170deg, #3a2d6b 0%, #5a3f8f 100%)',
        }}
      />

      <div className='relative z-10 flex flex-col items-center gap-5 text-center'>
        <span
          className='flex h-16 w-16 items-center justify-center rounded-2xl shadow-[0_10px_24px_-8px_rgba(0,0,0,0.4)]'
          style={{
            background: `linear-gradient(160deg, ${item.from}, ${item.to2})`,
          }}
        >
          <item.Icon className='h-8 w-8 text-white' aria-hidden='true' />
        </span>
        <div>
          <h1 className='font-display text-xl font-semibold'>{item.label}</h1>
          <p className='mt-1.5 text-sm text-white/70'>
            아직 준비 중이에요. 곧 채워질 예정이에요.
          </p>
        </div>
        <Link
          to='/'
          className='mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-white/20'
        >
          <ArrowLeft className='h-4 w-4' aria-hidden='true' />
          데스크탑으로
        </Link>
      </div>

      <Dock />
    </div>
  )
}
