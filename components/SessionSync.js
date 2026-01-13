'use client';

import { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { usePathname } from 'next/navigation';

export default function SessionSync() {
  // 1. Destructure the correct function 'refreshAuth' from your AuthProvider
  const { user, refreshAuth } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    // Only check if we are logged in
    if (!user) return;

    const syncSession = async () => {
      try {
        // 2. Fetch fresh data directly from DB (bypassing cache)
        const res = await fetch('/api/user/me', { cache: 'no-store' });

        if (res.ok) {
          const freshUser = await res.json();

          // 3. Compare the image in the Browser (user.image) vs Database (freshUser.image)
          // Use '|| null' to treat undefined and null as the same
          const currentImage = user.image || null;
          const dbImage = freshUser.image || null;

          if (dbImage !== currentImage) {
            console.log('🔄 Syncing stale session data...');

            // 4. Call the function that actually exists in your AuthProvider
            if (typeof refreshAuth === 'function') {
              await refreshAuth();
            } else {
              // Fallback: If something is wrong, force a hard reload
              window.location.reload();
            }
          }
        }
      } catch (error) {
        console.error('Session sync failed', error);
      }
    };

    syncSession();

    // Only run on navigation changes to avoid infinite loops
  }, [pathname]);

  return null;
}
