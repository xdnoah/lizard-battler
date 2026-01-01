'use client';

import { Equipment } from '@/lib/types/database';
import { getRarityBorderColor, getRarityColor } from '@/lib/utils/format';
import EquipmentDetailModal from './EquipmentDetailModal';
import { useState } from 'react';

interface EquipmentSlotsProps {
  lizardId: string;
  equippedItems: Equipment[];
}

export default function EquipmentSlots({ lizardId, equippedItems }: EquipmentSlotsProps) {
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);

  const getEquippedItem = (slot: string) => {
    return equippedItems.find((item) => item.slot === slot);
  };

  const weaponItem = getEquippedItem('weapon');
  const armorItem = getEquippedItem('armor');
  const accessoryItem = getEquippedItem('accessory');

  const renderSlot = (slot: string, emoji: string, label: string, item?: Equipment) => {
    if (!item) {
      // Empty slot
      return (
        <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
          <div className="text-4xl mb-2 opacity-30">{emoji}</div>
          <div className="text-sm font-semibold text-gray-500">{label}</div>
          <div className="text-xs text-gray-400 mt-1">Empty</div>
        </div>
      );
    }

    // Equipped item
    return (
      <button
        onClick={() => setSelectedItem(item)}
        className={`border-2 ${getRarityBorderColor(item.rarity)} rounded-xl p-4 text-center hover:scale-105 transition-transform bg-white`}
      >
        <div className="text-4xl mb-2">{emoji}</div>
        <div className={`text-sm font-bold ${getRarityColor(item.rarity)}`}>
          {item.name}
        </div>
        <div className="text-xs text-gray-500 mt-1 capitalize">{item.rarity}</div>
        <div className="text-xs text-gray-400 mt-1">Lvl {item.upgrade_level}</div>
      </button>
    );
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Equipped Items</h2>
        <div className="grid grid-cols-3 gap-3">
          {renderSlot('weapon', '⚔️', 'Weapon', weaponItem)}
          {renderSlot('armor', '🛡️', 'Armor', armorItem)}
          {renderSlot('accessory', '💍', 'Accessory', accessoryItem)}
        </div>
      </div>

      {/* Equipment Detail Modal */}
      {selectedItem && (
        <EquipmentDetailModal
          equipment={selectedItem}
          lizardId={lizardId}
          isEquipped={true}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
