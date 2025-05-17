import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/app/supabase';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (!name.startsWith('sb-')) return undefined;
          try {
            const cookie = cookieStore.get(name);
            return cookie?.value;
          } catch (e) {
            return undefined;
          }
        },
        set(name: string, value: string, options: any) {
          if (!name.startsWith('sb-')) return;
          try {
            cookieStore.set({
              name,
              value,
              ...options,
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
              httpOnly: true,
              maxAge: 60 * 60 * 24 * 7, // 7일
            });
          } catch (error) {
            console.error('Cookie set error:', error);
          }
        },
        remove(name: string, options: any) {
          if (!name.startsWith('sb-')) return;
          try {
            cookieStore.delete({
              name,
              ...options,
              path: '/',
            });
          } catch (error) {
            console.error('Cookie remove error:', error);
          }
        },
      },
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );
}
