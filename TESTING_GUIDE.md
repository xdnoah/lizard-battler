# 🧪 Lizard Auto-Battler - Testing Guide

## Prerequisites for Testing

Before you can test the game, you need to set up Supabase:

### 1. Set Up Supabase Project

```bash
# Create a Supabase account at https://supabase.com
# Create a new project (takes ~2 minutes to provision)
```

### 2. Run Database Migrations

In the Supabase SQL Editor, run these files **in order**:

1. `supabase/migrations/001_initial_schema.sql` - Creates all tables
2. `supabase/migrations/002_seed_level_stats.sql` - Seeds 100 levels (⚠️ large file, be patient!)
3. `supabase/migrations/003_seed_locations.sql` - Seeds 7 locations
4. `supabase/migrations/004_database_functions.sql` - Creates game logic functions
5. `supabase/migrations/005_battle_functions.sql` - Creates battle system
6. `supabase/migrations/006_starter_equipment.sql` - Creates starter equipment trigger

### 3. Enable Realtime

```
1. Go to Database → Replication
2. Enable replication for: chat_messages
3. Save changes
```

### 4. Configure Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local and add your Supabase credentials:
# Get these from: Settings → API in your Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 5. Start Development Server

```bash
npm run dev
# Open http://localhost:3000
```

---

## 🎯 End-to-End Testing Checklist

### Phase 1: Authentication & Onboarding (5 minutes)

**Test 1.1: Sign Up Flow**
- [ ] Go to http://localhost:3000
- [ ] Should redirect to `/auth/signup`
- [ ] Try invalid email (should show error)
- [ ] Try password < 6 chars (should show error)
- [ ] Sign up with valid credentials
- [ ] Should redirect to `/onboarding`

**Test 1.2: Onboarding Flow**
- [ ] Step 1: Enter lizard name (try < 3 chars, should error)
- [ ] Step 1: Try duplicate username (should error if exists)
- [ ] Step 2: Select appearance (try all 5 colors)
- [ ] Step 3: Read tutorial (or skip)
- [ ] Click "Start Playing!"
- [ ] Should redirect to `/home`

**Test 1.3: Login Flow**
- [ ] Log out (if possible) or open in incognito window
- [ ] Go to `/auth/login`
- [ ] Try wrong password (should error)
- [ ] Login with correct credentials
- [ ] Should redirect to `/home`

**Expected Database State After Phase 1:**
```sql
-- Verify in Supabase SQL Editor:
SELECT * FROM players;  -- Should have 1 row
SELECT * FROM lizards;  -- Should have 1 row
SELECT * FROM equipment WHERE lizard_id = (SELECT id FROM lizards LIMIT 1);  -- Should have 3 starter items
SELECT * FROM lizard_locations;  -- Should have 1 row (at HOME)
```

---

### Phase 2: Home Screen & Care System (10 minutes)

**Test 2.1: Initial Home Screen**
- [ ] Verify lizard displays with correct color
- [ ] Check gold balance = 0
- [ ] Check happiness = 100
- [ ] Check level = 1
- [ ] Check location = 🏠 Home (0 hours)
- [ ] Check passive rate displays (~50 gold/sec)

**Test 2.2: Care Actions**
- [ ] Click "Feed 🍔" - happiness should increase by 20
- [ ] Button should show cooldown timer (1 hour)
- [ ] Click "Play 🎮" - happiness +20
- [ ] Click "Rest 😴" - happiness +20
- [ ] Happiness should now be capped at 100
- [ ] All 3 buttons should be on cooldown

**Test 2.3: Stats Panel**
- [ ] Click "Stats & Info" to expand
- [ ] Verify Rating = 1000
- [ ] Verify Win Rate = 0% (0W / 0L)
- [ ] Verify Location Bonuses shows "No location bonuses yet!"
- [ ] Click action buttons (Location, Battle, Equipment, Leaderboard)

**Test 2.4: Passive Gold (Wait 1 minute)**
- [ ] Refresh the page
- [ ] Gold should have increased by ~3,000 (50 gold/sec × 60 sec)
- [ ] "Welcome Back!" modal should appear
- [ ] Should show gold earned and time elapsed

**Expected Database State After Phase 2:**
```sql
SELECT happiness, last_feed, last_play, last_rest FROM lizards LIMIT 1;
-- happiness should be 100 (or 95 if 1 hour passed = -5 decay)
-- last_feed, last_play, last_rest should all be recent timestamps

SELECT gold FROM lizards LIMIT 1;
-- Should be > 0 (passive accumulation)
```

---

