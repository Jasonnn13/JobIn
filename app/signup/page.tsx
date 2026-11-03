'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AuthShell } from '@/components/AuthShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const MIN_PASSWORD = 8;

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const passwordTooShort = password.length > 0 && password.length < MIN_PASSWORD;
  const canSubmit = username.trim().length >= 2 && email.trim() !== '' && password.length >= MIN_PASSWORD && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    const { data, error: signUpError } = await createClient().auth.signUp({
      email: email.trim(),
      password,
      options: {
        // The database trigger reads these to create the worker profile.
        data: { username: username.trim(), role: 'worker' },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/home`,
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(
        signUpError.code === 'user_already_exists'
          ? 'An account with this email already exists. Log in instead.'
          : signUpError.code === 'weak_password'
            ? 'Choose a stronger password: at least 8 characters, mixing letters and numbers.'
            : 'Your account couldn’t be created. Check your details and try again.'
      );
      return;
    }
    if (data.session) {
      router.replace('/home');
      router.refresh();
    } else {
      setCheckEmail(true);
    }
  };

  if (checkEmail) {
    return (
      <AuthShell title="Check your email" subtitle={`We sent a confirmation link to ${email.trim()}.`}>
        <div className="flex items-start gap-3 rounded-xl bg-accent p-4 text-accent-foreground">
          <MailCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p className="text-base">Open the link on this phone to finish signing up. Then you can log in.</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="username">Your name</Label>
          <Input id="username" autoComplete="name" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-describedby="password-hint"
            aria-invalid={passwordTooShort || undefined}
            required
          />
          <p id="password-hint" className={`text-sm ${passwordTooShort ? 'text-destructive' : 'text-muted-foreground'}`}>
            At least {MIN_PASSWORD} characters.
          </p>
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
          {loading ? 'Creating account…' : 'Sign up'}
        </Button>
      </form>
    </AuthShell>
  );
}
