# 🦎 Lizard Auto-Battler MVP

A mobile-optimized idle/auto-battler game combining Tamagotchi-style pet raising with competitive PvP battles, deep RPG progression, and location-based stat growth.

## 🎮 Game Overview

Players raise a virtual lizard companion, place it at various locations to passively gain permanent stat bonuses over time, level it up to 100 with gold, equip gear, and battle other players' lizards in automated combat.

### Core Features
- **7 Training Locations**: Each provides unique passive bonuses (Gym, Spa, Library, Dojo, Temple, Speed Track, Home)
- **Location-Based Progression**: Hours spent = permanent stat bonuses (compounding!)
- **Tamagotchi Care System**: Feed, Play, Rest to maintain happiness (affects battle stats)
- **Idle Gold Generation**: Earn gold passively even when offline
- **Auto-Battle PvP**: Turn-based combat with ELO ratings
- **100 Levels**: Exponential progression system
- **Equipment System**: 3 slots (Weapon, Armor, Accessory) with upgrades
- **Global Chat**: Real-time communication with other players
- **Leaderboard**: Compete for top rankings

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **Database**: Supabase (PostgreSQL + Realtime + Auth)
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+
- npm/yarn
- A Supabase account ([sign up free](https://supabase.com))
- A Vercel account (for deployment, [sign up free](https://vercel.com))

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd lizard-battler
npm install
```

### 2. Set Up Supabase

1. Go to https://supabase.com and create a new project
2. Once created, go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

3. Create `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Run Database Migrations

Go to your Supabase project → **SQL Editor** and run the following migration files in order:

1. `supabase/migrations/001_initial_schema.sql` - Creates all tables
2. `supabase/migrations/002_seed_level_stats.sql` - Seeds level data (1-100)
3. `supabase/migrations/003_seed_locations.sql` - Seeds location data
4. `supabase/migrations/004_database_functions.sql` - Creates game logic functions
5. `supabase/migrations/005_battle_functions.sql` - Creates battle system

### 4. Configure Supabase Realtime

1. Go to **Database → Replication**
2. Enable replication for the `chat_messages` table

### 5. Set Up Cron Jobs (Optional but Recommended)

Go to **Database → Cron Jobs** and create:

1. **Happiness Decay** (runs every hour):
   ```sql
   SELECT cron.schedule(
     'decay-happiness',
     '0 * * * *',
     'SELECT decay_happiness()'
   );
   ```

2. **Reset Daily Battles** (runs daily at midnight UTC):
   ```sql
   SELECT cron.schedule(
     'reset-battles',
     '0 0 * * *',
     'SELECT reset_daily_battles()'
   );
   ```

3. **Update Location Progress** (runs every hour):
   ```sql
   SELECT cron.schedule(
     'update-locations',
     '0 * * * *',
     'SELECT update_all_location_progress()'
   );
   ```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
lizard-battler/
├── app/
│   ├── auth/
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── onboarding/         # Lizard creation flow
│   └── (game)/             # Main game screens (TODO)
│       ├── home/           # Home screen with lizard
│       ├── battle/         # Battle screen
│       ├── equipment/      # Equipment & shop
│       ├── location/       # Location selection
│       └── chat/           # Global chat
├── components/
│   ├── ui/                 # Reusable UI components
│   └── game/               # Game-specific components
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Client-side Supabase
│   │   ├── server.ts       # Server-side Supabase
│   │   └── queries.ts      # Database query helpers
│   ├── types/
│   │   └── database.ts     # TypeScript types
│   └── utils/
│       └── format.ts       # Formatting utilities
└── supabase/
    ├── migrations/         # Database migrations
    │   ├── 001_initial_schema.sql
    │   ├── 002_seed_level_stats.sql
    │   ├── 003_seed_locations.sql
    │   ├── 004_database_functions.sql
    │   └── 005_battle_functions.sql
    └── functions/          # Edge functions (future)
```

## 🎯 Current Implementation Status

### ✅ Completed
- Full database schema (10 tables)
- All game logic functions (11 Postgres functions)
- Row Level Security policies
- Seed data for 100 levels and 7 locations
- TypeScript types and utilities
- Supabase client/server setup
- Authentication (login/signup)
- Onboarding flow (lizard creation)
- Middleware for auth protection

### 🚧 TODO (See `IMPLEMENTATION_STATUS.md` for details)
- Main game layout with bottom navigation
- Home screen (lizard display, care actions, stats)
- Location screen (switching, hour tracking)
- Battle screen (opponent list, combat animation)
- Equipment screen (inventory, shop)
- Chat screen (real-time messaging)
- Leaderboard
- Lizard sprite component with evolution stages
- Mobile optimization and animations

## 🎮 Game Mechanics

### Location System
- Lizards accumulate hours at locations
- Each location provides different passive bonuses
- **Critical**: Only FULL hours count - switching loses partial progress!
- Bonuses are **permanent** and **compound**

**Example**:
- Spend 100 hours at Gym → +100% ATK permanently
- Switch to Library at 2h 45m → only 2 hours count (45 min lost)

### Leveling System
- Max level: 100
- Level up by spending gold (not XP)
- Each level increases base stats significantly
- Cost scales exponentially (level 100 costs 6.3 quintillion gold!)

### Passive Gold
- Primary income source
- Accumulates even when offline
- Base rate increases with level
- Library location multiplies rate (+2% per hour)

### Battle System
- Turn-based auto-combat
- Turn order by attack speed
- Damage = ATK - DEF (min 1)
- Critical hits multiply damage
- Winner gains rating, gold, XP
- 1-hour cooldown per opponent

### Happiness System
- 3 care actions: Feed, Play, Rest
- Each action: +20 happiness, 1-hour cooldown
- Decays -5 per hour automatically
- Affects battle stats:
  - 100% happiness: 1.2× multiplier
  - 50-99%: 1.0× (normal)
  - 0-49%: 0.8× penalty

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

Your app will be live at `https://your-app.vercel.app`

## 📱 Mobile Optimization

- Mobile-first design (portrait orientation)
- Minimum tap targets: 48×48px
- Responsive breakpoints: 320px - 428px
- Optimized for iOS Safari and Android Chrome
- Fast load times (<2s on 4G)

## 🔐 Security

- Row Level Security (RLS) enabled on all tables
- Users can only modify their own data
- Server-side validation for all critical operations
- Battle resolution runs server-side (no client manipulation)

## 🤝 Contributing

This is an MVP - contributions welcome! Focus areas:
1. UI/UX improvements
2. Additional locations or equipment
3. Mobile performance optimization
4. Animation polish

## 📄 License

MIT License - feel free to use this for learning or your own projects!

## 🐛 Known Issues

- Shop system not yet implemented (UI only)
- Lizard sprites are placeholder colors (need actual artwork)
- No sound effects or music
- Chat moderation is basic (profanity filter only)

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Game Design Document](./IMPLEMENTATION_STATUS.md)

## 🎨 Future Enhancements

- More locations (Desert, Mountain, Ocean, etc.)
- Equipment crafting system
- Guilds/clans
- Tournaments
- Achievements
- Mobile app (React Native)
- Multiple lizards per account
- Trading system

---

**Made with ❤️ and lots of TypeScript**

For detailed implementation status, see `IMPLEMENTATION_STATUS.md`