### Phase 3: Location System (15 minutes)

**Test 3.1: View Locations**
- [ ] Click bottom nav: "Location 🏛️"
- [ ] Should see 7 location cards:
  - 🏠 Home (neutral)
  - 🏋️ Gym (+1% ATK, +0.25% Crit Dmg/hour)
  - 💚 Spa (+1.5% HP/hour)
  - 📚 Library (+2% Passive Gold/hour)
  - 🏃 Speed Track (+2 Attack Speed/hour)
  - 🥋 Dojo (+0.5% ATK, +0.5% DEF/hour)
  - 🛕 Temple (+0.5% ALL stats/hour)
- [ ] Current location (Home) should be highlighted

**Test 3.2: Switch Location**
- [ ] Click "Switch Here" on Library
- [ ] Confirmation modal should appear
- [ ] Confirm switch
- [ ] Location should update to 📚 Library
- [ ] Should show "0 hours spent here"

**Test 3.3: Hour Accumulation (Wait 1 hour OR manually update DB)**

**Option A: Wait 1 Real Hour**
- [ ] Leave app open or come back in 1+ hours
- [ ] Refresh `/location` page
- [ ] Library should show "1 hour spent here"
- [ ] Home screen stats should show "+2.0% Passive Gold"

**Option B: Manually Test (SQL Editor)**
```sql
-- Fast-forward time by 1 hour
UPDATE lizard_locations
SET location_since = NOW() - INTERVAL '1 hour 5 minutes'
WHERE lizard_id = (SELECT id FROM lizards LIMIT 1);

-- Refresh /location page
-- Should show 1 hour (5 minutes are lost as partial hour)
```

**Test 3.4: Partial Hour Warning**
- [ ] After accumulating time, immediately try to switch location
- [ ] Should see warning: "⚠️ Switching now will lose X minutes of progress!"
- [ ] Cancel and wait until full hour completes
- [ ] Or confirm to test partial hour loss

**Expected Database State After Phase 3:**
```sql
SELECT current_location, library_hours, location_since
FROM lizard_locations LIMIT 1;
-- current_location should be 'LIBRARY'
-- library_hours should be 1 (or more if waited longer)
-- location_since should be recent timestamp
```

---

### Phase 4: Battle System (20 minutes)

**Test 4.1: View Opponents**
- [ ] Click bottom nav: "Battle ⚔️"
- [ ] Should see list of opponents (AI lizards)
- [ ] Each opponent shows: name, level, rating, stats
- [ ] "Battle!" buttons should be clickable

**Test 4.2: First Battle (Likely to Lose)**
- [ ] Battle the lowest-rated opponent
- [ ] Battle modal should appear with loading state
- [ ] Should transition to turn-by-turn animation
- [ ] Watch auto-play (or click Skip)
- [ ] Should see damage numbers, HP bars
- [ ] Result modal appears (Victory or Defeat)
- [ ] Shows gold earned, XP, rating change
- [ ] Click "Close" to return to opponent list

**Test 4.3: Battle Cooldown**
- [ ] Try to battle the same opponent again
- [ ] Button should be disabled with cooldown timer
- [ ] Should show "Available in XX:XX"

**Test 4.4: Multiple Battles**
- [ ] Battle 5 different opponents
- [ ] Track wins/losses
- [ ] Return to Home and check stats panel
- [ ] Win record should update
- [ ] Rating should have changed

**Test 4.5: Battle History**
- [ ] Scroll down on Battle page
- [ ] Should see "Recent Battles" section
- [ ] Last 10 battles displayed
- [ ] Shows opponent name, result, gold/XP earned

**Test 4.6: Win Streak (if you win 2+ battles)**
- [ ] Battle multiple low-rated opponents
- [ ] After 2 wins in a row, check stats panel
- [ ] Should show "Streak: 2 🔥"
- [ ] Continue winning to build streak
- [ ] Gold multiplier increases at 5 and 10 streaks

**Expected Database State After Phase 4:**
```sql
SELECT wins, losses, current_win_streak, rating
FROM lizards LIMIT 1;
-- wins + losses should = number of battles fought
-- rating should have changed from 1000
-- current_win_streak should reflect consecutive wins

SELECT COUNT(*) FROM battles
WHERE attacker_id = (SELECT id FROM lizards LIMIT 1);
-- Should equal number of battles you initiated
```

---

### Phase 5: Leveling System (10 minutes)

**Test 5.1: View Level-Up Button**
- [ ] Return to Home page
- [ ] Should see "Level Up" button
- [ ] If you have enough gold, button should be enabled
- [ ] If not enough gold, should show "Not enough gold!"

