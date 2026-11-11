import { useEffect, useId, useState } from 'react'
import './MacbookIntro.css'
import './Wallpaper.css'

type Props = {
  onComplete: () => void
}

export default function MacbookIntro({ onComplete }: Props) {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)
  const id = useId()
  const lidClipId = `${id}-lid`
  const baseClipId = `${id}-base`
  const displayClipId = `${id}-display`

  useEffect(() => {
    const showTimer = window.setTimeout(() => {
      setVisible(true)
    }, 100)

    const fadeTimer = window.setTimeout(() => {
      setFading(true)
    }, 4600)

    const finishTimer = window.setTimeout(() => {
      onComplete()
    }, 5300)

    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(fadeTimer)
      window.clearTimeout(finishTimer)
    }
  }, [onComplete])

  return (
    <div className={`macbook-intro${fading ? ' macbook-intro--fading' : ''}`}>
      <div
        className={`macbook-intro__image${visible ? ' macbook-intro__image--visible' : ''}`}
        role='img'
        aria-label='ALOC MacBook'
      >
        {/* Both layers use the original 1536 × 1024 image coordinates.
            Only the lid rotates; the base and the image footprint stay fixed. */}
        <svg viewBox='0 0 1536 1024' aria-hidden='true'>
          <defs>
            <clipPath id={lidClipId}>
              <rect x='180' y='104' width='1178' height='776' rx='40' />
            </clipPath>
            {/* Keep only pixels below the hinge in the stationary layer.
                Subtracting an approximate lid outline leaves a fixed bezel. */}
            <clipPath id={baseClipId}>
              <rect x='0' y='880' width='1536' height='144' />
            </clipPath>
          </defs>
          <image
            href='/images/macbook-open.png'
            width='1536'
            height='1024'
            clipPath={`url(#${baseClipId})`}
          />
        </svg>
        <svg
          className='macbook-intro__lid'
          viewBox='0 0 1536 1024'
          aria-hidden='true'
        >
          <defs>
            {/* Preserve the original bezel and camera notch. */}
            <clipPath id={displayClipId}>
              <path d='M218 136H701V147Q701 157 711 157H826Q836 157 836 147V136H1320Q1330 136 1330 146V832H208V146Q208 136 218 136Z' />
            </clipPath>
          </defs>
          <image
            href='/images/macbook-open.png'
            width='1536'
            height='1024'
            clipPath={`url(#${lidClipId})`}
          />
          <foreignObject
            x='208'
            y='136'
            width='1122'
            height='696'
            clipPath={`url(#${displayClipId})`}
          >
            <div className='macbook-intro__display aloc-wallpaper'>
              <span>
                ALOC<span className='macbook-intro__brand-dot'>.</span>
              </span>
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>
  )
}
