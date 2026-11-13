import { useAuth, isApiError } from '../api'
import { useEffect, useState } from 'react'
import './LockScreen.css'
import './Wallpaper.css'

function LockScreen() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [now, setNow] = useState(() => new Date())

  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  async function handleLogin(e: React.SubmitEvent<HTMLFormElement>) {
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
    setIsSubmitting(true)
    try {
      const result = await login(loginId.trim(), password)
      if (result.mustChangePassword) {
        setError('첫 로그인입니다. 비밀번호 변경이 필요해요.')
        return
      }
      // 성공하면 로그인 상태가 바뀌면서 App이 자동으로 데스크톱을 보여준다
    } catch (err) {
      if (!isApiError(err)) {
        setError('알 수 없는 오류가 발생했어요.')
        return
      }
      if (err.code === 'INVALID_CREDENTIALS') {
        setError('아이디 또는 비밀번호가 올바르지 않아요.')
      } else if (err.code === 'TOO_MANY_REQUESTS') {
        setError('로그인 시도가 너무 많아요. 잠시 후 다시 시도해 주세요.')
      } else if (err.code === 'NETWORK_ERROR') {
        setError('서버에 연결할 수 없어요.')
      } else {
        setError(err.message)
      }
    } finally {
      setIsSubmitting(false)
    }
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
          <img
            className='lock-screen__orb'
            src='/images/aloc-symbol.png'
            alt=''
          />
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
          <img
            className='lock-screen__orb lock-screen__orb--avatar'
            src='/images/aloc-symbol.png'
            alt=''
          />
        </div>
        <h1 id='lock-screen-user'>ALOC</h1>
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
          <button
            type='submit'
            className='lock-screen__submit'
            disabled={isSubmitting}
          >
            {isSubmitting ? '로그인 중…' : '로그인'}
          </button>
          <p id='lock-screen-error' className='lock-screen__error' role='alert'>
            {error}
          </p>
        </form>
      </section>
    </main>
  )
}
export default LockScreen
