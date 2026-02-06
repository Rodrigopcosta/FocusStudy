import type { Config } from 'jest'
import nextJest from 'next/jest.js'
import path from 'path'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': path.resolve(__dirname, './$1'),
  },
}

export default createJestConfig(config)
