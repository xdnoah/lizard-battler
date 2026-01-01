-- Seed location_stats table with all 7 locations

INSERT INTO location_stats (
  location_name,
  display_name,
  emoji,
  description,
  attack_per_hour,
  hp_per_hour,
  defense_per_hour,
  critical_damage_per_hour,
  attack_speed_per_hour,
  passive_gold_per_hour
) VALUES
(
  'home',
  'Home',
  '🏠',
  'A comfortable home base with no training benefits',
  0, 0, 0, 0, 0, 0
),
(
  'gym',
  'Gym',
  '🏋️',
  'Your lizard pumps iron and practices devastating attacks',
  1.0, 0, 0, 0.25, 0, 0
),
(
  'spa',
  'Vitality Spa',
  '💚',
  'Deep tissue massage and recovery therapy for maximum durability',
  0, 1.5, 0, 0, 0, 0
),
(
  'library',
  'Library',
  '📚',
  'Your lizard studies economics and investment strategies',
  0, 0, 0, 0, 0, 2.0
),
(
  'speed_track',
  'Speed Track',
  '🏃',
  'Sprint training and agility drills for lightning-fast attacks',
  0, 0, 0, 0, 2, 0
),
(
  'dojo',
  'Dojo',
  '🥋',
  'Balanced martial arts training for well-rounded fighters',
  0.5, 0, 0.5, 0, 0, 0
),
(
  'temple',
  'Temple',
  '🛕',
  'Spiritual harmony grants slow but balanced growth across all attributes',
  0.5, 0.5, 0.5, 0.5, 0, 0
);
