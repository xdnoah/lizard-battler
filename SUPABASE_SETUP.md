# 🗄️ Supabase Setup Guide - Step by Step

Follow these steps **in order** to set up your Supabase database for local development.

---

## Step 1: Create Supabase Account & Project

### 1.1 Sign Up
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email

### 1.2 Create New Project
1. Click "New Project"
2. Choose your organization (create one if needed)
3. Fill in project details:
   - **Name:** `lizard-battler-dev` (or any name you prefer)
   - **Database Password:** Generate a strong password (save it somewhere safe!)
   - **Region:** Choose closest to you (e.g., US East, EU West, etc.)
   - **Pricing Plan:** Free (plenty for development)

4. Click "Create new project"
5. ⏳ Wait 2-3 minutes for provisioning (database is being created)

---

## Step 2: Run Database Migrations

Once your project is ready (you'll see the dashboard), we need to create all the tables and functions.

### 2.1 Open SQL Editor
1. In left sidebar, click **SQL Editor** (icon looks like `</>`)
2. Click **"New query"** button

### 2.2 Run Migration 1 - Initial Schema (Tables)
1. Open the file: `supabase/migrations/001_initial_schema.sql`
2. Copy the ENTIRE contents
3. Paste into Supabase SQL Editor
4. Click **"Run"** button (bottom right)
5. ✅ Should see: "Success. No rows returned"

**What this creates:**
- 10 tables (players, lizards, equipment, battles, chat_messages, etc.)
- Relationships between tables
- Row Level Security policies
- Indexes for performance

### 2.3 Run Migration 2 - Level Stats (100 Levels)
1. Open the file: `supabase/migrations/002_seed_level_stats.sql`
2. Copy the ENTIRE contents (⚠️ This is a LARGE file!)
3. Paste into SQL Editor
4. Click **"Run"**
5. ⏳ Wait 5-10 seconds (inserting 100 rows)
6. ✅ Should see: "Success. No rows returned"

**What this creates:**
- 100 levels of progression data
- Stats for each level (HP, ATK, DEF, etc.)
- Gold costs to level up
- Passive gold rates

### 2.4 Run Migration 3 - Locations
1. Open the file: `supabase/migrations/003_seed_locations.sql`
2. Copy contents
3. Paste into SQL Editor
4. Click **"Run"**
5. ✅ Should see: "Success. No rows returned"

**What this creates:**
- 7 locations (Home, Gym, Spa, Library, Speed Track, Dojo, Temple)
- Bonuses for each location
- Emoji icons

### 2.5 Run Migration 4 - Game Functions
1. Open the file: `supabase/migrations/004_database_functions.sql`
2. Copy contents
3. Paste into SQL Editor
4. Click **"Run"**
5. ✅ Should see: "Success. No rows returned"

**What this creates:**
- `update_location_progress()` - Tracks hours at locations
- `switch_location()` - Changes location
- `collect_passive_gold()` - Calculates offline earnings
- `perform_care_action()` - Feed/Play/Rest
- `level_up_lizard()` - Spend gold to level up
- And more...

### 2.6 Run Migration 5 - Battle System
1. Open the file: `supabase/migrations/005_battle_functions.sql`
2. Copy contents
3. Paste into SQL Editor
4. Click **"Run"**
5. ✅ Should see: "Success. No rows returned"

**What this creates:**
- `resolve_battle()` - Turn-based combat simulation
- `can_battle()` - Checks cooldowns
- ELO rating calculations
- Win streak tracking

### 2.7 Run Migration 6 - Starter Equipment
1. Open the file: `supabase/migrations/006_starter_equipment.sql`
2. Copy contents
3. Paste into SQL Editor
4. Click **"Run"**
5. ✅ Should see: "Success. No rows returned"

**What this creates:**
- Trigger to auto-generate starter equipment
- 3 common items (Wooden Stick, Cloth Vest, Lucky Charm)
- Auto-equips items when lizard is created

### 2.8 Verify Migrations Worked
Run this query to verify all tables exist:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see these 10 tables:
- battle_cooldowns
- battles
- chat_messages
- equipment
- level_stats
- lizard_locations
- lizards
- location_stats
- players
- shop_items

---

## Step 3: Enable Realtime for Chat

### 3.1 Go to Replication Settings
1. In left sidebar, click **Database**
2. Click **Replication** tab

### 3.2 Enable Realtime for Chat
1. Find `chat_messages` in the list
2. Toggle the switch to **ON** (should turn green)
3. Click **Save** (if there's a save button)

**What this does:**
- Enables live message updates in chat
- No page refresh needed to see new messages

---

## Step 4: Get Your API Credentials

### 4.1 Go to API Settings
1. In left sidebar, click **Settings** (gear icon at bottom)
2. Click **API** tab

### 4.2 Copy Your Credentials
You'll see three important values:

**Project URL:**
```
https://xxxxxxxxxxxxx.supabase.co
```
Copy this entire URL ☝️

**anon public key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ...
```
Copy this long string ☝️ (click the copy icon)

**service_role key:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ...
```
⚠️ Click **"Reveal"** first, then copy ☝️

---

## Step 5: Configure Environment Variables

### 5.1 Create .env.local File
In your project root (where you see `package.json`), create a new file called `.env.local`

### 5.2 Add Your Credentials
Paste this into `.env.local`, replacing with YOUR values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ...
```

**Important:**
- Replace ALL THREE values with your actual credentials
- No quotes around the values
- No spaces around the `=` sign
- Save the file

---

## Step 6: Test the Setup

### 6.1 Start Development Server
```bash
npm run dev
```

You should see:
```
▲ Next.js 16.1.1
- Local:        http://localhost:3000
```

### 6.2 Open in Browser
Go to http://localhost:3000

### 6.3 Sign Up (First Test)
1. Should redirect to `/auth/signup`
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Click "Sign Up"
5. ✅ Should redirect to `/onboarding`

### 6.4 Create Lizard (Second Test)
1. **Step 1:** Enter name (e.g., "Godzilla")
2. Click "Next"
3. **Step 2:** Select a color (e.g., green)
4. Click "Next"
5. **Step 3:** Read tutorial or click "Skip"
6. Click "Start Playing!"
7. ✅ Should redirect to `/home`

### 6.5 Verify Home Screen (Third Test)
You should see:
- ✅ Your lizard displayed (green circle with name)
- ✅ Gold: 0
- ✅ Happiness: 100
- ✅ Level: 1
- ✅ Location: 🏠 Home (0 hours)
- ✅ Passive rate: ~50 gold/sec
- ✅ Feed/Play/Rest buttons

### 6.6 Test Care Actions (Fourth Test)
1. Click "Feed 🍔"
2. ✅ Happiness should increase to 100 (already max)
3. ✅ Button should show cooldown timer
4. Click "Play 🎮"
5. Click "Rest 😴"
6. ✅ All three buttons should be on cooldown

### 6.7 Test Navigation (Fifth Test)
Click each bottom nav tab:
- ✅ Home (you're here)
- ✅ Battle (should show opponent list)
- ✅ Equipment (should show 3 starter items equipped!)
- ✅ Location (should show 7 locations)
- ✅ Chat (should show empty chat)

---

## Step 7: Verify Database (Optional but Recommended)

### 7.1 Check Your Data in Supabase
1. In Supabase, go to **Table Editor** (left sidebar)
2. Click **players** table
   - ✅ Should see 1 row with your username
3. Click **lizards** table
   - ✅ Should see 1 row with your lizard's name
4. Click **equipment** table
   - ✅ Should see 3 rows (Wooden Stick, Cloth Vest, Lucky Charm)
   - ✅ All should have `equipped = true`
5. Click **lizard_locations** table
   - ✅ Should see 1 row with `current_location = HOME`

---

## 🎉 Setup Complete!

If all tests passed, you're ready to play!

### Next Steps:
1. Wait 1 minute, then refresh the page
   - You should see "Welcome Back!" modal with gold earned
2. Try switching locations
3. Battle some opponents
4. Level up your lizard
5. Chat with yourself (or invite a friend to test multiplayer!)

---

## 🐛 Troubleshooting

### Problem: "Failed to fetch" errors
**Solution:** Check your `.env.local` file:
- All three values are filled in
- No extra spaces or quotes
- File is named exactly `.env.local` (with the dot!)

### Problem: "Invalid credentials" on signup
**Solution:**
- Password must be at least 6 characters
- Email must be valid format

### Problem: "Cannot read properties of null"
**Solution:** Make sure ALL 6 migrations ran successfully
- Go back to Supabase SQL Editor
- Re-run each migration file in order

### Problem: Starter equipment not appearing
**Solution:** Check if migration 6 ran:
```sql
-- Run this in Supabase SQL Editor
SELECT * FROM equipment WHERE lizard_id = (SELECT id FROM lizards LIMIT 1);
```
If no results, re-run `006_starter_equipment.sql`

### Problem: Chat not updating in real-time
**Solution:** Make sure Realtime is enabled:
- Database → Replication → chat_messages = ON

### Problem: Page won't load / infinite spinner
**Solution:** Check browser console for errors (F12)
- Look for Supabase connection errors
- Verify all environment variables are correct

---

## 📞 Need Help?

If you're stuck, check:
1. Browser console (F12 → Console tab)
2. Terminal where `npm run dev` is running
3. Supabase logs (Dashboard → Logs)

Common issues are usually:
- Wrong environment variables
- Missing migrations
- Realtime not enabled
- Browser cache (try incognito mode)
