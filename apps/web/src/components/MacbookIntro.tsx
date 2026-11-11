import { useEffect, useState } from 'react'
import './MacbookIntro.css'

type MacbookIntroProps = {
  onComplete: () => void
}

function MacbookIntro({ onComplete }: MacbookIntroProps) {
  const [zooming, setZooming] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setZooming(true)
    }, 2400)

    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main className={`intro ${zooming ? 'zooming' : ''}`}>
      <div
        className="macbook-image"
        onTransitionEnd={(event) => {
          if (
            zooming &&
            event.target === event.currentTarget &&
            event.propertyName === 'transform'
          ) {
            onComplete()
          }
        }}
      >
        <img
          src="/images/macbook-open.png"
          alt="ALOC MacBook"
        />
      </div>
    </main>
  )
}

export default MacbookIntro

