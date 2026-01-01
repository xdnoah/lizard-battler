'use client';

import { useState } from 'react';
import { LocationStats } from '@/lib/types/database';
import { createClient } from '@/lib/supabase/client';
import { callSwitchLocation } from '@/lib/supabase/queries';
import { useRouter } from 'next/navigation';

interface LocationCardProps {
  location: LocationStats;
  hoursSpent: number;
  isCurrentLocation: boolean;
  lizardId: string;
}

export default function LocationCard({
  location,
  hoursSpent,
  isCurrentLocation,
  lizardId,
}: LocationCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Calculate bonuses
  const bonuses: string[] = [];
  if (location.attack_per_hour > 0) {
    bonuses.push(`+${location.attack_per_hour}% ATK/hour`);
  }
  if (location.hp_per_hour > 0) {
    bonuses.push(`+${location.hp_per_hour}% HP/hour`);
  }
  if (location.defense_per_hour > 0) {
    bonuses.push(`+${location.defense_per_hour}% DEF/hour`);
  }
  if (location.critical_damage_per_hour > 0) {
    bonuses.push(`+${location.critical_damage_per_hour}% Crit Dmg/hour`);
  }
  if (location.attack_speed_per_hour > 0) {
    bonuses.push(`+${location.attack_speed_per_hour} Atk Speed/hour`);
  }
  if (location.passive_gold_per_hour > 0) {
    bonuses.push(`+${location.passive_gold_per_hour}% Gold/hour`);
  }

  // Calculate total bonuses earned
  const totalBonuses: string[] = [];
  if (location.attack_per_hour > 0 && hoursSpent > 0) {
    totalBonuses.push(`+${(hoursSpent * location.attack_per_hour).toFixed(1)}% ATK`);
  }
  if (location.hp_per_hour > 0 && hoursSpent > 0) {
    totalBonuses.push(`+${(hoursSpent * location.hp_per_hour).toFixed(1)}% HP`);
  }
  if (location.defense_per_hour > 0 && hoursSpent > 0) {
    totalBonuses.push(`+${(hoursSpent * location.defense_per_hour).toFixed(1)}% DEF`);
  }
  if (location.critical_damage_per_hour > 0 && hoursSpent > 0) {
    totalBonuses.push(`+${(hoursSpent * location.critical_damage_per_hour).toFixed(1)}% Crit Dmg`);
  }
  if (location.attack_speed_per_hour > 0 && hoursSpent > 0) {
    totalBonuses.push(`+${(hoursSpent * location.attack_speed_per_hour).toFixed(0)} Atk Speed`);
  }
  if (location.passive_gold_per_hour > 0 && hoursSpent > 0) {
    totalBonuses.push(`+${(hoursSpent * location.passive_gold_per_hour).toFixed(1)}% Gold`);
  }

  const handleSwitch = async () => {
    setLoading(true);

    try {
      await callSwitchLocation(supabase, lizardId, location.location_name);
      setShowConfirm(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to switch location:', error);
      alert('Failed to switch location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={`rounded-xl border-2 transition-all ${
          isCurrentLocation
            ? 'border-green-500 bg-green-50'
            : 'border-gray-200 bg-white hover:border-green-300'
        }`}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{location.emoji}</span>
              <div>
                <h3 className="font-bold text-lg">{location.display_name}</h3>
                {isCurrentLocation && (
                  <span className="text-xs font-semibold text-green-600">ACTIVE</span>
                )}
              </div>
            </div>
            {!isCurrentLocation ? (
              <button
                onClick={() => setShowConfirm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors min-w-[80px] min-h-[44px]"
              >
                Switch
              </button>
            ) : (
              <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold min-w-[80px] min-h-[44px] flex items-center justify-center">
                ✓ Here
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3">{location.description}</p>

          {/* Bonuses */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="text-xs font-semibold text-gray-700 mb-1">Bonuses per hour:</div>
            <div className="flex flex-wrap gap-2">
              {bonuses.length > 0 ? (
                bonuses.map((bonus, idx) => (
                  <span key={idx} className="text-xs bg-white px-2 py-1 rounded">
                    {bonus}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">No bonuses (safe haven)</span>
              )}
            </div>
          </div>

          {/* Your progress */}
          <div className="text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Your progress:</span>
              <span className="font-semibold">
                {hoursSpent > 0 ? `${hoursSpent.toFixed(1)}h` : 'Never visited'}
              </span>
            </div>
            {totalBonuses.length > 0 && (
              <div className="mt-1 text-xs text-green-600 font-semibold">
                {totalBonuses.join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Switch to {location.display_name}?
            </h2>

            <div className="space-y-3 mb-6 text-sm">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="font-semibold text-blue-800 mb-1">You'll start earning:</div>
                <div className="text-blue-700">
                  {bonuses.length > 0 ? bonuses.join(', ') : 'Peace and quiet (no bonuses)'}
                </div>
              </div>

              {!isCurrentLocation && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                  <div className="font-semibold text-yellow-800 mb-1">⚠️ Important:</div>
                  <div className="text-yellow-700">
                    Only FULL hours at your current location will count. Any partial hour will be lost!
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-semibold text-gray-700 mb-1">Your {location.display_name} progress:</div>
                <div className="text-gray-600">
                  {hoursSpent > 0 ? (
                    <>
                      {hoursSpent.toFixed(1)} hours total
                      {totalBonuses.length > 0 && (
                        <div className="text-green-600 font-semibold mt-1">
                          {totalBonuses.join(', ')}
                        </div>
                      )}
                    </>
                  ) : (
                    'First time visiting!'
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSwitch}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Switching...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
