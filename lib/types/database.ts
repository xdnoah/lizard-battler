// Database Types

export type LocationName = 'home' | 'gym' | 'spa' | 'library' | 'speed_track' | 'dojo' | 'temple';
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CareAction = 'feed' | 'play' | 'rest';

export interface Player {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

export interface Lizard {
  id: string;
  player_id: string;
  name: string;
  appearance_id: number;
  level: number;
  xp: number;
  gold: number;
  happiness: number;
  last_fed: string;
  last_played: string;
  last_rested: string;
  last_gold_collection: string;
  rating: number;
  wins: number;
  losses: number;
  current_win_streak: number;
  best_win_streak: number;
  battles_today: number;
  last_battle_date: string;
  created_at: string;
  updated_at: string;
}

export interface LevelStats {
  level: number;
  upgrade_cost: number;
  hp: number;
  attack: number;
  defense: number;
  critical_rate: number;
  critical_damage: number;
  attack_speed: number;
  passive_gold_per_second: number;
}

export interface LizardLocation {
  lizard_id: string;
  current_location: LocationName;
  location_since: string;
  home_hours: number;
  gym_hours: number;
  spa_hours: number;
  library_hours: number;
  speed_track_hours: number;
  dojo_hours: number;
  temple_hours: number;
  updated_at: string;
}

export interface LocationStats {
  location_name: LocationName;
  display_name: string;
  emoji: string;
  description: string;
  attack_per_hour: number;
  hp_per_hour: number;
  defense_per_hour: number;
  critical_damage_per_hour: number;
  attack_speed_per_hour: number;
  passive_gold_per_hour: number;
}

export interface Equipment {
  id: string;
  lizard_id: string;
  slot: EquipmentSlot;
  name: string;
  rarity: Rarity;
  hp_bonus: number;
  attack_bonus: number;
  defense_bonus: number;
  critical_rate_bonus: number;
  critical_damage_bonus: number;
  upgrade_level: number;
  equipped: boolean;
  created_at: string;
}

export interface Battle {
  id: string;
  attacker_id: string;
  defender_id: string;
  winner_id: string;
  battle_log: BattleTurn[];
  rating_change_attacker: number;
  rating_change_defender: number;
  gold_reward: number;
  xp_reward: number;
  created_at: string;
}

export interface BattleTurn {
  turn: number;
  attacker: 'attacker' | 'defender';
  damage: number;
  critical: boolean;
  attacker_hp_remaining?: number;
  defender_hp_remaining?: number;
}

export interface BattleCooldown {
  id: string;
  attacker_id: string;
  defender_id: string;
  can_battle_again_at: string;
}

export interface ChatMessage {
  id: string;
  player_id: string;
  username: string;
  lizard_level: number;
  location_emoji: string;
  message: string;
  reported: boolean;
  created_at: string;
}

export interface ShopItem {
  id: string;
  slot: EquipmentSlot;
  name: string;
  rarity: Rarity;
  price: number;
  hp_bonus: number;
  attack_bonus: number;
  defense_bonus: number;
  critical_rate_bonus: number;
  critical_damage_bonus: number;
  available_until: string;
  created_at: string;
}

export interface EffectiveStats {
  hp: number;
  attack: number;
  defense: number;
  critical_rate: number;
  critical_damage: number;
  attack_speed: number;
  happiness_multiplier: number;
}

export interface LocationBonuses {
  attack_bonus: number;
  hp_bonus: number;
  defense_bonus: number;
  critical_damage_bonus: number;
  attack_speed_bonus: number;
  passive_gold_bonus: number;
}
