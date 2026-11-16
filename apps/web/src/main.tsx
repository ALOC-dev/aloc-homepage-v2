import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ApiProvider } from './api'
import './index.css'
import App from './App.tsx'

// ApiProvider: 서버 연동(TanStack Query + 로그인 상태). 안쪽 어디서든 useAuth(), useProjects() 등 사용 가능
// 세션 만료·비밀번호 변경 필요 시 화면 전환은 onSessionExpired / onPasswordChangeRequired 로 연결
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ApiProvider>
        <App />
      </ApiProvider>
    </BrowserRouter>
  </StrictMode>,
)
