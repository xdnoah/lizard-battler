import { createClient } from '@/lib/supabase/server';
import { getMyLizard, getMyEquipment, getEquippedItems } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';
import EquipmentSlots from '@/components/game/EquipmentSlots';
import EquipmentInventory from '@/components/game/EquipmentInventory';
import Link from 'next/link';

export default async function EquipmentPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get player
  const { data: playerData } = await supabase
    .from('players')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!playerData) {
    redirect('/auth/login');
  }

  // Get lizard
  const lizard = await getMyLizard(supabase, playerData.id);

  if (!lizard) {
    redirect('/onboarding');
  }

  // Get all equipment
  const allEquipment = await getMyEquipment(supabase, lizard.id);
  const equippedItems = await getEquippedItems(supabase, lizard.id);

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-600 mb-2">Equipment</h1>
        <p className="text-gray-600">Equip items to boost your stats</p>
      </div>

      {/* Gold Display */}
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-semibold">Your Gold:</span>
          <span className="text-2xl font-bold text-yellow-600">
            💰 {lizard.gold.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Equipment Slots */}
      <EquipmentSlots
        lizardId={lizard.id}
        equippedItems={equippedItems}
      />

      {/* Shop Button */}
      <div className="mb-6">
        <Link
          href="/shop"
          className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-4 rounded-xl font-bold text-lg shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          🏪 Visit Shop
        </Link>
      </div>

      {/* Inventory */}
      <EquipmentInventory
        lizardId={lizard.id}
        allEquipment={allEquipment}
        equippedItems={equippedItems}
      />

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
        <h3 className="font-semibold text-blue-800 mb-2">Equipment Tips:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Equip items to boost your battle stats</li>
          <li>• Higher rarity = better bonuses</li>
          <li>• Upgrade equipment to increase bonuses</li>
          <li>• Only one item per slot can be equipped</li>
        </ul>
      </div>
    </div>
  );
}
