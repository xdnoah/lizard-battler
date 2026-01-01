'use client';

import { useState } from 'react';
import { Lizard, LizardLocation } from '@/lib/types/database';
import Link from 'next/link';

interface StatsPanelProps {
  lizard: Lizard;
  location: LizardLocation;
}

export default function StatsPanel({ lizard, location }: StatsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  // Calculate location bonuses
  const locationBonuses = {
    attack: (location.gym_hours * 1.0) + (location.dojo_hours * 0.5) + (location.temple_hours * 0.5),
    hp: (location.spa_hours * 1.5) + (location.temple_hours * 0.5),
    defense: (location.dojo_hours * 0.5) + (location.temple_hours * 0.5),
    critDamage: (location.gym_hours * 0.25) + (location.temple_hours * 0.5),
    attackSpeed: location.speed_track_hours * 2,
    passiveGold: location.library_hours * 2.0,
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📊</span>
          <div className="text-left">
            <h2 className="text-lg font-bold text-gray-800">Stats & Info</h2>
            <p className="text-xs text-gray-500">Tap to {expanded ? 'collapse' : 'expand'}</p>
          </div>
        </div>
        <span className="text-gray-400 text-xl">
          {expanded ? '▼' : '▶'}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="p-4 pt-0 border-t border-gray-100">
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Rating</div>
              <div className="text-xl font-bold text-blue-600">{lizard.rating}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs text-gray-600 mb-1">Win Rate</div>
              <div className="text-xl font-bold text-green-600">
                {lizard.wins + lizard.losses > 0
                  ? Math.round((lizard.wins / (lizard.wins + lizard.losses)) * 100)
                  : 0}
                %
              </div>
            </div>
          </div>

          {/* Battle record */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Battle Record</h3>
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-gray-600">Wins:</span>
                <span className="ml-1 font-bold text-green-600">{lizard.wins}</span>
              </div>
              <div>
                <span className="text-gray-600">Losses:</span>
                <span className="ml-1 font-bold text-red-600">{lizard.losses}</span>
              </div>
              <div>
                <span className="text-gray-600">Streak:</span>
                <span className="ml-1 font-bold text-yellow-600">
                  {lizard.current_win_streak}
                  {lizard.current_win_streak > 0 ? ' 🔥' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Location bonuses */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Location Bonuses</h3>
            <div className="space-y-1 text-sm">
              {locationBonuses.attack > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Attack:</span>
                  <span className="font-semibold text-green-600">+{locationBonuses.attack.toFixed(1)}%</span>
                </div>
              )}
              {locationBonuses.hp > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">HP:</span>
                  <span className="font-semibold text-green-600">+{locationBonuses.hp.toFixed(1)}%</span>
                </div>
              )}
              {locationBonuses.defense > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Defense:</span>
                  <span className="font-semibold text-green-600">+{locationBonuses.defense.toFixed(1)}%</span>
                </div>
              )}
              {locationBonuses.critDamage > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Crit Damage:</span>
                  <span className="font-semibold text-green-600">+{locationBonuses.critDamage.toFixed(1)}%</span>
                </div>
              )}
              {locationBonuses.attackSpeed > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Attack Speed:</span>
                  <span className="font-semibold text-green-600">+{locationBonuses.attackSpeed.toFixed(0)}</span>
                </div>
              )}
              {locationBonuses.passiveGold > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Passive Gold:</span>
                  <span className="font-semibold text-green-600">+{locationBonuses.passiveGold.toFixed(1)}%</span>
                </div>
              )}
              {Object.values(locationBonuses).every((v) => v === 0) && (
                <p className="text-gray-500 text-center py-2">No location bonuses yet!</p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/location"
              className="bg-green-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Location
            </Link>
            <Link
              href="/battle"
              className="bg-red-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Battle
            </Link>
            <Link
              href="/equipment"
              className="bg-purple-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Equipment
            </Link>
            <Link
              href="/leaderboard"
              className="bg-yellow-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-yellow-700 transition-colors"
            >
              Leaderboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