**Test 5.2: Level Up Preview**
- [ ] Click "Level Up" button
- [ ] Modal shows current vs next level stats:
  - HP: XXX → YYY (+ZZZ)
  - Attack: XX → YY (+Z)
  - Defense: XX → YY (+Z)
  - Passive Gold: X/sec → Y/sec (+Z/sec)
- [ ] Shows cost in gold
- [ ] "Confirm" or "Cancel" buttons

**Test 5.3: Level Up**
- [ ] Confirm level up
- [ ] Gold should decrease by cost
- [ ] Level should increase by 1
- [ ] Lizard sprite might change (evolution at levels 20/40/60/80)
- [ ] Stats in stats panel should update

**Test 5.4: Multiple Level Ups**
- [ ] Level up 5-10 times in a row (if you have gold)
- [ ] Watch stats increase
- [ ] Watch costs increase exponentially
- [ ] Eventually run out of gold

**Test 5.5: Evolution Stages**
- [ ] If you reach level 20, sprite should change (bigger)
- [ ] Level 40, 60, 80 also trigger visual changes

**Expected Database State After Phase 5:**
```sql
SELECT level, gold FROM lizards LIMIT 1;
-- level should be higher than 1
-- gold should be lower than before leveling

SELECT hp, attack, defense, passive_gold_per_second
FROM level_stats
WHERE level = (SELECT level FROM lizards LIMIT 1);
-- These are the current stats for your level
```

---

### Phase 6: Equipment System (15 minutes)

**Test 6.1: View Equipment Page**
- [ ] Click bottom nav: "Equipment 🎒"
- [ ] Should see 3 equipped items (starter equipment):
  - Weapon: Wooden Stick (Common)
  - Armor: Cloth Vest (Common)
  - Accessory: Lucky Charm (Common)
- [ ] Inventory below shows all owned equipment
- [ ] Filter buttons: All, Weapon, Armor, Accessory, Common, Rare, Epic, Legendary

**Test 6.2: View Equipment Details**
- [ ] Click on equipped Wooden Stick
- [ ] Modal shows full details:
  - Name, rarity, slot, level
  - Stat bonuses (e.g., +10 ATK)
  - "Unequip" button
- [ ] Close modal

**Test 6.3: Unequip Item**
- [ ] Open Wooden Stick details again
- [ ] Click "Unequip"
- [ ] Weapon slot should now be empty
- [ ] Wooden Stick should appear in inventory (unequipped)
- [ ] Your total attack on home screen should decrease

**Test 6.4: Equip Item**
- [ ] Find Wooden Stick in inventory
- [ ] Click on it
- [ ] Click "Equip" button
- [ ] Should move back to weapon slot
- [ ] Attack stat should increase again

**Test 6.5: Filter Inventory**
- [ ] Click "Weapon" filter - should show only weapons
- [ ] Click "Common" filter - should show only common items
- [ ] Click "All" to reset

**Test 6.6: Equipment from Battles (Optional)**
- [ ] Go battle and win several times
- [ ] 10% chance per win to get equipment drop
- [ ] Check equipment page for new items
- [ ] New items might be Rare, Epic, or Legendary

**Expected Database State After Phase 6:**
```sql
SELECT name, rarity, slot, equipped
FROM equipment
WHERE lizard_id = (SELECT id FROM lizards LIMIT 1);
-- Should have 3+ items
-- 3 should have equipped = true (one per slot)

SELECT weapon_id, armor_id, accessory_id
FROM lizard_locations
WHERE lizard_id = (SELECT id FROM lizards LIMIT 1);
-- Should reference the 3 equipped item IDs
```

---

### Phase 7: Global Chat (10 minutes)

**Test 7.1: View Chat (Single User)**
- [ ] Click bottom nav: "Chat 💬"
- [ ] Should see empty state: "No messages yet. Be the first to say hello!"
- [ ] Input field at bottom
- [ ] Character counter shows 0/200

**Test 7.2: Send Message**
- [ ] Type a message (e.g., "Hello world!")
- [ ] Click "Send"
- [ ] Message should appear immediately
- [ ] Format: `[Lvl 1 📚] YourUsername: Hello world!`
- [ ] Your message should be highlighted (green background)
- [ ] Timestamp shows relative time (e.g., "just now")

**Test 7.3: Rate Limiting**
- [ ] Immediately try to send another message
- [ ] Should see alert: "Please wait 3 seconds between messages"
- [ ] Wait 3 seconds
- [ ] Send another message - should work

