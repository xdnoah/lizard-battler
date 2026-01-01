-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Players table (extends auth.users)
CREATE TABLE players (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lizards table
CREATE TABLE lizards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  appearance_id INT DEFAULT 1 CHECK (appearance_id >= 1 AND appearance_id <= 5),

  -- Progression
  level INT DEFAULT 1 CHECK (level >= 1 AND level <= 100),
  xp BIGINT DEFAULT 0,
  gold BIGINT DEFAULT 0,

  -- Tamagotchi
  happiness INT DEFAULT 100 CHECK (happiness >= 0 AND happiness <= 100),
  last_fed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_played TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_rested TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Passive Income
  last_gold_collection TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- PvP Stats
  rating INT DEFAULT 1000,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  current_win_streak INT DEFAULT 0,
  best_win_streak INT DEFAULT 0,
  battles_today INT DEFAULT 0,
  last_battle_date DATE DEFAULT CURRENT_DATE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Level Stats Reference Table
CREATE TABLE level_stats (
  level INT PRIMARY KEY CHECK (level >= 1 AND level <= 100),
  upgrade_cost BIGINT NOT NULL,
  hp INT NOT NULL,
  attack INT NOT NULL,
  defense INT NOT NULL,
  critical_rate DECIMAL(5,2) NOT NULL,
  critical_damage DECIMAL(5,2) NOT NULL,
  attack_speed INT NOT NULL,
  passive_gold_per_second INT NOT NULL
);

-- Lizard Locations
CREATE TABLE lizard_locations (
  lizard_id UUID PRIMARY KEY REFERENCES lizards(id) ON DELETE CASCADE,
  current_location TEXT NOT NULL DEFAULT 'home' CHECK (current_location IN (
    'home', 'gym', 'spa', 'library', 'speed_track', 'dojo', 'temple'
  )),
  location_since TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Track total hours at each location
  home_hours DECIMAL(10,2) DEFAULT 0,
  gym_hours DECIMAL(10,2) DEFAULT 0,
  spa_hours DECIMAL(10,2) DEFAULT 0,
  library_hours DECIMAL(10,2) DEFAULT 0,
  speed_track_hours DECIMAL(10,2) DEFAULT 0,
  dojo_hours DECIMAL(10,2) DEFAULT 0,
  temple_hours DECIMAL(10,2) DEFAULT 0,

  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Location Stats Reference Table
CREATE TABLE location_stats (
  location_name TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT NOT NULL,

  -- Bonuses per hour
  attack_per_hour DECIMAL(5,2) DEFAULT 0,
  hp_per_hour DECIMAL(5,2) DEFAULT 0,
  defense_per_hour DECIMAL(5,2) DEFAULT 0,
  critical_damage_per_hour DECIMAL(5,2) DEFAULT 0,
  attack_speed_per_hour DECIMAL(5,2) DEFAULT 0,
  passive_gold_per_hour DECIMAL(5,2) DEFAULT 0
);

-- Equipment
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lizard_id UUID REFERENCES lizards(id) ON DELETE CASCADE,
  slot TEXT CHECK (slot IN ('weapon', 'armor', 'accessory')),
  name TEXT NOT NULL,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),

  -- Stat bonuses (stored as decimals, e.g., 0.10 = 10%)
  hp_bonus DECIMAL(5,2) DEFAULT 0,
  attack_bonus DECIMAL(5,2) DEFAULT 0,
  defense_bonus DECIMAL(5,2) DEFAULT 0,
  critical_rate_bonus DECIMAL(5,2) DEFAULT 0,
  critical_damage_bonus DECIMAL(5,2) DEFAULT 0,

  upgrade_level INT DEFAULT 1 CHECK (upgrade_level >= 1 AND upgrade_level <= 10),
  equipped BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure only one equipped item per slot per lizard
CREATE UNIQUE INDEX idx_one_equipped_per_slot
ON equipment(lizard_id, slot)
WHERE equipped = TRUE;

-- Battle History
CREATE TABLE battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_id UUID REFERENCES lizards(id) ON DELETE SET NULL,
  defender_id UUID REFERENCES lizards(id) ON DELETE SET NULL,
  winner_id UUID REFERENCES lizards(id) ON DELETE SET NULL,

  -- Battle details
  battle_log JSONB NOT NULL,
  rating_change_attacker INT,
  rating_change_defender INT,
  gold_reward INT,
  xp_reward INT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_battles_attacker ON battles(attacker_id, created_at DESC);
CREATE INDEX idx_battles_defender ON battles(defender_id, created_at DESC);

-- Battle Cooldowns
CREATE TABLE battle_cooldowns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attacker_id UUID REFERENCES lizards(id) ON DELETE CASCADE,
  defender_id UUID REFERENCES lizards(id) ON DELETE CASCADE,
  can_battle_again_at TIMESTAMP WITH TIME ZONE NOT NULL,

  UNIQUE(attacker_id, defender_id)
);

