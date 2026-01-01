import { createClient } from '@/lib/supabase/server';
import { getMyLizard, getLizardLocation, getRecentMessages } from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';
import ChatRoom from '@/components/game/ChatRoom';
import { getLocationEmoji } from '@/lib/utils/format';

export default async function ChatPage() {
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

  // Get location for emoji
  const location = await getLizardLocation(supabase, lizard.id);
  const locationEmoji = getLocationEmoji(location.current_location);

  // Get recent messages
  const recentMessages = await getRecentMessages(supabase, 50);

  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-green-600 mb-1">Global Chat</h1>
        <p className="text-sm text-gray-600">Chat with other players in real-time</p>
      </div>

      {/* Chat Room */}
      <ChatRoom
        playerId={playerData.id}
        username={playerData.username}
        lizardLevel={lizard.level}
        locationEmoji={locationEmoji}
        initialMessages={recentMessages}
      />
    </div>
  );
}
