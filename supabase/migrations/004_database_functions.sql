-- Database Functions for Lizard Auto-Battler

-- 1. Update location progress (saves completed hours)
CREATE OR REPLACE FUNCTION update_location_progress(lizard_uuid UUID)
RETURNS VOID AS $$
DECLARE
  location_since_ts TIMESTAMP WITH TIME ZONE;
  hours_elapsed DECIMAL(10,2);
  current_loc TEXT;
BEGIN
  -- Get current location info
  SELECT current_location, location_since
  INTO current_loc, location_since_ts
  FROM lizard_locations
  WHERE lizard_id = lizard_uuid;

  -- Calculate hours elapsed (truncate to full hours only)
  hours_elapsed := FLOOR(EXTRACT(EPOCH FROM (NOW() - location_since_ts)) / 3600);

  -- Only update if at least 1 hour has passed
  IF hours_elapsed >= 1 THEN
    -- Update the appropriate location hours column
    CASE current_loc
      WHEN 'home' THEN
        UPDATE lizard_locations SET home_hours = home_hours + hours_elapsed WHERE lizard_id = lizard_uuid;
      WHEN 'gym' THEN
        UPDATE lizard_locations SET gym_hours = gym_hours + hours_elapsed WHERE lizard_id = lizard_uuid;
      WHEN 'spa' THEN
        UPDATE lizard_locations SET spa_hours = spa_hours + hours_elapsed WHERE lizard_id = lizard_uuid;
      WHEN 'library' THEN
        UPDATE lizard_locations SET library_hours = library_hours + hours_elapsed WHERE lizard_id = lizard_uuid;
      WHEN 'speed_track' THEN
        UPDATE lizard_locations SET speed_track_hours = speed_track_hours + hours_elapsed WHERE lizard_id = lizard_uuid;
      WHEN 'dojo' THEN
        UPDATE lizard_locations SET dojo_hours = dojo_hours + hours_elapsed WHERE lizard_id = lizard_uuid;
      WHEN 'temple' THEN
        UPDATE lizard_locations SET temple_hours = temple_hours + hours_elapsed WHERE lizard_id = lizard_uuid;
    END CASE;

    -- Reset location_since to account for counted hours
    UPDATE lizard_locations
    SET location_since = location_since + (hours_elapsed || ' hours')::INTERVAL,
        updated_at = NOW()
    WHERE lizard_id = lizard_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 2. Switch location
