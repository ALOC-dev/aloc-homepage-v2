import { useEffect, useState } from 'react'

const desktopFiles = [
  { icon: '📁', name: 'About ALOC' },
  { icon: '📁', name: 'Projects' },
  { icon: '📁', name: 'Archive' },
]

const dockApps = [
  { icon: '⌂', name: 'Home', color: '#f97316' },
  { icon: '▣', name: 'Files', color: '#60a5fa' },
  { icon: '▤', name: 'Archive', color: '#a78bfa' },
  { icon: '▦', name: 'Calendar', color: '#fb7185' },
  { icon: '⚙', name: 'Settings', color: '#64748b' },
]

function Desktop() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const time = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return (
    <main className="relative h-screen overflow-hidden bg-gradient-to-br from-orange-400 via-rose-500 to-purple-800 text-white">

      {/* 상단 메뉴바 */}
      <header className="flex h-9 items-center justify-between bg-black/20 px-5 backdrop-blur-xl">
        <div className="flex items-center gap-6 text-sm">
          <span className="font-bold">ALOC</span>
          <span>File</span>
          <span>View</span>
          <span>Help</span>
        </div>

        <span className="text-sm">{time}</span>
      </header>

      {/* 바탕화면 파일 */}
      <div className="absolute right-8 top-20 flex flex-col gap-7">
        {desktopFiles.map((file) => (
          <div
            key={file.name}
            className="flex w-24 flex-col items-center gap-1"
          >
            <span className="text-5xl">{file.icon}</span>
            <span className="text-center text-xs">
              {file.name}
            </span>
          </div>
        ))}
      </div>

      {/* 하단 Dock */}
      <nav className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-end gap-3 rounded-2xl border border-white/30 bg-white/20 p-3 shadow-xl backdrop-blur-xl">
        {dockApps.map((app) => (
          <button
            key={app.name}
            title={app.name}
            className="flex h-14 w-14 items-center justify-center rounded-xl text-3xl shadow-lg transition-transform duration-200 hover:-translate-y-2 hover:scale-110"
            style={{ backgroundColor: app.color }}
          >
            {app.icon}
          </button>
        ))}
      </nav>
    </main>
  )
}

export default Desktop
