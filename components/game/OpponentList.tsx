'use client';

import { useState } from 'react';
import { Lizard, BattleCooldown } from '@/lib/types/database';
import BattleModal from './BattleModal';
import { formatCountdown, getLocationEmoji } from '@/lib/utils/format';

interface OpponentListProps {
  myLizard: Lizard;
  opponents: Lizard[];
  cooldowns: BattleCooldown[];
}

export default function OpponentList({ myLizard, opponents, cooldowns }: OpponentListProps) {
  const [selectedOpponent, setSelectedOpponent] = useState<Lizard | null>(null);
  const [showBattle, setShowBattle] = useState(false);

  const getCooldownForOpponent = (opponentId: string) => {
    const cooldown = cooldowns.find((c) => c.defender_id === opponentId);
    if (!cooldown) return null;

    const now = new Date();
    const canBattleAt = new Date(cooldown.can_battle_again_at);
    const secondsRemaining = Math.max(0, Math.floor((canBattleAt.getTime() - now.getTime()) / 1000));

    return secondsRemaining > 0 ? secondsRemaining : null;
  };

  const handleChallenge = (opponent: Lizard) => {
    setSelectedOpponent(opponent);
    setShowBattle(true);
  };

  if (opponents.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🦎</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Opponents Available</h3>
        <p className="text-gray-600">
          Be the first to create a lizard! Other players will appear here once they join.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-3">Available Opponents</h2>
        <div className="space-y-3">
          {opponents.map((opponent) => {
            const cooldownSeconds = getCooldownForOpponent(opponent.id);
            const isOnCooldown = cooldownSeconds !== null && cooldownSeconds > 0;

            return (
              <div
                key={opponent.id}
                className={`bg-white rounded-xl border-2 transition-all ${
                  isOnCooldown ? 'border-gray-200' : 'border-gray-200 hover:border-green-400'
                }`}
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Lizard visual */}
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-2xl">
                        🦎
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{opponent.name}</h3>
                        <p className="text-sm text-gray-600">Level {opponent.level}</p>
                      </div>
                    </div>
                    {!isOnCooldown ? (
                      <button
                        onClick={() => handleChallenge(opponent)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors min-w-[100px] min-h-[44px]"
                      >
                        ⚔️ Battle
                      </button>
                    ) : (
                      <div className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg font-semibold min-w-[100px] min-h-[44px] flex items-center justify-center">
                        🕐 {formatCountdown(cooldownSeconds)}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-blue-50 rounded p-2">
                      <div className="text-xs text-gray-600">Rating</div>
                      <div className="font-bold text-blue-600">{opponent.rating}</div>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <div className="text-xs text-gray-600">Win Rate</div>
                      <div className="font-bold text-green-600">
                        {opponent.wins + opponent.losses > 0
                          ? Math.round((opponent.wins / (opponent.wins + opponent.losses)) * 100)
                          : 0}
                        %
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded p-2">
                      <div className="text-xs text-gray-600">Record</div>
                      <div className="font-bold text-purple-600 text-xs">
                        {opponent.wins}W/{opponent.losses}L
                      </div>
                    </div>
                  </div>

                  {/* Win streak indicator */}
                  {opponent.current_win_streak >= 3 && (
                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2 text-center">
                      <span className="text-xs text-yellow-700 font-semibold">
                        🔥 {opponent.current_win_streak}-Win Streak! (Dangerous!)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Battle Modal */}
      {showBattle && selectedOpponent && (
        <BattleModal
          myLizard={myLizard}
          opponent={selectedOpponent}
          onClose={() => {
            setShowBattle(false);
            setSelectedOpponent(null);
          }}
        />
      )}
    </>
  );
}
