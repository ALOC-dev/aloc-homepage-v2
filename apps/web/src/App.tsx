import { useState } from 'react'
import LockScreen from './components/LockScreen'
import MacbookIntro from './components/MacbookIntro'
import Home from './pages/Home'

type Screen = 'intro' | 'lock' | 'desktop'

function App() {
  const [screen, setScreen] = useState<Screen>('intro')

  if (screen === 'intro') {
    return <MacbookIntro onComplete={() => setScreen('lock')} />
  }

  if (screen === 'lock') {
    return <LockScreen onLogin={() => setScreen('desktop')} />
  }

  return <Home />
}

export default App
