import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock TextEncoder/TextDecoder for browser-like environment (needed for crypto/tonweb)
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString() },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock TonWeb if needed for broad UI tests
const MockTonWeb = vi.fn().mockImplementation(() => ({
  provider: {},
  wallet: { all: { v4R2: vi.fn() } },
  utils: { toNano: (v: string) => v + '000000000' }
}));

// Add static properties to the mock class
(MockTonWeb as any).Address = {
  isValid: (addr: string) => addr.startsWith('EQ') && addr.length > 10
};

vi.mock('tonweb', () => ({
  default: MockTonWeb
}));
