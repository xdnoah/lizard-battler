'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UsePassiveGoldOptions {
  lizardId: string;
  initialGold: number;
  passiveRate: number; // gold per second
  onSync?: (newGold: number) => void;
}

export function usePassiveGold({
  lizardId,
  initialGold,
  passiveRate,
  onSync,
}: UsePassiveGoldOptions) {
  const [displayGold, setDisplayGold] = useState(initialGold);
  const [isSyncing, setIsSyncing] = useState(false);
  const lastSyncTime = useRef(Date.now());
  const supabase = createClient();

  // Client-side gold calculation (updates every second)
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayGold((prev) => prev + passiveRate);
    }, 1000);

    return () => clearInterval(interval);
  }, [passiveRate]);

  // Sync with server every 30 seconds
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      await syncWithServer();
    }, 30000); // 30 seconds

    return () => clearInterval(syncInterval);
  }, [lizardId]);

  // Sync when page becomes visible again (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncWithServer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [lizardId]);

  // Sync function
  const syncWithServer = async () => {
    if (isSyncing) return; // Prevent multiple simultaneous syncs

    setIsSyncing(true);
    try {
      // Call the collect_passive_gold function
      const { data, error } = await supabase.rpc('collect_passive_gold', {
        lizard_uuid: lizardId,
      });

      if (error) {
        console.error('Failed to sync gold:', error);
        return;
      }

      if (data) {
        const serverGold = data.new_gold;

        // Update display gold to match server
        setDisplayGold(serverGold);
        lastSyncTime.current = Date.now();

        // Callback for parent component
        if (onSync) {
          onSync(serverGold);
        }
      }
    } catch (err) {
      console.error('Gold sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual sync function (call when user does an action that changes gold)
  const forceSync = () => {
    syncWithServer();
  };

  return {
    gold: Math.floor(displayGold), // Always show whole numbers
    isSyncing,
    forceSync,
  };
}
