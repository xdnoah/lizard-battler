'use client';

import { useState, useEffect } from 'react';
import { Lizard } from '@/lib/types/database';
import { createClient } from '@/lib/supabase/client';
import { callLevelUp } from '@/lib/supabase/queries';
import { useRouter } from 'next/navigation';
import { formatNumber } from '@/lib/utils/format';

interface LevelUpButtonProps {
  lizard: Lizard;
}

export default function LevelUpButton({ lizard }: LevelUpButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nextLevelCost, setNextLevelCost] = useState<number | null>(null);
  const [currentStats, setCurrentStats] = useState<any>(null);
  const [nextLevelStats, setNextLevelStats] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  // Fetch next level cost and stats
  useEffect(() => {
    const fetchLevelInfo = async () => {
      if (lizard.level >= 100) return;

      try {
        // Fetch current level stats
        const { data: current } = await supabase
          .from('level_stats')
          .select('*')
          .eq('level', lizard.level)
          .single();

        // Fetch next level stats
        const { data: next, error } = await supabase
          .from('level_stats')
          .select('*')
          .eq('level', lizard.level + 1)
          .single();

        if (error) throw error;
        setCurrentStats(current);
        setNextLevelCost(next.upgrade_cost);
        setNextLevelStats(next);
      } catch (error) {
        console.error('Failed to fetch level info:', error);
      }
    };

    fetchLevelInfo();
  }, [lizard.level, supabase]);

  const handleLevelUp = async () => {
    setLoading(true);

    try {
      const result = await callLevelUp(supabase, lizard.id);

      if (result.success) {
        // Show success and refresh
        setShowModal(false);
        router.refresh();
      } else {
        alert(result.error || 'Failed to level up');
      }
    } catch (error) {
      console.error('Level up error:', error);
      alert('Failed to level up');
    } finally {
      setLoading(false);
    }
  };

  if (lizard.level >= 100) {
    return (
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl shadow-lg p-4 text-center">
        <div className="text-4xl mb-2">👑</div>
        <div className="text-white font-bold text-lg">MAX LEVEL!</div>
        <div className="text-white/90 text-sm">Your lizard has reached maximum power!</div>
      </div>
    );
  }

  const canAfford = nextLevelCost !== null && lizard.gold >= nextLevelCost;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={!canAfford}
        className={`w-full rounded-2xl shadow-lg p-4 transition-all ${
          canAfford
            ? 'bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500 cursor-pointer'
            : 'bg-gray-200 cursor-not-allowed'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <div className={`font-bold text-lg ${canAfford ? 'text-white' : 'text-gray-600'}`}>
              Level Up! ⬆️
            </div>
            <div className={`text-sm ${canAfford ? 'text-white/90' : 'text-gray-500'}`}>
              {lizard.level} → {lizard.level + 1}
            </div>
          </div>
          <div className="text-right">
            <div className={`font-bold text-xl ${canAfford ? 'text-white' : 'text-gray-600'}`}>
              {nextLevelCost !== null ? formatNumber(nextLevelCost) : '...'}
            </div>
            <div className={`text-xs ${canAfford ? 'text-white/90' : 'text-gray-500'}`}>
              gold required
            </div>
          </div>
        </div>

        {!canAfford && nextLevelCost !== null && (
          <div className="mt-2 text-xs text-red-600">
            Need {formatNumber(nextLevelCost - lizard.gold)} more gold
          </div>
        )}
      </button>

      {/* Level Up Modal */}
      {showModal && nextLevelStats && nextLevelCost !== null && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">⬆️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Level Up!</h2>
              <p className="text-gray-600">
                Advance to Level {lizard.level + 1}
              </p>
            </div>

            {/* Cost */}
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-semibold">Cost:</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {formatNumber(nextLevelCost)} 💰
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                You have: {formatNumber(lizard.gold)} gold
              </div>
            </div>

            {/* Stat Improvements */}
            {currentStats && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <h3 className="font-bold text-green-800 mb-3">Stat Increases</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">HP:</span>
                    <span className="font-semibold text-green-600">
                      +{(nextLevelStats.hp - currentStats.hp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Attack:</span>
                    <span className="font-semibold text-green-600">
                      +{(nextLevelStats.attack - currentStats.attack).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Defense:</span>
                    <span className="font-semibold text-green-600">
                      +{(nextLevelStats.defense - currentStats.defense).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Passive Gold/sec:</span>
                    <span className="font-semibold text-green-600">
                      +{(nextLevelStats.passive_gold_per_second - currentStats.passive_gold_per_second).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLevelUp}
                disabled={loading || !canAfford}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Leveling Up...' : 'Confirm!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
