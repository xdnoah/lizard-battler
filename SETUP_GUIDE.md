# 🚀 Lizard Auto-Battler - Setup Guide

## Current Status: CORE FEATURES WORKING! ✅

The game is now functional with these features:
- ✅ Authentication (Sign up, Login)
- ✅ Onboarding (Create your lizard)
- ✅ Home screen (View lizard, care actions, stats)
- ✅ Location system (Switch locations, track hours, gain bonuses)
- ✅ Passive gold collection
- ✅ Care system (Feed, Play, Rest with cooldowns)
- ✅ Bottom tab navigation

## Quick Start (5 minutes)

### Step 1: Set Up Supabase

1. Go to https://supabase.com and create a free account
2. Click "New Project"
3. Choose:
   - Name: `lizard-battler` (or any name you like)
   - Database Password: (generate or create your own)
   - Region: Choose closest to you
   - Plan: Free
4. Wait 1-2 minutes for project creation

### Step 2: Get Your Supabase Credentials

1. In your Supabase project, go to **Project Settings** (gear icon bottom left)
2. Click **API** in the left menu
3. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (the long string under "Project API keys")
   - **service_role** key (click "Reveal" to see it)

### Step 3: Create .env.local File

In your project root, create a file named `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Replace the values with what you copied in Step 2.

### Step 4: Run Database Migrations

1. In Supabase, click **SQL Editor** (in the left menu)
2. Click "New Query"
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Click "Run" (bottom right)
5. Repeat for:
   - `002_seed_level_stats.sql` (this one is large, be patient)
   - `003_seed_locations.sql`
   - `004_database_functions.sql`
   - `005_battle_functions.sql`

**Important**: Run them IN ORDER (001, 002, 003, 004, 005)

### Step 5: Enable Realtime (for Chat feature - future)

1. Go to **Database → Replication** in Supabase
2. Find `chat_messages` table
3. Toggle it ON

### Step 6: Run the App!

```bash
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## 🎮 Testing the Game

### Create Your First Account

1. Go to http://localhost:3000
2. Click "Sign up"
3. Enter:
   - Username: `testplayer1`
   - Email: `test@example.com`
   - Password: `password123`
4. Create your lizard:
   - Name it (e.g., "Firebreather")
   - Choose a color
5. You're in!

### Try the Features

**Home Screen:**
- See your lizard
- Feed/Play/Rest buttons (try clicking one!)
- Wait 1 hour to see the cooldown
- View your stats (tap "Stats & Info" to expand)

**Location Screen (Bottom tab 🏛️):**
- See all 7 locations
- Currently at "HOME" (no bonuses)
- Switch to "GYM" to start earning ATK bonuses
- Note: Only full hours count!
- Come back in 1+ hours to see your bonus grow

**Test Passive Gold:**
1. Note your current gold
2. Close the app
3. Wait a few minutes
4. Reopen → You should see "Welcome Back! Collected X gold"

**Test Care Actions:**
1. Click "Feed" button
2. Wait for happiness to increase
3. See cooldown timer (1 hour)
4. Try clicking again → should be disabled
5. Check other actions (Play, Rest) - independent cooldowns!

## 🎯 What's Working

### ✅ Fully Functional
- User authentication
- Lizard creation with 5 appearances
- Home screen with live data
- Care system (Feed/Play/Rest) with cooldowns
- Location switching with hour tracking
- Passive gold accumulation
- Stats display
- Bottom navigation
- Mobile-responsive design

### 🚧 Coming Next
- Battle system (find opponents, auto-combat)
- Equipment & shop
- Global chat (real-time)
- Leaderboard
- Level-up UI
- Better lizard sprites/animations

## 🐛 Troubleshooting

### "Error: relation 'players' does not exist"
- You forgot to run the migrations!
- Go to Supabase SQL Editor and run `001_initial_schema.sql`

### "Invalid credentials" when logging in
- Make sure you signed up first
- Check that your .env.local has the correct keys
- Restart the dev server (`npm run dev`)

