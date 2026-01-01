import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getPlayer, getMyLizard } from '@/lib/supabase/queries';
import BottomNav from '@/components/game/BottomNav';

export default async function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check if player exists
  try {
    const player = await getPlayer(supabase, user.id);

    // Check if lizard exists
    const lizard = await getMyLizard(supabase, player.id);

    if (!lizard) {
      // No lizard yet, redirect to onboarding
      redirect('/onboarding');
    }
  } catch (error) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 pb-20">
      {/* Main content area */}
      <main className="max-w-md mx-auto">
        {children}
      </main>

      {/* Bottom navigation */}
      <BottomNav />
    </div>
  );
}
