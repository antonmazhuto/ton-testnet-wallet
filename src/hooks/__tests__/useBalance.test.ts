import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useBalance } from '../useBalance'
import { ton } from '@/lib/ton'

// Mock ton instance
vi.mock('@/lib/ton', () => ({
  ton: {
    getBalance: vi.fn()
  }
}))

describe('useBalance Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches balance and converts nanoTON to TON', async () => {
    const mockNanoBalance = '1500000000' // 1.5 TON
    vi.mocked(ton.getBalance).mockResolvedValue(mockNanoBalance)

    const { result } = renderHook(() => useBalance('EQCz_8X_7y'))

    // Initial state
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.balance).toBe(1.5)
    expect(ton.getBalance).toHaveBeenCalledWith('EQCz_8X_7y')
  })

  it('handles errors gracefully', async () => {
    vi.mocked(ton.getBalance).mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => useBalance('EQCz_8X_7y'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.balance).toBe(0)
  })
})
