-- Battle Resolution Function

CREATE OR REPLACE FUNCTION resolve_battle(attacker_uuid UUID, defender_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  attacker_stats JSONB;
  defender_stats JSONB;
  attacker_data RECORD;
  defender_data RECORD;
  attacker_hp INT;
  defender_hp INT;
  current_attacker TEXT;
  turn_count INT := 0;
  battle_log JSONB := '[]'::JSONB;
  turn_log JSONB;
  damage INT;
  is_crit BOOLEAN;
  winner_uuid UUID;
  loser_uuid UUID;
  attacker_rating_change INT;
  defender_rating_change INT;
  gold_reward INT;
  xp_reward INT := 500;
  win_bonus DECIMAL := 1.5;
  streak_multiplier DECIMAL := 1.0;
  daily_bonus DECIMAL := 1.0;
  result JSONB;
BEGIN
  -- Check battle cooldown
  IF EXISTS (
    SELECT 1 FROM battle_cooldowns
    WHERE attacker_id = attacker_uuid
    AND defender_id = defender_uuid
    AND can_battle_again_at > NOW()
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Battle cooldown active',
      'can_battle_at', (SELECT can_battle_again_at FROM battle_cooldowns
                        WHERE attacker_id = attacker_uuid AND defender_id = defender_uuid)
    );
  END IF;

  -- Get both lizards' data
  SELECT * INTO attacker_data FROM lizards WHERE id = attacker_uuid;
  SELECT * INTO defender_data FROM lizards WHERE id = defender_uuid;

  -- Get effective stats for both
  attacker_stats := calculate_effective_stats(attacker_uuid);
  defender_stats := calculate_effective_stats(defender_uuid);

  -- Initialize HP
  attacker_hp := (attacker_stats->>'hp')::INT;
  defender_hp := (defender_stats->>'hp')::INT;

  -- Determine who goes first (higher attack speed)
  IF (attacker_stats->>'attack_speed')::INT >= (defender_stats->>'attack_speed')::INT THEN
    current_attacker := 'attacker';
  ELSE
    current_attacker := 'defender';
  END IF;

  -- Battle simulation loop (max 100 turns to prevent infinite loops)
  WHILE attacker_hp > 0 AND defender_hp > 0 AND turn_count < 100 LOOP
    turn_count := turn_count + 1;

    IF current_attacker = 'attacker' THEN
      -- Attacker's turn
      damage := (attacker_stats->>'attack')::INT - (defender_stats->>'defense')::INT;
      damage := GREATEST(1, damage); -- Minimum 1 damage

      -- Check for critical hit
      is_crit := RANDOM() < ((attacker_stats->>'critical_rate')::DECIMAL / 100);

      IF is_crit THEN
        damage := FLOOR(damage * (1 + (attacker_stats->>'critical_damage')::DECIMAL / 100));
      END IF;

      defender_hp := defender_hp - damage;

      turn_log := jsonb_build_object(
        'turn', turn_count,
        'attacker', 'attacker',
        'damage', damage,
        'critical', is_crit,
        'defender_hp_remaining', GREATEST(0, defender_hp)
      );

      current_attacker := 'defender';
    ELSE
      -- Defender's turn
      damage := (defender_stats->>'attack')::INT - (attacker_stats->>'defense')::INT;
      damage := GREATEST(1, damage);

      is_crit := RANDOM() < ((defender_stats->>'critical_rate')::DECIMAL / 100);

      IF is_crit THEN
        damage := FLOOR(damage * (1 + (defender_stats->>'critical_damage')::DECIMAL / 100));
      END IF;

      attacker_hp := attacker_hp - damage;

      turn_log := jsonb_build_object(
        'turn', turn_count,
        'attacker', 'defender',
        'damage', damage,
        'critical', is_crit,
        'attacker_hp_remaining', GREATEST(0, attacker_hp)
      );

      current_attacker := 'attacker';
    END IF;

    -- Add turn to battle log
    battle_log := battle_log || turn_log;
  END LOOP;

  -- Determine winner
  IF attacker_hp > 0 THEN
    winner_uuid := attacker_uuid;
    loser_uuid := defender_uuid;
  ELSE
    winner_uuid := defender_uuid;
    loser_uuid := attacker_uuid;
  END IF;

  -- Calculate ELO rating changes
  DECLARE
    winner_rating INT;
    loser_rating INT;
    expected_score DECIMAL;
    k_factor INT := 32;
  BEGIN
    IF winner_uuid = attacker_uuid THEN
      winner_rating := attacker_data.rating;
      loser_rating := defender_data.rating;
    ELSE
      winner_rating := defender_data.rating;
      loser_rating := attacker_data.rating;
    END IF;

    expected_score := 1.0 / (1.0 + POWER(10, (loser_rating - winner_rating)::DECIMAL / 400));
    attacker_rating_change := FLOOR(k_factor * (CASE WHEN winner_uuid = attacker_uuid THEN 1 ELSE 0 END - expected_score));
    defender_rating_change := -attacker_rating_change;
  END;

  -- Calculate rewards for winner
  DECLARE
    winner_level INT;
    winner_streak INT;
    winner_battles_today INT;
  BEGIN
    IF winner_uuid = attacker_uuid THEN
      winner_level := attacker_data.level;
      winner_streak := attacker_data.current_win_streak + 1;
      winner_battles_today := attacker_data.battles_today;
    ELSE
      winner_level := defender_data.level;
      winner_streak := defender_data.current_win_streak + 1;
      winner_battles_today := defender_data.battles_today;
    END IF;

    -- Calculate streak multiplier
    IF winner_streak >= 10 THEN
      streak_multiplier := 3.0;
    ELSIF winner_streak >= 5 THEN
      streak_multiplier := 2.0;
    ELSIF winner_streak >= 3 THEN
      streak_multiplier := 1.5;
    END IF;

    -- Daily bonus for first 10 battles
    IF winner_battles_today < 10 THEN
      daily_bonus := 2.0;
    END IF;

    -- Gold reward formula
    gold_reward := FLOOR((100 + (10 * winner_level)) * win_bonus * streak_multiplier * daily_bonus);
  END;

  -- Update attacker stats
  IF winner_uuid = attacker_uuid THEN
    UPDATE lizards SET
      rating = rating + attacker_rating_change,
      wins = wins + 1,
      current_win_streak = current_win_streak + 1,
      best_win_streak = GREATEST(best_win_streak, current_win_streak + 1),
      gold = gold + gold_reward,
      xp = xp + xp_reward,
      battles_today = battles_today + 1,
      last_battle_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE id = attacker_uuid;
  ELSE
    UPDATE lizards SET
      rating = rating + attacker_rating_change,
      losses = losses + 1,
      current_win_streak = 0,
      battles_today = battles_today + 1,
      last_battle_date = CURRENT_DATE,
      updated_at = NOW()
    WHERE id = attacker_uuid;
  END IF;

  -- Update defender stats
  IF winner_uuid = defender_uuid THEN
    UPDATE lizards SET
      rating = rating + defender_rating_change,
      wins = wins + 1,
      current_win_streak = current_win_streak + 1,
      best_win_streak = GREATEST(best_win_streak, current_win_streak + 1),
      updated_at = NOW()
    WHERE id = defender_uuid;
  ELSE
    UPDATE lizards SET
      rating = rating + defender_rating_change,
      losses = losses + 1,
      current_win_streak = 0,
      updated_at = NOW()
    WHERE id = defender_uuid;
  END IF;

  -- Insert battle record
  INSERT INTO battles (
    attacker_id,
    defender_id,
    winner_id,
    battle_log,
    rating_change_attacker,
    rating_change_defender,
    gold_reward,
    xp_reward
  ) VALUES (
    attacker_uuid,
    defender_uuid,
    winner_uuid,
    battle_log,
    attacker_rating_change,
    defender_rating_change,
    gold_reward,
    xp_reward
  );

  -- Insert battle cooldown (1 hour)
  INSERT INTO battle_cooldowns (attacker_id, defender_id, can_battle_again_at)
  VALUES (attacker_uuid, defender_uuid, NOW() + INTERVAL '1 hour')
  ON CONFLICT (attacker_id, defender_id)
  DO UPDATE SET can_battle_again_at = NOW() + INTERVAL '1 hour';

  -- Build result
  result := jsonb_build_object(
    'success', true,
    'winner', winner_uuid,
    'battle_log', battle_log,
    'attacker_rating_change', attacker_rating_change,
    'defender_rating_change', defender_rating_change,
    'gold_reward', CASE WHEN winner_uuid = attacker_uuid THEN gold_reward ELSE 0 END,
    'xp_reward', CASE WHEN winner_uuid = attacker_uuid THEN xp_reward ELSE 0 END,
    'attacker_final_hp', GREATEST(0, attacker_hp),
    'defender_final_hp', GREATEST(0, defender_hp)
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;
