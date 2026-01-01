import { SupabaseClient } from '@supabase/supabase-js';
import type {
  Lizard,
  LizardLocation,
  LocationStats,
  Equipment,
  ChatMessage,
  Battle,
  ShopItem,
  Player,
  LevelStats,
} from '../types/database';

// Player queries
export async function getPlayer(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as Player;
}

export async function createPlayer(supabase: SupabaseClient, userId: string, username: string, email: string) {
  const { data, error } = await supabase
    .from('players')
    .insert({ id: userId, username, email })
    .select()
    .single();

  if (error) throw error;
  return data as Player;
}

// Lizard queries
export async function getMyLizard(supabase: SupabaseClient, playerId: string) {
  const { data, error } = await supabase
    .from('lizards')
    .select('*')
    .eq('player_id', playerId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data as Lizard | null;
}

export async function getLizard(supabase: SupabaseClient, lizardId: string) {
  const { data, error } = await supabase
    .from('lizards')
    .select('*')
    .eq('id', lizardId)
    .single();

  if (error) throw error;
  return data as Lizard;
}

export async function createLizard(
  supabase: SupabaseClient,
  playerId: string,
  name: string,
  appearanceId: number
) {
  const { data, error } = await supabase
    .from('lizards')
    .insert({
      player_id: playerId,
      name,
      appearance_id: appearanceId,
    })
    .select()
    .single();

  if (error) throw error;

  // Also create lizard_location entry
  await supabase
    .from('lizard_locations')
    .insert({ lizard_id: data.id });

  return data as Lizard;
}

// Location queries
export async function getLizardLocation(supabase: SupabaseClient, lizardId: string) {
  const { data, error } = await supabase
    .from('lizard_locations')
    .select('*')
    .eq('lizard_id', lizardId)
    .single();

  if (error) throw error;
  return data as LizardLocation;
}

export async function getAllLocations(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('location_stats')
    .select('*')
    .order('location_name');

  if (error) throw error;
  return data as LocationStats[];
}

// Equipment queries
export async function getMyEquipment(supabase: SupabaseClient, lizardId: string) {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('lizard_id', lizardId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Equipment[];
}

export async function getEquippedItems(supabase: SupabaseClient, lizardId: string) {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .eq('lizard_id', lizardId)
    .eq('equipped', true);

  if (error) throw error;
  return data as Equipment[];
}

// Level stats queries
export async function getLevelStats(supabase: SupabaseClient, level: number) {
  const { data, error } = await supabase
    .from('level_stats')
    .select('*')
    .eq('level', level)
    .single();

  if (error) throw error;
  return data as LevelStats;
}

// Battle queries
export async function getMyBattles(supabase: SupabaseClient, lizardId: string, limit = 20) {
  const { data, error } = await supabase
    .from('battles')
    .select('*')
    .or(`attacker_id.eq.${lizardId},defender_id.eq.${lizardId}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Battle[];
}

export async function getAvailableOpponents(
  supabase: SupabaseClient,
  myLizardId: string,
  limit = 20
) {
  // Get lizards with similar rating
  const { data, error } = await supabase
    .from('lizards')
    .select('*')
    .neq('id', myLizardId)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Lizard[];
}

// Chat queries
export async function getRecentMessages(supabase: SupabaseClient, limit = 50) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as ChatMessage[]).reverse(); // Reverse to show oldest first
}

export async function sendChatMessage(
  supabase: SupabaseClient,
  playerId: string,
  username: string,
  lizardLevel: number,
  locationEmoji: string,
  message: string
) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      player_id: playerId,
      username,
      lizard_level: lizardLevel,
      location_emoji: locationEmoji,
      message,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ChatMessage;
}

// Shop queries
export async function getShopItems(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('shop_items')
    .select('*')
    .gt('available_until', new Date().toISOString())
    .order('rarity', { ascending: false });

  if (error) throw error;
  return data as ShopItem[];
}

// Leaderboard queries
export async function getLeaderboard(supabase: SupabaseClient, limit = 100) {
  const { data, error } = await supabase
    .from('lizards')
    .select('*, players!inner(username)')
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Database function calls
export async function callUpdateLocationProgress(supabase: SupabaseClient, lizardId: string) {
  const { error } = await supabase.rpc('update_location_progress', {
    lizard_uuid: lizardId,
  });

  if (error) throw error;
}

export async function callSwitchLocation(
  supabase: SupabaseClient,
  lizardId: string,
  newLocation: string
) {
  const { data, error } = await supabase.rpc('switch_location', {
    lizard_uuid: lizardId,
    new_location: newLocation,
  });

  if (error) throw error;
  return data;
}

export async function callCollectPassiveGold(supabase: SupabaseClient, lizardId: string) {
  const { data, error } = await supabase.rpc('collect_passive_gold', {
    lizard_uuid: lizardId,
  });

  if (error) throw error;
  return data;
}

export async function callLevelUp(supabase: SupabaseClient, lizardId: string) {
  const { data, error } = await supabase.rpc('level_up_lizard', {
    lizard_uuid: lizardId,
  });

  if (error) throw error;
  return data;
}

export async function callCalculateEffectiveStats(supabase: SupabaseClient, lizardId: string) {
  const { data, error } = await supabase.rpc('calculate_effective_stats', {
    lizard_uuid: lizardId,
  });

  if (error) throw error;
  return data;
}

export async function callPerformCareAction(
  supabase: SupabaseClient,
  lizardId: string,
  actionType: 'feed' | 'play' | 'rest'
) {
  const { data, error } = await supabase.rpc('perform_care_action', {
    lizard_uuid: lizardId,
    action_type: actionType,
  });

  if (error) throw error;
  return data;
}

export async function callResolveBattle(
  supabase: SupabaseClient,
  attackerId: string,
  defenderId: string
) {
  const { data, error } = await supabase.rpc('resolve_battle', {
    attacker_uuid: attackerId,
    defender_uuid: defenderId,
  });

  if (error) throw error;
  return data;
}
