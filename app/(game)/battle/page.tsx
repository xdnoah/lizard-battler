import { createClient } from '@/lib/supabase/server';
import { getMyLizard, getAvailableOpponents } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';
import OpponentList from '@/components/game/OpponentList';
import BattleHistory from '@/components/game/BattleHistory';

export default async function BattlePage() {
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

  // Get available opponents (similar rating range)
  const opponents = await getAvailableOpponents(supabase, lizard.id, 20);

  // Get battle cooldowns
  const { data: cooldowns } = await supabase
    .from('battle_cooldowns')
    .select('*')
    .eq('attacker_id', lizard.id)
    .gt('can_battle_again_at', new Date().toISOString());

  return (
    <div className="min-h-screen p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-green-600 mb-2">Battle Arena</h1>
        <p className="text-gray-600">Challenge other players' lizards to combat!</p>
      </div>

      {/* Your Stats */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Your Battle Stats</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Rating</div>
            <div className="text-xl font-bold text-blue-600">{lizard.rating}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Win Rate</div>
            <div className="text-xl font-bold text-green-600">
              {lizard.wins + lizard.losses > 0
                ? Math.round((lizard.wins / (lizard.wins + lizard.losses)) * 100)
                : 0}
              %
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Record</div>
            <div className="text-sm font-bold text-purple-600">
              {lizard.wins}W / {lizard.losses}L
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-xs text-gray-600 mb-1">Win Streak</div>
            <div className="text-xl font-bold text-yellow-600">
              {lizard.current_win_streak}
              {lizard.current_win_streak > 0 ? ' 🔥' : ''}
            </div>
          </div>
        </div>

        {/* Daily battles bonus */}
        {lizard.battles_today < 10 && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2 text-center">
            <span className="text-sm text-green-700">
              ⭐ Daily Bonus Active! {10 - lizard.battles_today} battles left (2× gold)
            </span>
          </div>
        )}
      </div>

      {/* Opponent List */}
      <OpponentList
        myLizard={lizard}
        opponents={opponents}
        cooldowns={cooldowns || []}
      />

      {/* Battle History */}
      <BattleHistory lizardId={lizard.id} />
    </div>
  );
}
