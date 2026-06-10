'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareWarning } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);

      const payload = JSON.parse(atob(res.data.accessToken.split('.')[1]));
      const role = payload.role;

      if(role === 'ADMIN') {
        router.push('/admin');
      }
      else if(role === 'OFFICIAL') {
        router.push('/official');
      }
      else router.push('/dashboard');
    } catch (e: any) {
      setError(e.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="size-9 rounded-xl bg-neutral-900 text-white flex justify-center items-center">
            <MessageSquareWarning className="size-5" />
          </div>
          <span className="font-bold text-xl">NagarSeva</span>
        </div>

        <Card className="shadow-sm bg-card">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-4">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="border border-border rounded-lg bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/70 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                className="border border-border rounded-lg bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/70 focus:border-transparent"
              />
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-foreground font-medium hover:underline">
                Register
              </Link>
            </p>

          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground/70 mt-6">
          <Link href="/" className="hover:underline">← Back to home</Link>
        </p>
        
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

      </div>
    </div>
  );
}