'use client';

import { useState } from 'react';
import { Equipment } from '@/lib/types/database';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { getRarityColor, getRarityBgColor } from '@/lib/utils/format';

interface EquipmentDetailModalProps {
  equipment: Equipment;
  lizardId: string;
  isEquipped: boolean;
  onClose: () => void;
}

export default function EquipmentDetailModal({
  equipment,
  lizardId,
  isEquipped,
  onClose,
}: EquipmentDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const getSlotEmoji = (slot: string) => {
    switch (slot) {
      case 'weapon':
        return '⚔️';
      case 'armor':
        return '🛡️';
      case 'accessory':
        return '💍';
      default:
        return '❓';
    }
  };

  const handleEquip = async () => {
    setLoading(true);

    try {
      // First, unequip any item in this slot
      await supabase
        .from('equipment')
        .update({ equipped: false })
        .eq('lizard_id', lizardId)
        .eq('slot', equipment.slot)
        .eq('equipped', true);

      // Then equip this item
      const { error } = await supabase
        .from('equipment')
        .update({ equipped: true })
        .eq('id', equipment.id);

      if (error) throw error;

      router.refresh();
      onClose();
    } catch (error) {
      console.error('Failed to equip:', error);
      alert('Failed to equip item');
    } finally {
      setLoading(false);
    }
  };

  const handleUnequip = async () => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from('equipment')
        .update({ equipped: false })
        .eq('id', equipment.id);

      if (error) throw error;

      router.refresh();
      onClose();
    } catch (error) {
      console.error('Failed to unequip:', error);
      alert('Failed to unequip item');
    } finally {
      setLoading(false);
    }
  };

  // Calculate effective bonuses with upgrade level
  const effectiveMultiplier = 1 + (equipment.upgrade_level - 1) * 0.1;

  const bonuses: { label: string; value: number }[] = [];
  if (equipment.hp_bonus > 0) {
    bonuses.push({
      label: 'HP',
      value: equipment.hp_bonus * effectiveMultiplier * 100,
    });
  }
  if (equipment.attack_bonus > 0) {
    bonuses.push({
      label: 'Attack',
      value: equipment.attack_bonus * effectiveMultiplier * 100,
    });
  }
  if (equipment.defense_bonus > 0) {
    bonuses.push({
      label: 'Defense',
      value: equipment.defense_bonus * effectiveMultiplier * 100,
    });
  }
  if (equipment.critical_rate_bonus > 0) {
    bonuses.push({
      label: 'Crit Rate',
      value: equipment.critical_rate_bonus * effectiveMultiplier * 100,
    });
  }
  if (equipment.critical_damage_bonus > 0) {
    bonuses.push({
      label: 'Crit Damage',
      value: equipment.critical_damage_bonus * effectiveMultiplier * 100,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{getSlotEmoji(equipment.slot)}</div>
          <h2 className={`text-2xl font-bold mb-2 ${getRarityColor(equipment.rarity)}`}>
            {equipment.name}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getRarityBgColor(equipment.rarity)} ${getRarityColor(equipment.rarity)}`}>
              {equipment.rarity}
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">
              {equipment.slot}
            </span>
          </div>
        </div>

        {/* Status */}
        {isEquipped && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-center">
            <span className="text-green-700 font-semibold">✓ Currently Equipped</span>
          </div>
        )}

        {/* Bonuses */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-gray-800 mb-3">Stat Bonuses</h3>
          <div className="space-y-2">
            {bonuses.map((bonus, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-gray-700">{bonus.label}:</span>
                <span className="font-bold text-green-600">+{bonus.value.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upgrade Info */}
        <div className="bg-blue-50 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-700">Upgrade Level:</span>
            <span className="font-bold text-blue-600">{equipment.upgrade_level} / 10</span>
          </div>
          {equipment.upgrade_level < 10 && (
            <div className="text-xs text-gray-600">
              Next upgrade: +10% to all bonuses
            </div>
          )}
          {equipment.upgrade_level === 10 && (
            <div className="text-xs text-green-600 font-semibold">
              ✨ MAX LEVEL ✨
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
          {isEquipped ? (
            <button
              onClick={handleUnequip}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Unequipping...' : 'Unequip'}
            </button>
          ) : (
            <button
              onClick={handleEquip}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Equipping...' : 'Equip'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
