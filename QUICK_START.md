# ⚡ Quick Start - Get Running in 5 Minutes

## 1. Create Supabase Project (2 min)

1. Go to https://supabase.com → Sign up (free)
2. Create new project:
   - Name: `lizard-battler`
   - Password: (save this!)
   - Region: Choose closest to you
3. Wait for project creation (~1 min)

## 2. Get Credentials (30 sec)

1. Go to **Settings** (gear icon) → **API**
2. Copy these 3 values:
   - Project URL
   - `anon` public key
   - `service_role` key (click "Reveal")

## 3. Configure Environment (30 sec)

Create `.env.local` in project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 4. Run Migrations (2 min)

In Supabase:
1. Click **SQL Editor** → **New Query**
2. Copy/paste contents of each file below and click "Run"
3. Run in this exact order:

```
✅ supabase/migrations/001_initial_schema.sql
✅ supabase/migrations/002_seed_level_stats.sql (large file, be patient)
✅ supabase/migrations/003_seed_locations.sql
✅ supabase/migrations/004_database_functions.sql
✅ supabase/migrations/005_battle_functions.sql
```

## 5. Start the App (30 sec)

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 6. Create Your First Lizard! (1 min)

1. Click "Sign up"
2. Create account (use any email/password)
3. Choose lizard name
4. Pick a color
5. You're in! 🦎

---

## 🎮 Try These Features

### Home Screen
- ✅ See your lizard
- ✅ Click Feed/Play/Rest (watch cooldown)
- ✅ Expand stats panel

### Location Screen (🏛️ tab)
- ✅ See all 7 locations
- ✅ Switch to GYM
- ✅ Come back in 1+ hours to see bonus!

### Test Passive Gold
- ✅ Close app
- ✅ Wait 2 minutes
- ✅ Reopen → See "Welcome back!" modal

---

## ⚠️ Common Issues

**"relation 'players' does not exist"**
→ Run migration 001 in Supabase SQL Editor

**Can't log in**
→ Restart dev server: `Ctrl+C` then `npm run dev`

**Care buttons don't work**
→ Run migration 004

**No passive gold**
→ Run migration 004, wait at least 1 minute offline

---

## 📚 Next Steps

See full docs:
- `SETUP_GUIDE.md` - Detailed setup
- `PROGRESS_SUMMARY.md` - What's built
- `IMPLEMENTATION_STATUS.md` - What's next
- `README.md` - Full documentation

---

**You're ready to play!** 🎉

The core game loop works:
1. Create lizard
2. Feed/play/rest to keep it happy
3. Choose training location
4. Gain permanent stat bonuses
5. Earn gold passively
6. (Battle system coming soon!)

Enjoy building your ultimate lizard! 🦎💪
