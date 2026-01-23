'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSignTypedData } from 'wagmi';
import { getEIP3009Domain, EIP3009_TYPES, fromAtomicUnits } from '@/lib/plasma-config';
import type { PaymentRequired, PaymentOption } from '@/lib/payment-middleware';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentRequired: PaymentRequired | null;
  onPaymentComplete: (invoiceId: string, txHash: string) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  paymentRequired,
  onPaymentComplete,
}: PaymentModalProps) {
  const { address, isConnected } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  
  const [selectedOption, setSelectedOption] = useState<PaymentOption | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'signing' | 'verifying' | 'complete'>('idle');

  useEffect(() => {
    if (paymentRequired && paymentRequired.paymentOptions.length > 0) {
      setSelectedOption(paymentRequired.paymentOptions[0]);
    }
  }, [paymentRequired]);

  if (!isOpen || !paymentRequired) return null;

  const handlePayment = async () => {
    if (!selectedOption || !address) return;

    setIsProcessing(true);
    setError(null);
    setStatus('signing');

    try {
      // Prepare EIP-3009 authorization
      const authorization = {
        from: address,
        to: selectedOption.recipient,
        value: BigInt(selectedOption.amount),
        validAfter: Math.floor(Date.now() / 1000),
        validBefore: selectedOption.deadline,
        nonce: `0x${selectedOption.nonce}`,
      };

      // Sign the authorization
      const signature = await signTypedDataAsync({
        domain: getEIP3009Domain(selectedOption.chainId),
        types: EIP3009_TYPES,
        primaryType: 'TransferWithAuthorization',
        message: authorization,
      });

      setStatus('verifying');

      // Submit payment for verification
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: paymentRequired.invoiceId,
          signature,
          authorization,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment verification failed');
      }

      const result = await response.json();
      setStatus('complete');
      
      // Notify parent component
      onPaymentComplete(result.invoiceId, result.txHash);
      
      // Close modal after a brief delay
      setTimeout(() => {
        onClose();
        setStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
      setStatus('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalAmount = selectedOption 
    ? BigInt(selectedOption.amount) + BigInt(selectedOption.feeBreakdown.totalFee)
    : BigInt(0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Payment Required</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">{paymentRequired.description}</p>
          
          {selectedOption && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">
                  {fromAtomicUnits(BigInt(selectedOption.amount))} {selectedOption.tokenSymbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee:</span>
                <span className="font-medium">
                  {fromAtomicUnits(BigInt(selectedOption.feeBreakdown.totalFee))} {selectedOption.tokenSymbol}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-semibold">Total:</span>
                <span className="font-semibold">
                  {fromAtomicUnits(totalAmount)} {selectedOption.tokenSymbol}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Network: {selectedOption.network} (Chain ID: {selectedOption.chainId})
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {status === 'complete' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            Payment successful! Generating your figurine...
          </div>
        )}

        {!isConnected ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">Please connect your wallet to continue</p>
            <button
              onClick={() => window.open('https://plasma.to/wallet', '_blank')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <button
            onClick={handlePayment}
            disabled={isProcessing || !selectedOption}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'signing' && 'Sign Payment...'}
            {status === 'verifying' && 'Verifying Payment...'}
            {status === 'complete' && 'Payment Complete ✓'}
            {status === 'idle' && !isProcessing && 'Pay with USDT0'}
          </button>
        )}

        <p className="text-xs text-gray-500 text-center mt-4">
          Powered by Plasma USDT0 • EIP-3009 Gasless Payment
        </p>
      </div>
    </div>
  );
}
