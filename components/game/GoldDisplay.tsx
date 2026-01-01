'use client';

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

  const { gold, isSyncing, forceSync } = usePassiveGold({
    lizardId,
    initialGold,
    passiveRate,
    onSync: (newGold) => {
      // Refresh the page data when we sync (updates lizard data)
      router.refresh();
    },
  });

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl shadow-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">💰</span>
          <div>
            <div className="text-sm text-yellow-900 font-semibold">Gold</div>
            <div className="text-3xl font-bold text-white">
              {formatNumber(gold)}
              {isSyncing && (
                <span className="text-sm ml-2 text-yellow-200">↻</span>
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

      {/* Show a subtle animation when gold increases */}
      <div className="mt-2 h-1 bg-yellow-600 rounded-full overflow-hidden">
        <div className="h-full bg-white animate-pulse" style={{ width: '100%' }}></div>
      </div>
    </div>
  );
}