CREATE INDEX idx_cooldowns_expiry ON battle_cooldowns(can_battle_again_at);

-- Global Chat
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  lizard_level INT NOT NULL,
  location_emoji TEXT NOT NULL,
  message TEXT NOT NULL CHECK (LENGTH(message) <= 200),
  reported BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_chat_recent ON chat_messages(created_at DESC);

-- Shop Inventory
CREATE TABLE shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot TEXT CHECK (slot IN ('weapon', 'armor', 'accessory')),
  name TEXT NOT NULL,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  price BIGINT NOT NULL,

  -- Same stat structure as equipment
  hp_bonus DECIMAL(5,2) DEFAULT 0,
  attack_bonus DECIMAL(5,2) DEFAULT 0,
  defense_bonus DECIMAL(5,2) DEFAULT 0,
  critical_rate_bonus DECIMAL(5,2) DEFAULT 0,
  critical_damage_bonus DECIMAL(5,2) DEFAULT 0,

  available_until TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_shop_available ON shop_items(available_until);

-- Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE lizards ENABLE ROW LEVEL SECURITY;
ALTER TABLE lizard_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_cooldowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Players
CREATE POLICY "Players are viewable by everyone" ON players
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own player" ON players
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own player" ON players
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for Lizards
CREATE POLICY "Lizards are viewable by everyone" ON lizards
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own lizard" ON lizards
  FOR INSERT WITH CHECK (auth.uid() = (SELECT id FROM players WHERE id = player_id));

CREATE POLICY "Users can update their own lizard" ON lizards
  FOR UPDATE USING (auth.uid() = (SELECT id FROM players WHERE id = player_id));

CREATE POLICY "Users can delete their own lizard" ON lizards
  FOR DELETE USING (auth.uid() = (SELECT id FROM players WHERE id = player_id));

-- RLS Policies for Lizard Locations
CREATE POLICY "Lizard locations are viewable by everyone" ON lizard_locations
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own lizard location" ON lizard_locations
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT player_id FROM lizards WHERE id = lizard_id)
  );

CREATE POLICY "Users can update their own lizard location" ON lizard_locations
  FOR UPDATE USING (
    auth.uid() = (SELECT player_id FROM lizards WHERE id = lizard_id)
  );

-- RLS Policies for Equipment
CREATE POLICY "Equipment is viewable by everyone" ON equipment
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own equipment" ON equipment
  FOR INSERT WITH CHECK (
    auth.uid() = (SELECT player_id FROM lizards WHERE id = lizard_id)
  );

CREATE POLICY "Users can update their own equipment" ON equipment
  FOR UPDATE USING (
    auth.uid() = (SELECT player_id FROM lizards WHERE id = lizard_id)
  );

CREATE POLICY "Users can delete their own equipment" ON equipment
  FOR DELETE USING (
    auth.uid() = (SELECT player_id FROM lizards WHERE id = lizard_id)
  );

-- RLS Policies for Battles
CREATE POLICY "Battles are viewable by everyone" ON battles
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create battles" ON battles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for Battle Cooldowns
CREATE POLICY "Battle cooldowns are viewable by owner" ON battle_cooldowns
  FOR SELECT USING (
    auth.uid() = (SELECT player_id FROM lizards WHERE id = attacker_id)
  );

CREATE POLICY "Authenticated users can create cooldowns" ON battle_cooldowns
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for Chat Messages
CREATE POLICY "Chat messages are viewable by everyone" ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own messages" ON chat_messages
  FOR DELETE USING (auth.uid() = player_id);

-- RLS Policies for Shop Items
CREATE POLICY "Shop items are viewable by everyone" ON shop_items
  FOR SELECT USING (true);
