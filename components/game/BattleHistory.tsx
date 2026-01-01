'use client';

import { useEffect, useState } from 'react';
import { Battle } from '@/lib/types/database';
import { createClient } from '@/lib/supabase/client';
import { formatRelativeTime } from '@/lib/utils/format';

interface BattleHistoryProps {
  lizardId: string;
}

export default function BattleHistory({ lizardId }: BattleHistoryProps) {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchBattles = async () => {
      try {
        const { data, error } = await supabase
          .from('battles')
          .select('*')
          .or(`attacker_id.eq.${lizardId},defender_id.eq.${lizardId}`)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setBattles(data || []);
      } catch (error) {
        console.error('Failed to fetch battles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBattles();
  }, [lizardId, supabase]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Battle History</h2>
        <p className="text-gray-500 text-center py-4">Loading...</p>
      </div>
    );
  }

  if (battles.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Battle History</h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">⚔️</div>
          <p className="text-gray-500">No battles yet! Challenge an opponent to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📜</span>
          <div className="text-left">
            <h2 className="text-lg font-bold text-gray-800">Battle History</h2>
            <p className="text-xs text-gray-500">{battles.length} recent battle{battles.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <span className="text-gray-400 text-xl">
          {expanded ? '▼' : '▶'}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="p-4 pt-0 border-t border-gray-100">
          <div className="space-y-2">
            {battles.map((battle) => {
              const isAttacker = battle.attacker_id === lizardId;
              const isWinner = battle.winner_id === lizardId;

              return (
                <div
                  key={battle.id}
                  className={`p-3 rounded-lg border-2 ${
                    isWinner
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {isWinner ? '🏆' : '💀'}
                      </span>
                      <span className={`font-bold ${isWinner ? 'text-green-600' : 'text-red-600'}`}>
                        {isWinner ? 'Victory' : 'Defeat'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(battle.created_at)}
                    </span>
                  </div>

                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {isAttacker ? 'Challenged:' : 'Challenged by:'}
                      </span>
                      <span className="font-semibold">Opponent</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Turns:</span>
                      <span className="font-semibold">{battle.battle_log.length}</span>
                    </div>
                    {isWinner && battle.gold_reward > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gold Earned:</span>
                        <span className="font-semibold text-yellow-600">
                          +{battle.gold_reward.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating Change:</span>
                      <span className={`font-semibold ${isAttacker ? (battle.rating_change_attacker > 0 ? 'text-green-600' : 'text-red-600') : (battle.rating_change_defender > 0 ? 'text-green-600' : 'text-red-600')}`}>
                        {isAttacker
                          ? (battle.rating_change_attacker > 0 ? '+' : '') + battle.rating_change_attacker
                          : (battle.rating_change_defender > 0 ? '+' : '') + battle.rating_change_defender
                        }
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
