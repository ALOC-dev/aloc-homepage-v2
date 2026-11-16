import { useCallback, useState } from 'react'
import { useAuth } from './api'
import LockScreen from './components/LockScreen'
import MacbookIntro from './components/MacbookIntro'
import Home from './pages/Home'

function App() {
  // 화면은 기억하지 않고 로그인 상태로 정한다. 인트로는 봤는지만 기억
  const [introDone, setIntroDone] = useState(false)
  const { status, mustChangePassword } = useAuth()
  // MacbookIntro는 onComplete가 바뀌면 타이머를 다시 시작한다.
  // 인트로 도중 로그인 복구가 끝나 App이 다시 그려져도 인트로가 처음부터 재생되지 않도록 고정
  const finishIntro = useCallback(() => setIntroDone(true), [])

  if (!introDone) {
    return <MacbookIntro onComplete={finishIntro} />
  }

  // 비로그인·로그인 확인 중·비밀번호 변경 필요 → 잠금화면
  // (로그인하면 자동으로 데스크톱, 세션이 만료되면 자동으로 잠금화면)
  if (status !== 'authenticated' || mustChangePassword) {
    return <LockScreen />
  }

  return <Home />
}

export default App