**Test 7.4: Character Limit**
- [ ] Type 201 characters
- [ ] Input should stop at 200
- [ ] Counter shows 200/200

**Test 7.5: Realtime Updates (Multi-User Test)**
- [ ] Open app in second browser/incognito (create 2nd account)
- [ ] Send message from user 2
- [ ] User 1's chat should auto-update with new message
- [ ] No refresh needed (Realtime!)

**Test 7.6: Location Emoji Updates**
- [ ] Switch location (e.g., Home to Gym)
- [ ] Send chat message
- [ ] Should show new location emoji (🏋️ instead of 🏠)

**Expected Database State After Phase 7:**
```sql
SELECT message, username, lizard_level, location_emoji
FROM chat_messages
ORDER BY created_at DESC
LIMIT 10;
-- Should show your recent messages
```

---

### Phase 8: Leaderboard (5 minutes)

**Test 8.1: View Leaderboard (Single User)**
- [ ] Click stats panel → "Leaderboard" button
- [ ] Or click bottom nav → Home → Stats → Leaderboard
- [ ] Should see "Your Rank" card at top
- [ ] Rank shows "#1" (if you're the only player)
- [ ] Rating displayed
- [ ] Below: leaderboard list with your entry highlighted

**Test 8.2: Leaderboard Details**
- [ ] Your entry should have:
  - 🥇 Medal (if rank 1-3)
  - "YOU" badge
  - Yellow background highlight
  - Username, level
  - Wins/Losses
  - Win rate percentage
  - Rating (large, bold)

**Test 8.3: Multi-User Leaderboard**
- [ ] Create 2nd user account (or have friend join)
- [ ] Have both users complete battles
- [ ] Leaderboard should show top 100 by rating
- [ ] Higher rating = higher rank
- [ ] Top 3 get medal emojis (🥇🥈🥉)

**Test 8.4: Win Streak Display**
- [ ] Get 3+ win streak
- [ ] Check leaderboard
- [ ] Should show "🔥 X-Win Streak" under your name

**Expected Database State After Phase 8:**
```sql
SELECT name, level, rating, wins, losses
FROM lizards
ORDER BY rating DESC
LIMIT 100;
-- This is what the leaderboard displays
```

---

## 🎮 Advanced Testing Scenarios

### Scenario A: Active Player (1 Day Simulation)

**Goal:** Simulate an active player's first day

1. **Morning (9 AM):**
   - Sign up and create lizard
   - Switch to Library location
   - Do all 3 care actions
   - Battle 5 opponents (aim for wins)
   - Level up 2-3 times

2. **Lunchtime (12 PM - 3 hours later):**
   - Come back to app
   - Collect passive gold from welcome modal
   - Should have ~180K gold from passive
   - Library should show 3 hours
   - Care actions should be ready again
   - Do all 3 care actions
   - Battle 5 more opponents (daily bonus active!)
   - Level up 5 more times

3. **Evening (6 PM - 6 hours later):**
   - Come back to app
   - Collect passive gold (~360K+)
   - Library should show 9 hours
   - Do care actions again
   - Complete remaining 5 daily battles (10 total for bonus)
   - Check leaderboard rank
   - Send chat message

4. **Before Bed (10 PM - 4 hours later):**
   - Quick check
   - Collect passive gold
   - Library should show 13 hours
   - Level up as much as possible
   - Leave app running overnight

5. **Next Morning (8 AM - 10 hours later):**
   - Open app
   - Welcome modal shows 10 hours offline
   - Massive gold collection (~2M+)
   - Library should show 23 hours
   - One more hour until first full day bonus!

**Expected Results:**
- Level: 15-20
- Rating: 1,100-1,300
- Gold: Several million
- Location bonus: +46% passive gold (23 hours × 2%)
- Happiness: Should fluctuate but stay 60-100%

### Scenario B: Passive Player (1 Week Simulation)

**Goal:** Minimal daily engagement

1. **Day 1:**
   - Create account, switch to Library
   - Do care actions once
   - Close app

2. **Each Day (Days 2-7):**
   - Open app once per day
   - Collect passive gold
   - Do care actions (3 minutes)
   - Battle 1-2 opponents
   - Level up with all gold
   - Close app

3. **End of Week:**
   - Check location hours (should be 150+)
   - Passive gold bonus should be +300%
   - Level should be 30-40
   - Rating might be low (few battles)

### Scenario C: Competitive Player (Min-Max Strategy)

**Goal:** Optimize for leaderboard rank

1. **Phase 1 - Gold Focus (First 50 hours):**
   - Stay at Library exclusively
   - Do care actions religiously every hour
   - Level up aggressively
   - Battle only when necessary

2. **Phase 2 - Combat Prep (Next 50 hours):**
   - Switch to Gym or Dojo
   - Let attack bonuses accumulate
   - Keep leveling
   - Start battling more

3. **Phase 3 - Ranking Push (Next 100+ hours):**
   - Battle constantly
   - Maintain high happiness (1.2× stat multiplier)
   - Build win streaks
   - Equip best gear
   - Climb leaderboard

**Expected Results After 200 Hours:**
- Level: 60-80
- Rating: 2,000+
- Leaderboard rank: Top 10
- Location bonuses: +200% ATK or +400% Passive Gold

---

## 🐛 Known Issues / Edge Cases to Test

### Critical Bugs to Check For:

**1. Location Hour Loss**
- [ ] Switch location at 0h 59min - should lose 59 minutes
- [ ] Switch at 1h 0min - should lose nothing
- [ ] Verify partial hours don't count toward bonuses

**2. Care Action Cooldowns**
- [ ] Do action, then refresh page - cooldown should persist
- [ ] Wait exactly 1 hour - should become available
- [ ] Try to spam actions - should be blocked

**3. Battle Cooldowns**
- [ ] Battle opponent, refresh page - should still be on cooldown
- [ ] Try to battle same opponent twice - should fail
- [ ] Verify 1-hour cooldown per opponent

**4. Gold Calculations**
- [ ] Close app, wait known time, reopen
- [ ] Calculate expected gold: `seconds × base_rate × (1 + library_bonus/100)`
- [ ] Compare to welcome modal amount
- [ ] Should match (within 1-2 seconds variance)

**5. Happiness Decay**
- [ ] Leave app open/closed for 2+ hours
- [ ] Happiness should decrease by 10 (5 per hour)
- [ ] Should never go below 0
- [ ] Should never go above 100

**6. Win Streak Reset**
- [ ] Get 3-win streak
- [ ] Lose a battle
- [ ] Streak should reset to 0
- [ ] Next win should start at 1

**7. ELO Edge Cases**
- [ ] Battle much higher rated opponent and win - big rating gain
- [ ] Battle much lower rated opponent and lose - big rating loss
- [ ] Check that rating changes are asymmetric

**8. Equipment Stat Application**
- [ ] Note your attack with equipment
- [ ] Unequip all items
- [ ] Attack should decrease by exact sum of bonuses
- [ ] Re-equip all
- [ ] Attack should return to original

**9. Realtime Chat**
- [ ] Send message, immediately close browser
- [ ] Open in new browser/incognito
- [ ] Message should still be there (persisted to DB)

**10. Leaderboard Ranking**
- [ ] Win battles to gain rating
- [ ] Check rank improves
- [ ] Lose battles to lose rating
- [ ] Check rank decreases

---

## ✅ Success Criteria

### Must Pass (Critical):
- ✅ Can sign up, create lizard, and reach home screen
- ✅ Can switch locations and accumulate hours
- ✅ Can collect passive gold over time
- ✅ Can perform care actions with working cooldowns
- ✅ Can battle opponents and see results
- ✅ Can level up and see stat increases
- ✅ Can equip/unequip equipment
- ✅ Can send and receive chat messages in real-time
- ✅ Leaderboard shows rankings by rating

### Should Pass (Important):
- ✅ Location bonuses correctly apply to stats
- ✅ Happiness affects battle performance
- ✅ Win streaks increase gold rewards
- ✅ Daily battle bonus works (2× gold for first 10)
- ✅ Equipment from battle drops works
- ✅ ELO rating changes appropriately

### Nice to Have (Polish):
- ✅ Lizard sprite evolves at level milestones
- ✅ Animations and transitions feel smooth
- ✅ Mobile responsiveness works (320px-428px width)
- ✅ Touch targets are large enough (48px)
- ✅ Loading states show during async operations

---

## 📝 Bug Report Template

If you find bugs during testing, document them like this:

```markdown
**Bug:** [Short description]
**Severity:** Critical / High / Medium / Low
**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [Third step]

**Expected Behavior:** [What should happen]
**Actual Behavior:** [What actually happens]
**Screenshot/Video:** [If applicable]
**Console Errors:** [Any errors in browser console]
**Database State:** [Relevant SQL query results]
```

---

## 🎉 Testing Complete!

Once you've verified all critical tests pass, the game is **production-ready**!

Next step: Deploy to Vercel (see COMPLETE_GAME_GUIDE.md for deployment instructions).
