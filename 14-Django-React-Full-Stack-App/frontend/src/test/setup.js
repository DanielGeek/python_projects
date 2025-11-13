import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn((key) => {
    // Return null for non-existent keys to match real localStorage behavior
    return localStorageMock.data[key] || null
  }),
  setItem: vi.fn((key, value) => {
    localStorageMock.data[key] = value
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMock.data[key]
  }),
  clear: vi.fn(() => {
    localStorageMock.data = {}
  }),
  data: {}, // Internal storage
}
global.localStorage = localStorageMock

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock API calls
vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}))
