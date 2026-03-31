import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SendForm from '../SendForm';
import { toast } from 'sonner';
import { sendTransaction, isAddressNew } from '@/lib/ton';

// Mock dependencies
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('@/lib/ton', () => ({
  sendTransaction: vi.fn(),
  isAddressNew: vi.fn(),
  ton: {
    utils: {
      toNano: vi.fn((v) => v + '000000000'),
    },
  },
}));

describe('SendForm Component', () => {
  const mockSecretKey = new Uint8Array(64);
  const mockBalance = 10.5;
  const mockOnSuccess = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = () => {
    return render(
      <SendForm 
        senderSecretKey={mockSecretKey} 
        balance={mockBalance} 
        onSuccess={mockOnSuccess} 
        onClose={mockOnClose} 
      />
    );
  };

  describe('Validation Logic', () => {
    it('shows error for invalid address format', async () => {
      setup();
      
      const addressInput = screen.getByPlaceholderText(/Enter TON address/i);
      const nextButton = screen.getByText(/Next Step/i);

      fireEvent.change(addressInput, { target: { value: 'invalid-address' } });
      fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '1' } });
      fireEvent.click(nextButton);

      expect(toast.error).toHaveBeenCalledWith('Invalid TON address format');
    });

    it('shows error when amount exceeds balance', async () => {
      setup();
      
      const addressInput = screen.getByPlaceholderText(/Enter TON address/i);
      const amountInput = screen.getByPlaceholderText('0.00');
      const nextButton = screen.getByText(/Next Step/i);

      fireEvent.change(addressInput, { target: { value: 'EQD4FP_8_9_1_2_3_4_5_6_7_8_9_0_1_2_3_4_5_6_7_8_9_0_1_2' } });
      fireEvent.change(amountInput, { target: { value: '20' } }); // Exceeds 10.5
      fireEvent.click(nextButton);

      expect(toast.error).toHaveBeenCalledWith('Insufficient balance (Max: 10.5 TON)');
    });

    it('shows error for invalid amount (zero or negative)', async () => {
      setup();
      
      const addressInput = screen.getByPlaceholderText(/Enter TON address/i);
      const amountInput = screen.getByPlaceholderText('0.00');
      const nextButton = screen.getByText(/Next Step/i);

      fireEvent.change(addressInput, { target: { value: 'EQD4FP_8_9_1_2_3_4_5_6_7_8_9_0_1_2_3_4_5_6_7_8_9_0_1_2' } });
      fireEvent.change(amountInput, { target: { value: '0' } });
      fireEvent.click(nextButton);

      expect(toast.error).toHaveBeenCalledWith('Please enter a valid positive amount');
    });
  });

  describe('Business Logic & Flow', () => {
    it('successfully sends transaction and shows success state', async () => {
      vi.mocked(isAddressNew).mockResolvedValue(false);
      vi.mocked(sendTransaction).mockResolvedValue({} as any);

      setup();

      // Step 1: Input
      fireEvent.change(screen.getByPlaceholderText(/Enter TON address/i), { 
        target: { value: 'EQD4FP_8_9_1_2_3_4_5_6_7_8_9_0_1_2_3_4_5_6_7_8_9_0_1_2' } 
      });
      fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '1.5' } });
      fireEvent.click(screen.getByText(/Next Step/i));

      // Step 2: Confirm
      await waitFor(() => {
        expect(screen.getByText(/Review Send/i)).toBeInTheDocument();
      });

      const sendButton = screen.getByText('Send Now');
      fireEvent.click(sendButton);

      // Step 3: Success
      await waitFor(() => {
        expect(sendTransaction).toHaveBeenCalledWith(mockSecretKey, expect.any(String), 1.5);
        expect(screen.getByText(/Transaction Sent/i)).toBeInTheDocument();
        expect(toast.success).toHaveBeenCalledWith('Transaction sent successfully!');
      });
    });
  });

  describe('UI Behavior', () => {
    it('disables buttons while loading during transaction', async () => {
      vi.mocked(isAddressNew).mockResolvedValue(false);
      // Mock sendTransaction to never resolve immediately
      vi.mocked(sendTransaction).mockReturnValue(new Promise(() => {}));

      setup();

      // Go to confirm step
      fireEvent.change(screen.getByPlaceholderText(/Enter TON address/i), { 
        target: { value: 'EQD4FP_8_9_1_2_3_4_5_6_7_8_9_0_1_2_3_4_5_6_7_8_9_0_1_2' } 
      });
      fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '1' } });
      fireEvent.click(screen.getByText(/Next Step/i));

      await waitFor(() => screen.getByText('Send Now'));
      
      const sendButton = screen.getByText('Send Now');
      fireEvent.click(sendButton);

      expect(sendButton).toBeDisabled();
    });
  });
});
