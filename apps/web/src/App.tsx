import { useState } from 'react'
import MacbookIntro from './components/MacbookIntro'
import LockScreen from './components/LockScreen'
import Desktop from './components/Desktop'

type Screen = 'intro' | 'lock' | 'desktop'

function App() {
  const [screen, setScreen] = useState<Screen>('intro')

  if (screen === 'intro') {
    return (
      <MacbookIntro onComplete={() => setScreen('lock')} />
    )
  }

  if (screen === 'lock') {
    return (
      <LockScreen onLogin={() => setScreen('desktop')} />
    )
  }

  return <Desktop />
}

export default App
