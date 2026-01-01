'use client';

import { useState, useEffect } from 'react';
import { Lizard, CareAction } from '@/lib/types/database';
import { createClient } from '@/lib/supabase/client';
import { callPerformCareAction } from '@/lib/supabase/queries';
import { formatCountdown } from '@/lib/utils/format';
import { useRouter } from 'next/navigation';

interface CareActionsProps {
  lizard: Lizard;
}

export default function CareActions({ lizard }: CareActionsProps) {
  const [cooldowns, setCooldowns] = useState({
    feed: 0,
    play: 0,
    rest: 0,
  });
  const [loading, setLoading] = useState<CareAction | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Calculate initial cooldowns
  useEffect(() => {
    const calculateCooldown = (lastActionTime: string) => {
      const lastAction = new Date(lastActionTime);
      const now = new Date();
      const hoursSince = (now.getTime() - lastAction.getTime()) / (1000 * 60 * 60);
      const remainingSeconds = Math.max(0, (1 - hoursSince) * 3600);
      return Math.floor(remainingSeconds);
    };

    setCooldowns({
      feed: calculateCooldown(lizard.last_fed),
      play: calculateCooldown(lizard.last_played),
      rest: calculateCooldown(lizard.last_rested),
    });

    // Update cooldowns every second
    const interval = setInterval(() => {
      setCooldowns((prev) => ({
        feed: Math.max(0, prev.feed - 1),
        play: Math.max(0, prev.play - 1),
        rest: Math.max(0, prev.rest - 1),
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [lizard]);

  const handleCareAction = async (action: CareAction) => {
    setLoading(action);

    try {
      const result = await callPerformCareAction(supabase, lizard.id, action);

      if (result.success) {
        // Refresh the page to show updated happiness
        router.refresh();
      } else {
        alert(result.error || 'Action failed');
      }
    } catch (error) {
      console.error('Care action error:', error);
      alert('Failed to perform action');
    } finally {
      setLoading(null);
    }
  };

  const getButtonStyles = (action: CareAction) => {
    const cooldown = cooldowns[action];
    const isLoading = loading === action;
    const isDisabled = cooldown > 0 || isLoading;

    return `flex-1 min-h-[80px] flex flex-col items-center justify-center rounded-xl border-2 transition-all ${
      isDisabled
        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
        : 'bg-white border-green-400 text-green-600 hover:bg-green-50 active:scale-95 cursor-pointer'
    }`;
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3">Care for Your Lizard</h2>

      <div className="flex gap-3">
        {/* Feed Button */}
        <button
          onClick={() => handleCareAction('feed')}
          disabled={cooldowns.feed > 0 || loading === 'feed'}
          className={getButtonStyles('feed')}
        >
          <span className="text-3xl mb-1">🍖</span>
          <span className="text-sm font-semibold">Feed</span>
          {cooldowns.feed > 0 ? (
            <span className="text-xs mt-1">{formatCountdown(cooldowns.feed)}</span>
          ) : (
            <span className="text-xs mt-1 text-green-600">✓ Ready</span>
          )}
        </button>

        {/* Play Button */}
        <button
          onClick={() => handleCareAction('play')}
          disabled={cooldowns.play > 0 || loading === 'play'}
          className={getButtonStyles('play')}
        >
          <span className="text-3xl mb-1">🎮</span>
          <span className="text-sm font-semibold">Play</span>
          {cooldowns.play > 0 ? (
            <span className="text-xs mt-1">{formatCountdown(cooldowns.play)}</span>
          ) : (
            <span className="text-xs mt-1 text-green-600">✓ Ready</span>
          )}
        </button>

        {/* Rest Button */}
        <button
          onClick={() => handleCareAction('rest')}
          disabled={cooldowns.rest > 0 || loading === 'rest'}
          className={getButtonStyles('rest')}
        >
          <span className="text-3xl mb-1">💤</span>
          <span className="text-sm font-semibold">Rest</span>
          {cooldowns.rest > 0 ? (
            <span className="text-xs mt-1">{formatCountdown(cooldowns.rest)}</span>
          ) : (
            <span className="text-xs mt-1 text-green-600">✓ Ready</span>
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-2">
        Each action restores +20 happiness • 1 hour cooldown
      </p>
    </div>
  );
}
