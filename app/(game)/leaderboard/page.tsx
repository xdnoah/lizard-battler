import { createClient } from '@/lib/supabase/server';
import { getMyLizard, getLeaderboard } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';
import LeaderboardList from '@/components/game/LeaderboardList';

export default async function LeaderboardPage() {
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

  // Get leaderboard (top 100)
  const leaderboard = await getLeaderboard(supabase, 100);

  // Find current player's rank
  const myRank = leaderboard.findIndex((entry) => entry.id === lizard.id) + 1;

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-600 mb-2">🏆 Leaderboard</h1>
        <p className="text-gray-600">Top players by rating</p>
      </div>

      {/* Your Rank */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl shadow-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white/90 text-sm font-semibold">Your Rank</div>
            <div className="text-white text-3xl font-bold">
              {myRank > 0 ? `#${myRank}` : 'Unranked'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-white/90 text-sm font-semibold">Rating</div>
            <div className="text-white text-2xl font-bold">{lizard.rating}</div>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <LeaderboardList
        leaderboard={leaderboard}
        myLizardId={lizard.id}
      />
    </div>
  );
}
