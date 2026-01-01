'use client';

import { useState } from 'react';
import { Equipment, EquipmentSlot, Rarity } from '@/lib/types/database';
import { getRarityBorderColor, getRarityColor, getRarityBgColor } from '@/lib/utils/format';
import EquipmentDetailModal from './EquipmentDetailModal';

interface EquipmentInventoryProps {
  lizardId: string;
  allEquipment: Equipment[];
  equippedItems: Equipment[];
}

export default function EquipmentInventory({
  lizardId,
  allEquipment,
  equippedItems,
}: EquipmentInventoryProps) {
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [filterSlot, setFilterSlot] = useState<EquipmentSlot | 'all'>('all');
  const [filterRarity, setFilterRarity] = useState<Rarity | 'all'>('all');

  // Filter equipment
  const filteredEquipment = allEquipment.filter((item) => {
    if (filterSlot !== 'all' && item.slot !== filterSlot) return false;
    if (filterRarity !== 'all' && item.rarity !== filterRarity) return false;
    return true;
  });

  // Sort by rarity (legendary first) then by equipped status
  const rarityOrder: Record<Rarity, number> = {
    legendary: 0,
    epic: 1,
    rare: 2,
    common: 3,
  };

  const sortedEquipment = [...filteredEquipment].sort((a, b) => {
    // Equipped items first
    if (a.equipped && !b.equipped) return -1;
    if (!a.equipped && b.equipped) return 1;
    // Then by rarity
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  const getSlotEmoji = (slot: EquipmentSlot) => {
    switch (slot) {
      case 'weapon':
        return '⚔️';
      case 'armor':
        return '🛡️';
      case 'accessory':
        return '💍';
    }
  };

  if (allEquipment.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">🎒</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Equipment Yet</h3>
        <p className="text-gray-600 mb-4">
          Win battles to earn equipment drops or visit the shop to purchase items!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">
            Inventory ({sortedEquipment.length} items)
          </h2>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {/* Slot filter */}
          <select
            value={filterSlot}
            onChange={(e) => setFilterSlot(e.target.value as EquipmentSlot | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[44px]"
          >
            <option value="all">All Slots</option>
            <option value="weapon">⚔️ Weapons</option>
            <option value="armor">🛡️ Armor</option>
            <option value="accessory">💍 Accessories</option>
          </select>

          {/* Rarity filter */}
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value as Rarity | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-[44px]"
          >
            <option value="all">All Rarities</option>
            <option value="legendary">Legendary</option>
            <option value="epic">Epic</option>
            <option value="rare">Rare</option>
            <option value="common">Common</option>
          </select>
        </div>

        {/* Equipment grid */}
        <div className="grid grid-cols-2 gap-3">
          {sortedEquipment.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`relative border-2 ${getRarityBorderColor(item.rarity)} ${getRarityBgColor(item.rarity)} rounded-xl p-3 text-left hover:scale-105 transition-transform`}
            >
              {/* Equipped badge */}
              {item.equipped && (
                <div className="absolute top-1 right-1 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  ✓
                </div>
              )}

              {/* Slot emoji */}
              <div className="text-3xl mb-2">{getSlotEmoji(item.slot)}</div>

              {/* Item name */}
              <div className={`font-bold text-sm ${getRarityColor(item.rarity)} mb-1`}>
                {item.name}
              </div>

              {/* Rarity */}
              <div className="text-xs text-gray-600 capitalize mb-1">{item.rarity}</div>

              {/* Level */}
              <div className="text-xs text-gray-500">Lvl {item.upgrade_level}/10</div>

              {/* Top stat */}
              {item.attack_bonus > 0 && (
                <div className="text-xs font-semibold text-green-600 mt-1">
                  +{(item.attack_bonus * 100).toFixed(0)}% ATK
                </div>
              )}
              {item.hp_bonus > 0 && (
                <div className="text-xs font-semibold text-green-600 mt-1">
                  +{(item.hp_bonus * 100).toFixed(0)}% HP
                </div>
              )}
              {item.defense_bonus > 0 && (
                <div className="text-xs font-semibold text-green-600 mt-1">
                  +{(item.defense_bonus * 100).toFixed(0)}% DEF
                </div>
              )}
              {item.critical_rate_bonus > 0 && (
                <div className="text-xs font-semibold text-green-600 mt-1">
                  +{(item.critical_rate_bonus * 100).toFixed(0)}% Crit
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Detail Modal */}
      {selectedItem && (
        <EquipmentDetailModal
          equipment={selectedItem}
          lizardId={lizardId}
          isEquipped={selectedItem.equipped}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </>
  );
}