CREATE OR REPLACE FUNCTION switch_location(lizard_uuid UUID, new_location TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  hours_lost DECIMAL(10,2);
  old_location TEXT;
BEGIN
  -- First, update progress for current location (only full hours)
  PERFORM update_location_progress(lizard_uuid);

  -- Calculate partial hours that will be lost
  SELECT
    current_location,
    (EXTRACT(EPOCH FROM (NOW() - location_since)) / 3600) - FLOOR(EXTRACT(EPOCH FROM (NOW() - location_since)) / 3600)
  INTO old_location, hours_lost
  FROM lizard_locations
  WHERE lizard_id = lizard_uuid;

  -- Switch to new location
  UPDATE lizard_locations
  SET current_location = new_location,
      location_since = NOW(),
      updated_at = NOW()
  WHERE lizard_id = lizard_uuid;

  result := jsonb_build_object(
    'success', true,
    'old_location', old_location,
    'new_location', new_location,
    'hours_lost', ROUND(hours_lost, 2)
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. Calculate location bonuses
CREATE OR REPLACE FUNCTION calculate_location_bonuses(lizard_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  loc_hours RECORD;
  bonuses JSONB;
BEGIN
  -- Get all location hours
  SELECT *
  INTO loc_hours
  FROM lizard_locations
  WHERE lizard_id = lizard_uuid;

  -- Calculate bonuses (hours × per_hour_rate)
  bonuses := jsonb_build_object(
    'attack_bonus', (
      (loc_hours.gym_hours * 1.0) +
      (loc_hours.dojo_hours * 0.5) +
      (loc_hours.temple_hours * 0.5)
    ),
    'hp_bonus', (
      (loc_hours.spa_hours * 1.5) +
      (loc_hours.temple_hours * 0.5)
    ),
    'defense_bonus', (
      (loc_hours.dojo_hours * 0.5) +
      (loc_hours.temple_hours * 0.5)
    ),
    'critical_damage_bonus', (
      (loc_hours.gym_hours * 0.25) +
      (loc_hours.temple_hours * 0.5)
    ),
    'attack_speed_bonus', (
      loc_hours.speed_track_hours * 2
    ),
    'passive_gold_bonus', (
      loc_hours.library_hours * 2.0
    )
  );

  RETURN bonuses;
END;
$$ LANGUAGE plpgsql;

-- 4. Collect passive gold
CREATE OR REPLACE FUNCTION collect_passive_gold(lizard_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  lizard_record RECORD;
  base_rate INT;
  library_bonus DECIMAL(10,2);
  total_rate DECIMAL(10,2);
  seconds_elapsed BIGINT;
  gold_earned BIGINT;
  result JSONB;
BEGIN
  -- Get lizard info
  SELECT l.*, ll.library_hours
  INTO lizard_record
  FROM lizards l
  JOIN lizard_locations ll ON ll.lizard_id = l.id
  WHERE l.id = lizard_uuid;

  -- Get base passive gold rate from level_stats
  SELECT passive_gold_per_second
  INTO base_rate
  FROM level_stats
  WHERE level = lizard_record.level;

  -- Calculate library bonus
  library_bonus := lizard_record.library_hours * 0.02; -- 2% per hour

  -- Total rate = base × (1 + library_bonus)
  total_rate := base_rate * (1 + library_bonus);

  -- Calculate seconds since last collection
  seconds_elapsed := EXTRACT(EPOCH FROM (NOW() - lizard_record.last_gold_collection));

  -- Gold earned = seconds × rate
  gold_earned := FLOOR(seconds_elapsed * total_rate);

  -- Update lizard gold and last collection time
  UPDATE lizards
  SET gold = gold + gold_earned,
      last_gold_collection = NOW(),
      updated_at = NOW()
  WHERE id = lizard_uuid;

  result := jsonb_build_object(
    'gold_earned', gold_earned,
    'seconds_elapsed', seconds_elapsed,
    'new_total', lizard_record.gold + gold_earned
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 5. Level up lizard
CREATE OR REPLACE FUNCTION level_up_lizard(lizard_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  lizard_record RECORD;
  cost BIGINT;
  new_level INT;
  result JSONB;
BEGIN
  -- Get current lizard data
  SELECT * INTO lizard_record FROM lizards WHERE id = lizard_uuid;

  -- Check if already max level
  IF lizard_record.level >= 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already at max level');
  END IF;

  new_level := lizard_record.level + 1;

  -- Get upgrade cost
  SELECT upgrade_cost INTO cost FROM level_stats WHERE level = new_level;

  -- Check if enough gold
  IF lizard_record.gold < cost THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not enough gold');
  END IF;

  -- Deduct gold and level up
  UPDATE lizards
  SET level = new_level,
      gold = gold - cost,
      updated_at = NOW()
  WHERE id = lizard_uuid;

  result := jsonb_build_object(
    'success', true,
    'new_level', new_level,
    'cost', cost,
    'remaining_gold', lizard_record.gold - cost
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 6. Calculate effective stats
CREATE OR REPLACE FUNCTION calculate_effective_stats(lizard_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  lizard_record RECORD;
  base_stats RECORD;
  location_bonuses JSONB;
  equipment_bonuses RECORD;
  happiness_multiplier DECIMAL(5,2);
  final_stats JSONB;
BEGIN
  -- Get lizard data
  SELECT * INTO lizard_record FROM lizards WHERE id = lizard_uuid;

  -- Get base stats from level
  SELECT * INTO base_stats FROM level_stats WHERE level = lizard_record.level;

  -- Get location bonuses
  location_bonuses := calculate_location_bonuses(lizard_uuid);

  -- Get equipment bonuses (sum all equipped items)
  SELECT
    COALESCE(SUM(hp_bonus * (1 + (upgrade_level - 1) * 0.1)), 0) as hp_bonus,
    COALESCE(SUM(attack_bonus * (1 + (upgrade_level - 1) * 0.1)), 0) as attack_bonus,
    COALESCE(SUM(defense_bonus * (1 + (upgrade_level - 1) * 0.1)), 0) as defense_bonus,
    COALESCE(SUM(critical_rate_bonus * (1 + (upgrade_level - 1) * 0.1)), 0) as critical_rate_bonus,
    COALESCE(SUM(critical_damage_bonus * (1 + (upgrade_level - 1) * 0.1)), 0) as critical_damage_bonus
  INTO equipment_bonuses
  FROM equipment
  WHERE lizard_id = lizard_uuid AND equipped = true;

  -- Calculate happiness multiplier
  IF lizard_record.happiness >= 100 THEN
    happiness_multiplier := 1.2;
  ELSIF lizard_record.happiness >= 50 THEN
    happiness_multiplier := 1.0;
  ELSE
    happiness_multiplier := 0.8;
  END IF;

  -- Calculate final stats
  -- Formula: base × (1 + location%) × (1 + equipment%) × happiness
  final_stats := jsonb_build_object(
    'hp', FLOOR(
      base_stats.hp *
      (1 + (location_bonuses->>'hp_bonus')::DECIMAL / 100) *
      (1 + equipment_bonuses.hp_bonus) *
      happiness_multiplier
    ),
    'attack', FLOOR(
      base_stats.attack *
      (1 + (location_bonuses->>'attack_bonus')::DECIMAL / 100) *
      (1 + equipment_bonuses.attack_bonus) *
      happiness_multiplier
    ),
    'defense', FLOOR(
      base_stats.defense *
      (1 + (location_bonuses->>'defense_bonus')::DECIMAL / 100) *
      (1 + equipment_bonuses.defense_bonus) *
      happiness_multiplier
    ),
    'critical_rate', ROUND(
      (base_stats.critical_rate + equipment_bonuses.critical_rate_bonus * 100) *
      happiness_multiplier,
      2
    ),
    'critical_damage', ROUND(
      (base_stats.critical_damage + (location_bonuses->>'critical_damage_bonus')::DECIMAL + equipment_bonuses.critical_damage_bonus * 100) *
      happiness_multiplier,
      2
    ),
    'attack_speed', FLOOR(
      (base_stats.attack_speed + (location_bonuses->>'attack_speed_bonus')::DECIMAL) *
      happiness_multiplier
    ),
    'happiness_multiplier', happiness_multiplier
  );

  RETURN final_stats;
END;
$$ LANGUAGE plpgsql;

-- 7. Decay happiness (called hourly via cron)
CREATE OR REPLACE FUNCTION decay_happiness()
RETURNS VOID AS $$
BEGIN
  UPDATE lizards
  SET happiness = GREATEST(0, happiness - 5),
      updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 8. Reset daily battles (called daily at midnight)
CREATE OR REPLACE FUNCTION reset_daily_battles()
RETURNS VOID AS $$
BEGIN
  UPDATE lizards
  SET battles_today = 0,
      last_battle_date = CURRENT_DATE
  WHERE last_battle_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- 9. Update all location progress (called hourly via cron)
CREATE OR REPLACE FUNCTION update_all_location_progress()
RETURNS VOID AS $$
DECLARE
  lizard_rec RECORD;
BEGIN
  FOR lizard_rec IN SELECT id FROM lizards LOOP
    PERFORM update_location_progress(lizard_rec.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 10. Perform care action (Feed/Play/Rest)
CREATE OR REPLACE FUNCTION perform_care_action(lizard_uuid UUID, action_type TEXT)
RETURNS JSONB AS $$
DECLARE
  lizard_record RECORD;
  last_action_time TIMESTAMP WITH TIME ZONE;
  cooldown_hours INT := 1;
  result JSONB;
BEGIN
  SELECT * INTO lizard_record FROM lizards WHERE id = lizard_uuid;

  -- Get last action time based on type
  CASE action_type
    WHEN 'feed' THEN last_action_time := lizard_record.last_fed;
    WHEN 'play' THEN last_action_time := lizard_record.last_played;
    WHEN 'rest' THEN last_action_time := lizard_record.last_rested;
    ELSE RETURN jsonb_build_object('success', false, 'error', 'Invalid action type');
  END CASE;

  -- Check cooldown
  IF NOW() < last_action_time + (cooldown_hours || ' hours')::INTERVAL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Still on cooldown',
      'seconds_remaining', EXTRACT(EPOCH FROM (last_action_time + (cooldown_hours || ' hours')::INTERVAL - NOW()))
    );
  END IF;

  -- Perform action
  CASE action_type
    WHEN 'feed' THEN
      UPDATE lizards SET
        happiness = LEAST(100, happiness + 20),
        last_fed = NOW(),
        updated_at = NOW()
      WHERE id = lizard_uuid;
    WHEN 'play' THEN
      UPDATE lizards SET
        happiness = LEAST(100, happiness + 20),
        last_played = NOW(),
        updated_at = NOW()
      WHERE id = lizard_uuid;
    WHEN 'rest' THEN
      UPDATE lizards SET
        happiness = LEAST(100, happiness + 20),
        last_rested = NOW(),
        updated_at = NOW()
      WHERE id = lizard_uuid;
  END CASE;

  result := jsonb_build_object(
    'success', true,
    'action', action_type,
    'new_happiness', LEAST(100, lizard_record.happiness + 20)
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;
