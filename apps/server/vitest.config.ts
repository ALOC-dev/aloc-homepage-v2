import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false, // 하나의 테스트 DB를 공유하므로 순차 실행
    testTimeout: 20000,
  },
})
