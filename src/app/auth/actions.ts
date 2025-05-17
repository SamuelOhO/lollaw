'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function signInWithGoogle() {
  const cookieStore = cookies();
  const supabase = await createClient();

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://lollaw.vercel.app' : 'http://localhost:3000');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    console.error('OAuth error:', error);
    return redirect('/auth/login?error=google_signin_error');
  }

  return redirect(data.url);
}
