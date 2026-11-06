import { type ReactNode, useEffect, useState } from 'react'

export default function AppWindow({
  onClose,
  widthClass = 'max-w-4xl',
  children,
}: {
  onClose: () => void
  widthClass?: string
  children: (close: () => void) => ReactNode
}) {
  const [entered, setEntered] = useState(false)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  function handleClose() {
    setClosing(true)
    window.setTimeout(onClose, 320)
  }

  const visible = entered && !closing

  return (
    <div className='pointer-events-none fixed inset-0 z-[25] flex items-center justify-center px-6'>
      <div
        className={`pointer-events-auto w-full ${widthClass}`}
        style={{
          transform: visible
            ? 'translateY(0) scale(1)'
            : 'translateY(220px) scale(0.25)',
          opacity: visible ? 1 : 0,
          transformOrigin: 'bottom center',
          transition:
            'transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 260ms ease-out',
        }}
      >
        {children(handleClose)}
      </div>
    </div>
  )
}
