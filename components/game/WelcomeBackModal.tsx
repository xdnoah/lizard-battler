'use client';

import { useState, useEffect } from 'react';
import { formatNumber, formatTime } from '@/lib/utils/format';

interface WelcomeBackModalProps {
  goldEarned: number;
  secondsElapsed: number;
}

export default function WelcomeBackModal({ goldEarned, secondsElapsed }: WelcomeBackModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Auto-close if gold earned is very small (< 1000)
  useEffect(() => {
    if (goldEarned < 1000) {
      setIsOpen(false);
    }
  }, [goldEarned]);

  if (!isOpen || goldEarned < 1000) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        <div className="text-center">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
          <p className="text-gray-600 mb-6">
            You've been gone for <span className="font-semibold">{formatTime(secondsElapsed)}</span>
          </p>

          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-6">
            <div className="text-sm text-gray-600 mb-1">Gold Collected</div>
            <div className="text-4xl font-bold text-yellow-600">
              {formatNumber(goldEarned)}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              ({(goldEarned / secondsElapsed).toFixed(1)} gold/sec)
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
