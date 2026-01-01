'use client';

import { useState, useEffect } from 'react';
import { Lizard, BattleTurn } from '@/lib/types/database';
import { createClient } from '@/lib/supabase/client';
import { callResolveBattle } from '@/lib/supabase/queries';
import { useRouter } from 'next/navigation';
import { formatNumber } from '@/lib/utils/format';

interface BattleModalProps {
  myLizard: Lizard;
  opponent: Lizard;
  onClose: () => void;
}

type BattlePhase = 'loading' | 'animating' | 'results';

interface BattleResult {
  success: boolean;
  winner: string;
  battle_log: BattleTurn[];
  attacker_rating_change: number;
  defender_rating_change: number;
  gold_reward: number;
  xp_reward: number;
  attacker_final_hp: number;
  defender_final_hp: number;
  error?: string;
}

export default function BattleModal({ myLizard, opponent, onClose }: BattleModalProps) {
  const [phase, setPhase] = useState<BattlePhase>('loading');
  const [result, setResult] = useState<BattleResult | null>(null);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Initiate battle on mount
  useEffect(() => {
    const initiateBattle = async () => {
      try {
        const battleResult = await callResolveBattle(supabase, myLizard.id, opponent.id);

        if (!battleResult.success) {
          alert(battleResult.error || 'Battle failed');
          onClose();
          return;
        }

        setResult(battleResult as BattleResult);
        setPhase('animating');
      } catch (error) {
        console.error('Battle error:', error);
        alert('Failed to start battle');
        onClose();
      }
    };

    initiateBattle();
  }, [myLizard.id, opponent.id, supabase, onClose]);

  // Animate battle turns
  useEffect(() => {
    if (phase !== 'animating' || !result) return;

    if (autoPlay) {
      const timer = setInterval(() => {
        setCurrentTurn((prev) => {
          if (prev >= result.battle_log.length - 1) {
            clearInterval(timer);
            setTimeout(() => setPhase('results'), 1000);
            return prev;
          }
          return prev + 1;
        });
      }, 800); // 800ms per turn

      return () => clearInterval(timer);
    }
  }, [phase, result, autoPlay]);

  const handleSkip = () => {
    if (result) {
      setCurrentTurn(result.battle_log.length - 1);
      setTimeout(() => setPhase('results'), 500);
    }
  };

  const handleClose = () => {
    router.refresh(); // Refresh to update stats
    onClose();
  };

  if (phase === 'loading') {
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4 animate-bounce">⚔️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Preparing Battle...</h2>
          <p className="text-gray-600">Calculating stats and matchup</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" />
            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse delay-100" />
            <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse delay-200" />
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'animating' && result) {
    const currentLog = result.battle_log[currentTurn];
    const isMyTurn = currentLog?.attacker === 'attacker';

    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Battle in Progress!</h2>
            <p className="text-sm text-gray-600">
              Turn {currentTurn + 1} of {result.battle_log.length}
            </p>
          </div>

          {/* Battle Arena */}
          <div className="flex items-center justify-between mb-6">
            {/* Your Lizard */}
            <div className={`text-center ${isMyTurn ? 'scale-110' : 'scale-100'} transition-transform`}>
              <div className="w-20 h-20 bg-green-500 rounded-full mb-2 mx-auto flex items-center justify-center text-3xl">
                🦎
              </div>
              <div className="text-sm font-semibold">{myLizard.name}</div>
              <div className="text-xs text-gray-600">
                HP: {currentLog?.attacker === 'attacker' ? currentLog.defender_hp_remaining || 0 : currentLog?.attacker_hp_remaining || 0}
              </div>
            </div>

            {/* VS */}
            <div className="text-4xl font-bold text-red-600">VS</div>

            {/* Opponent */}
            <div className={`text-center ${!isMyTurn ? 'scale-110' : 'scale-100'} transition-transform`}>
              <div className="w-20 h-20 bg-blue-500 rounded-full mb-2 mx-auto flex items-center justify-center text-3xl">
                🦎
              </div>
              <div className="text-sm font-semibold">{opponent.name}</div>
              <div className="text-xs text-gray-600">
                HP: {currentLog?.attacker === 'defender' ? currentLog.defender_hp_remaining || 0 : currentLog?.attacker_hp_remaining || 0}
              </div>
            </div>
          </div>

          {/* Turn Info */}
          {currentLog && (
            <div className={`p-4 rounded-xl mb-4 ${currentLog.critical ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-gray-50'}`}>
              <div className="text-center">
                <div className="font-bold text-lg mb-1">
                  {isMyTurn ? myLizard.name : opponent.name} attacks!
                </div>
                {currentLog.critical && (
                  <div className="text-yellow-600 font-bold text-xl mb-2">
                    💥 CRITICAL HIT! 💥
                  </div>
                )}
                <div className="text-2xl font-bold text-red-600">
                  {currentLog.damage} damage
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={handleSkip}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Skip to Results
            </button>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                autoPlay
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {autoPlay ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'results' && result) {
    const isVictory = result.winner === myLizard.id;

    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          {/* Result Header */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">
              {isVictory ? '🏆' : '💀'}
            </div>
            <h2 className={`text-3xl font-bold mb-2 ${isVictory ? 'text-green-600' : 'text-red-600'}`}>
              {isVictory ? 'VICTORY!' : 'DEFEAT'}
            </h2>
            <p className="text-gray-600">
              {isVictory
                ? `You defeated ${opponent.name}!`
                : `${opponent.name} defeated you!`}
            </p>
          </div>

          {/* Rewards (only if victory) */}
          {isVictory && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-gray-800 mb-3 text-center">Rewards Earned</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">💰 Gold:</span>
                  <span className="font-bold text-yellow-600 text-xl">
                    +{formatNumber(result.gold_reward)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">⭐ Experience:</span>
                  <span className="font-bold text-blue-600">+{result.xp_reward}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">📈 Rating:</span>
                  <span className={`font-bold ${result.attacker_rating_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.attacker_rating_change > 0 ? '+' : ''}{result.attacker_rating_change}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Rating Change (if defeat) */}
          {!isVictory && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">📉 Rating Change:</span>
                <span className="font-bold text-red-600">
                  {result.attacker_rating_change}
                </span>
              </div>
            </div>
          )}

          {/* Battle Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-gray-800 mb-2 text-sm">Battle Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Turns:</span>
                <span className="font-semibold">{result.battle_log.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your HP Remaining:</span>
                <span className="font-semibold">{result.attacker_final_hp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Opponent HP Remaining:</span>
                <span className="font-semibold">{result.defender_final_hp}</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            {isVictory ? 'Claim Victory!' : 'Back to Arena'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
