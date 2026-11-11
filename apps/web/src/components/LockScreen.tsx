import { useEffect, useState } from 'react'
import './LockScreen.css'
import './Wallpaper.css'

type LockScreenProps = { onLogin: () => void }

function LockScreen({ onLogin }: LockScreenProps) {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  function handleLogin(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    if (!loginId.trim() || !password.trim()) {
      setError(
        !loginId.trim() && !password.trim()
          ? '아이디와 비밀번호를 입력해 주세요.'
          : !loginId.trim()
            ? '아이디를 입력해 주세요.'
            : '비밀번호를 입력해 주세요.',
      )
      return
    }
    setError('')
    // UI-only success. API authentication will be connected separately.
    onLogin()
  }

  const date = now.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
  const time = now.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return (
    <main className='lock-screen aloc-wallpaper'>
      <header className='lock-screen__header'>
        <div className='lock-screen__brand'>
          <span className='lock-screen__orb' aria-hidden='true' />
          <span>ALOC</span>
        </div>
        <span className='lock-screen__status' aria-hidden='true'>
          <svg viewBox='0 0 24 24' fill='none'>
            <path d='M5 10a10.5 10.5 0 0 1 14 0M8 13a6 6 0 0 1 8 0M11 16a1.5 1.5 0 0 1 2 0' />
            <circle cx='12' cy='18' r='.75' fill='currentColor' stroke='none' />
          </svg>
          <svg viewBox='0 0 24 24' fill='none'>
            <rect x='3' y='7' width='17' height='10' rx='3' />
            <path d='M22 10v4' />
            <rect
              x='5.5'
              y='9.5'
              width='10'
              height='5'
              rx='1'
              fill='currentColor'
              stroke='none'
            />
          </svg>
        </span>
      </header>
      <div className='lock-screen__clock'>
        <p>{date}</p>
        <time dateTime={now.toISOString()}>{time}</time>
      </div>
      <section
        className='lock-screen__login'
        aria-labelledby='lock-screen-user'
      >
        <div className='lock-screen__avatar' aria-hidden='true'>
          <span className='lock-screen__orb lock-screen__orb--avatar' />
        </div>
        <h1 id='lock-screen-user'>ALOC</h1>
        <p className='lock-screen__tagline'>함께 배우고, 함께 만드는 공간</p>
        <form className='lock-screen__form' onSubmit={handleLogin} noValidate>
          <label className='lock-screen__sr-only' htmlFor='lock-screen-id'>
            아이디
          </label>
          <div className='lock-screen__input-wrap'>
            <input
              id='lock-screen-id'
              name='loginId'
              type='text'
              autoComplete='username'
              autoCapitalize='none'
              spellCheck={false}
              value={loginId}
              onChange={(e) => {
                setLoginId(e.target.value)
                setError('')
              }}
              placeholder='아이디'
              aria-invalid={submitted && !loginId.trim()}
              aria-describedby={error ? 'lock-screen-error' : undefined}
            />
          </div>
          <label
            className='lock-screen__sr-only'
            htmlFor='lock-screen-password'
          >
            비밀번호
          </label>
          <div className='lock-screen__input-wrap'>
            <input
              id='lock-screen-password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              autoComplete='current-password'
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder='비밀번호'
              aria-invalid={submitted && !password.trim()}
              aria-describedby={error ? 'lock-screen-error' : undefined}
            />
            <button
              type='button'
              className='lock-screen__password-toggle'
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 표시'}
              aria-controls='lock-screen-password'
              aria-pressed={showPassword}
              onClick={() => setShowPassword((show) => !show)}
            >
              <svg viewBox='0 0 24 24' fill='none' aria-hidden='true'>
                <path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z' />
                <circle cx='12' cy='12' r='3' />
                {showPassword && <path d='m3 3 18 18' />}
              </svg>
            </button>
          </div>
          <button type='submit' className='lock-screen__submit'>
            로그인
          </button>
          <p id='lock-screen-error' className='lock-screen__error' role='alert'>
            {error}
          </p>
        </form>
      </section>
      <footer className='lock-screen__footer'>
        <svg viewBox='0 0 24 24' fill='none' aria-hidden='true'>
          <rect x='6' y='10' width='12' height='10' rx='3' />
          <path d='M8 10V7a4 4 0 0 1 8 0v3m-4 4v2' />
        </svg>
        <span>오늘의 이야기가 시작되는 곳, ALOC</span>
      </footer>
    </main>
  )
}
export default LockScreen
