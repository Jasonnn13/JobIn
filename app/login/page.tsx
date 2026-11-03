'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { safeNext } from '@/lib/safe-redirect';
import { AuthShell } from '@/components/AuthShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const NOTICES: Record<string, string> = {
  'wrong-app': 'That account is an employer account. Log in on JobHire, or log in here with a worker account.',
  'confirm-failed': 'That confirmation link is invalid or has expired. Log in to get a new one.',
  'no-profile': 'This account isn’t fully set up yet. Try again in a moment, or contact support if it keeps happening.',
};

// Seeded by supabase/seeds/demo.sql so testers can try the app. Off unless
// NEXT_PUBLIC_SHOW_DEMO_LOGIN=true (always on with `npm run dev`); when off, the build drops these
// public demo credentials.
const SHOW_DEMO_LOGIN =
  process.env.NEXT_PUBLIC_SHOW_DEMO_LOGIN === 'true' || process.env.NODE_ENV === 'development';
const DEMO_ACCOUNT = { email: 'demo.worker@jobin.test', password: 'JobinDemo2026!' };

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(NOTICES[searchParams.get('error') ?? ''] ?? '');
  const [loading, setLoading] = useState(false);

  const canSubmit = email.trim() !== '' && password !== '' && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) {
      setError(
        signInError.code === 'email_not_confirmed'
          ? 'Confirm your email first. Check your inbox for the link we sent.'
          : 'Incorrect email or password.'
      );
      setLoading(false);
      return;
    }
    // The role lives in profiles; my_role() reads it for the signed-in user.
    const { data: role } = await supabase.rpc('my_role');
    if (role !== 'worker') {
      await supabase.auth.signOut();
      setError(NOTICES[role ? 'wrong-app' : 'no-profile']);
      setLoading(false);
      return;
    }

    router.replace(safeNext(searchParams.get('next'), '/home'));
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
        {loading ? 'Logging in…' : 'Log in'}
      </Button>
      {SHOW_DEMO_LOGIN && (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setEmail(DEMO_ACCOUNT.email);
            setPassword(DEMO_ACCOUNT.password);
            setError('');
          }}
        >
          Use the demo worker account
        </Button>
      )}
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Log in"
      subtitle={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
