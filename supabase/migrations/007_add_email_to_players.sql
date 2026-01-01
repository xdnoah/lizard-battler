-- Add email column to players table to enable username-based login
ALTER TABLE players ADD COLUMN email TEXT;

-- Update existing players with their email from auth.users
UPDATE players
SET email = auth.users.email
FROM auth.users
WHERE players.id = auth.users.id;

-- Make email required for new records
ALTER TABLE players ALTER COLUMN email SET NOT NULL;
