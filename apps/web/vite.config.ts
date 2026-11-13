import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // 처음 접속할 때 뒤늦게 발견되어 따로 묶이면 React가 2벌 로드되는 문제가 있어(Invalid hook call)
    // 서버 시작 시 React와 함께 미리 묶는다
    include: ['@tanstack/react-query', '@tanstack/react-query-devtools'],
  },
})