### Care buttons not working
- Check browser console for errors
- Make sure database functions are installed (`004_database_functions.sql`)
- Try refreshing the page

### No gold collected when returning
- You need to wait at least a few seconds offline
- Make sure `004_database_functions.sql` is installed
- Check that your lizard's level > 1 (level 1 earns 50 gold/sec = 3000/min)

### Location switching not working
- Make sure `004_database_functions.sql` is installed
- Check browser console for errors
- Refresh the page

## 📊 Understanding the Game Mechanics

### Location Hours Tracking
- **Full hours only**: If you've been at Gym for 2h 45m, only 2h counts
- **Permanent bonuses**: Once earned, bonuses NEVER decrease
- **Compound bonuses**: 100 hours at Gym = +100% ATK (doubles your attack!)
- **No limit**: You can spend 1000+ hours if you want!

### Passive Gold
- **Always earning**: Even when app is closed
- **Scales with level**: Level 50 = 1,538 gold/second (5.5M/hour!)
- **Library bonus**: Each hour at Library = +2% to passive gold rate
- **Example**: Level 50 with 50h Library = 1,538 × 2.0 = 3,076 gold/sec

### Happiness System
- **Starts at 100%**
- **Decays -5/hour** (automatic, even offline)
- **Care actions restore +20** (Feed, Play, Rest)
- **Affects battles**: Low happiness = weaker in combat

### Level Up System (Future)
- Spend gold to level up (not XP!)
- Each level significantly increases stats
- Cost scales exponentially
- Max level: 100

## 🔧 Optional: Set Up Cron Jobs

For production, set up these cron jobs in Supabase:

1. **Database → Cron Jobs → New Cron Job**

2. Create 3 jobs:

**Happiness Decay (every hour):**
```sql
SELECT cron.schedule(
  'decay-happiness',
  '0 * * * *',
  'SELECT decay_happiness()'
);
```

**Reset Daily Battles (midnight UTC):**
```sql
SELECT cron.schedule(
  'reset-battles',
  '0 0 * * *',
  'SELECT reset_daily_battles()'
);
```

**Update Location Progress (every hour):**
```sql
SELECT cron.schedule(
  'update-locations',
  '0 * * * *',
  'SELECT update_all_location_progress()'
);
```

Note: For local development, these aren't critical - the functions run when users interact with the app.

## 📱 Mobile Testing

The app is mobile-optimized! Test on your phone:

1. Find your local IP address:
   ```bash
   # Mac/Linux:
   ifconfig | grep "inet "
   # Windows:
   ipconfig
   ```

2. On your phone's browser, visit:
   ```
   http://YOUR-IP-ADDRESS:3000
   ```

3. Sign up and test on mobile!

## 🎨 Customization Ideas

### Add More Lizard Colors
Edit `app/onboarding/page.tsx` - add to `LIZARD_APPEARANCES` array

### Add New Locations
1. Add to `supabase/migrations/003_seed_locations.sql`
2. Update `lib/types/database.ts` LocationName type
3. Re-run the migration

### Change Passive Gold Rates
Edit `supabase/migrations/002_seed_level_stats.sql`

### Adjust Care Cooldowns
Edit `supabase/migrations/004_database_functions.sql` in `perform_care_action()`

## 🚀 Deployment to Production

See `README.md` for Vercel deployment instructions.

## 🆘 Need Help?

Check:
1. Browser console for errors (F12 → Console tab)
2. Supabase logs (Database → Logs)
3. `IMPLEMENTATION_STATUS.md` for what's implemented
4. GitHub issues

## 🎉 You're Ready!

Your Lizard Auto-Battler is ready to play! The core game loop is working:

1. Create lizard
2. Care for it (Feed/Play/Rest)
3. Choose a location to train
4. Earn permanent stat bonuses
5. Collect passive gold
6. Level up (coming soon!)
7. Battle others (coming soon!)

Enjoy! 🦎
