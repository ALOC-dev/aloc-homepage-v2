import { useEffect, useState } from 'react'

type Props = {
  onComplete: () => void
}

export default function MacbookIntro({ onComplete }: Props) {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const showTimer = window.setTimeout(() => {
      setVisible(true)
    }, 100)

    const fadeTimer = window.setTimeout(() => {
      setFading(true)
    }, 2300)

    const finishTimer = window.setTimeout(() => {
      onComplete()
    }, 3000)

    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(fadeTimer)
      window.clearTimeout(finishTimer)
    }
  }, [onComplete])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#17181c',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.7s ease',
      }}
    >
      <img
        src="/images/macbook-open.png"
        alt="ALOC MacBook"
        style={{
          width: 'min(75vw, 850px)',
          maxHeight: '85vh',
          objectFit: 'contain',
          opacity: visible ? 1 : 0,
          transform: visible
            ? 'translateY(0) scale(1)'
            : 'translateY(35px) scale(0.96)',
          transition:
            'opacity 1s ease, transform 1.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
    </div>
  )
}
