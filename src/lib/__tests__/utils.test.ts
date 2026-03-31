import { describe, it, expect } from 'vitest'
import { formatAddress, formatCurrency } from '../utils'

describe('Formatting Utilities', () => {
  describe('formatAddress', () => {
    it('shortens a long address correctly', () => {
      const addr = 'EQCz_8X_7yEQCz_8X_7yEQCz_8X_7yEQCz_8X_7y'
      expect(formatAddress(addr)).toBe('EQCz_8...X_7y')
    })

    it('returns empty string for empty input', () => {
      expect(formatAddress('')).toBe('')
    })
  })

  describe('formatCurrency', () => {
    it('formats TON balance with en-US locale', () => {
      expect(formatCurrency(1250.45, 'TON')).toBe('1,250.45 TON')
    })

    it('handles zero balance', () => {
      expect(formatCurrency(0, 'TON')).toBe('0.00 TON')
    })
  })
})
