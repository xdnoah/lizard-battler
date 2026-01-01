'use client';

import { useState, useEffect } from 'react';
import { usePassiveGold } from '@/lib/hooks/usePassiveGold';
import { formatNumber } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';

interface GoldDisplayProps {
  lizardId: string;
  initialGold: number;
  passiveRate: number;
}

export default function GoldDisplay({
  lizardId,
  initialGold,
  passiveRate,
}: GoldDisplayProps) {
  const router = useRouter();
  const [showTicker, setShowTicker] = useState(false);
  const [lastGold, setLastGold] = useState(initialGold);

  const { gold, isSyncing, forceSync } = usePassiveGold({
    lizardId,
    initialGold,
    passiveRate,
    onSync: (newGold) => {
      // Refresh the page data when we sync (updates lizard data)
      router.refresh();
    },
  });

  // Show ticker animation every second when gold increases
  useEffect(() => {
    if (gold > lastGold) {
      setShowTicker(true);
      setLastGold(gold);

      // Hide ticker after animation completes
      const timer = setTimeout(() => {
        setShowTicker(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [gold, lastGold]);

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl shadow-lg p-4 mb-6 relative overflow-visible">
      {/* Floating ticker animation */}
      {showTicker && (
        <div className="absolute top-0 right-4 animate-float-up pointer-events-none z-10">
          <div className="text-green-400 font-bold text-xl drop-shadow-lg">
            +{Math.floor(passiveRate)}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">💰</span>
          <div>
            <div className="text-sm text-yellow-900 font-semibold">Gold</div>
            <div className="text-3xl font-bold text-white">
              {formatNumber(gold)}
              {isSyncing && (
                <span className="text-sm ml-2 text-yellow-200 animate-spin inline-block">↻</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-yellow-900 font-semibold">Earning</div>
          <div className="text-lg font-bold text-white">
            +{formatNumber(passiveRate)}/sec
          </div>
        </div>
      </div>

      {/* Animated progress bar that fills every second */}
      <div className="mt-3 h-2 bg-yellow-600 rounded-full overflow-hidden">
        <div
          className="h-full bg-white transition-all duration-1000 ease-linear"
          style={{
            width: showTicker ? '100%' : '0%',
            transition: 'width 1s linear'
          }}
        ></div>
      </div>

      {/* Small ticker text */}
      <div className="mt-2 text-center">
        <div className="text-xs text-yellow-900 font-semibold">
          {showTicker && (
            <span className="inline-block animate-pulse">
              💸 +{Math.floor(passiveRate)} gold
            </span>
          )}
          {!showTicker && (
            <span className="opacity-50">
              Next: {Math.floor(passiveRate)} gold in {showTicker ? '1s' : '< 1s'}
            </span>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px);
          }
        }

        .animate-float-up {
          animation: float-up 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
