import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
      },
      cookies: {
        get(name: string) {
          if (typeof window === 'undefined') return undefined;
          const cookie = document.cookie.split('; ').find(row => row.startsWith(`${name}=`));
          return cookie ? decodeURIComponent(cookie.split('=')[1]) : undefined;
        },
        set(name: string, value: string, options: any) {
          if (typeof window === 'undefined') return;
          let cookie = `${name}=${encodeURIComponent(value)}`;
          if (options.maxAge) {
            cookie += `; Max-Age=${options.maxAge}`;
          }
          if (options.path) {
            cookie += `; Path=${options.path}`;
          }
          if (options.sameSite) {
            cookie += `; SameSite=${options.sameSite}`;
          }
          if (process.env.NODE_ENV === 'production') {
            cookie += `; Secure`;
          }
          document.cookie = cookie;
        },
        remove(name: string, options: any) {
          if (typeof window === 'undefined') return;
          document.cookie = `${name}=; Max-Age=0; Path=${options.path || '/'}`;
        },
      },
    }
  );
};
