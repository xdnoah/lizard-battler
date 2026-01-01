'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RootPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        router.replace('/home');
      } else {
        router.replace('/auth/signup');
      }
    };

    checkAuth();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-green-100">
      <div className="text-center">
        <div className="text-6xl mb-4">🦎</div>
        <div className="text-2xl font-bold text-green-600">Loading...</div>
      </div>
    </div>
  );
}
