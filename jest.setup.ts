import '@testing-library/jest-dom'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver
