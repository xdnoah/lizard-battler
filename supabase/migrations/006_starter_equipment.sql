-- Function to generate starter equipment for new lizards
CREATE OR REPLACE FUNCTION generate_starter_equipment(lizard_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Give starter weapon (common)
  INSERT INTO equipment (lizard_id, slot, name, rarity, attack_bonus, upgrade_level, equipped)
  VALUES (
    lizard_uuid,
    'weapon',
    'Wooden Stick',
    'common',
    0.10, -- +10% ATK
    1,
    true -- Auto-equip
  );

  -- Give starter armor (common)
  INSERT INTO equipment (lizard_id, slot, name, rarity, hp_bonus, upgrade_level, equipped)
  VALUES (
    lizard_uuid,
    'armor',
    'Cloth Vest',
    'common',
    0.10, -- +10% HP
    1,
    true -- Auto-equip
  );

  -- Give starter accessory (common)
  INSERT INTO equipment (lizard_id, slot, name, rarity, critical_rate_bonus, upgrade_level, equipped)
  VALUES (
    lizard_uuid,
    'accessory',
    'Lucky Charm',
    'common',
    0.05, -- +5% Crit Rate
    1,
    true -- Auto-equip
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate starter equipment when lizard_locations entry is created
-- (This happens right after a lizard is created)
CREATE OR REPLACE FUNCTION trigger_generate_starter_equipment()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM generate_starter_equipment(NEW.lizard_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'after_lizard_location_insert'
  ) THEN
    CREATE TRIGGER after_lizard_location_insert
    AFTER INSERT ON lizard_locations
    FOR EACH ROW
    EXECUTE FUNCTION trigger_generate_starter_equipment();
  END IF;
END $$;
