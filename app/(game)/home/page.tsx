import { createClient } from '@/lib/supabase/server';
import { getMyLizard, getLizardLocation, callUpdateLocationProgress, callCollectPassiveGold, getLevelStats } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';
import LizardDisplay from '@/components/game/LizardDisplay';
import CareActions from '@/components/game/CareActions';
import StatsPanel from '@/components/game/StatsPanel';
import WelcomeBackModal from '@/components/game/WelcomeBackModal';
import LevelUpButton from '@/components/game/LevelUpButton';
import GoldDisplay from '@/components/game/GoldDisplay';

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get player
  const { data: playerData } = await supabase
    .from('players')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!playerData) {
    redirect('/auth/login');
  }

  // Get lizard
  const lizard = await getMyLizard(supabase, playerData.id);

  if (!lizard) {
    redirect('/onboarding');
  }

  // Get location
  const location = await getLizardLocation(supabase, lizard.id);

  // Update location progress (count completed hours)
  await callUpdateLocationProgress(supabase, lizard.id);

  // Collect passive gold
  const goldResult = await callCollectPassiveGold(supabase, lizard.id);

  // Refresh lizard data after gold collection
  const updatedLizard = await getMyLizard(supabase, playerData.id);

  if (!updatedLizard) {
    redirect('/onboarding');
  }

  // Get level stats for passive gold rate
  const levelStats = await getLevelStats(supabase, updatedLizard.level);

  // Calculate actual passive rate (base + library bonus)
  const libraryBonus = location.library_hours * 2.0; // 2% per hour
  const passiveRate = levelStats.passive_gold_per_second * (1 + libraryBonus / 100);

  return (
    <div className="min-h-screen p-4">
      {/* Welcome back modal (only shows if significant gold earned) */}
      {goldResult && goldResult.gold_earned > 0 && (
        <WelcomeBackModal
          goldEarned={goldResult.gold_earned}
          secondsElapsed={goldResult.seconds_elapsed}
        />
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-green-600 mb-1">
          {updatedLizard.name}
        </h1>
        <p className="text-gray-600">Level {updatedLizard.level}</p>
      </div>

      {/* Real-time Gold Display */}
      <GoldDisplay
        lizardId={updatedLizard.id}
        initialGold={updatedLizard.gold}
        passiveRate={passiveRate}
      />

      {/* Lizard Display */}
      <LizardDisplay
        lizard={updatedLizard}
        location={location}
      />

      {/* Care Actions */}
      <CareActions
        lizard={updatedLizard}
      />

      {/* Level Up Button */}
      <div className="mb-6">
        <LevelUpButton lizard={updatedLizard} />
      </div>

      {/* Stats Panel */}
      <StatsPanel
        lizard={updatedLizard}
        location={location}
      />
    </div>
  );
}
