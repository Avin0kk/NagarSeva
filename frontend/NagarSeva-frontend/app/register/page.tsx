'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquareWarning, Phone } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import {Eye, EyeOff} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('CITIZEN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if(!email || !password || !confirmPassword || !fullName || !phone) {
        setError('Please fill in all fields');
        return;
    }
    if(password !== confirmPassword) {
        setError('Passwords do not match');
        return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { email, password, fullName, phone, role });
      router.push('/login');
    }
    catch (e: any) {
      console.log("hi", e.response?.data);
        setError(e.response?.data?.error || 'Registration failed');
    }
    finally {
        setLoading(false);
    }
  };

  const passwordChecks = {
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /\d/.test(password),
  special: /[@$!%*?&]/.test(password),
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="size-9 rounded-xl bg-neutral-900 text-white flex justify-center items-center">
            <MessageSquareWarning className="size-5" />
          </div>
          <span className="font-bold text-xl">NagarSeva</span>
        </div>

        <Card className="shadow-sm bg-card">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Create account</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">Join NagarSeva today</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 pt-4">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">Fullname</label>
              <input
                type="text"
                placeholder="fullName"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
                className="border border-border rounded-lg bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/70 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
                className="border border-border rounded-lg bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/70 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleRegister()}
                  className="w-full border border-border rounded-lg bg-background px-3 py-2.5 pr-10 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/70 focus:border-transparent"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="mt-2 text-sm space-y-1">
                <p className={passwordChecks.length ? "text-green-600" : "text-red-600"}>
                  {passwordChecks.length ? "✓" : "✗"} At least 8 characters
                </p>

                <p className={passwordChecks.uppercase ? "text-green-600" : "text-red-600"}>
                  {passwordChecks.uppercase ? "✓" : "✗"} One uppercase letter
                </p>

                <p className={passwordChecks.lowercase ? "text-green-600" : "text-red-600"}>
                  {passwordChecks.lowercase ? "✓" : "✗"} One lowercase letter
                </p>

                <p className={passwordChecks.number ? "text-green-600" : "text-red-600"}>
                  {passwordChecks.number ? "✓" : "✗"} One number
                </p>

                <p className={passwordChecks.special ? "text-green-600" : "text-red-600"}>
                  {passwordChecks.special ? "✓" : "✗"} One special character
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleRegister()}
                  className="w-full border border-border rounded-lg bg-background px-3 py-2.5 pr-10 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/70 focus:border-transparent"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <p
                  className={
                    password === confirmPassword
                      ? "text-green-600 text-sm"
                      : "text-red-600 text-sm"
                  }
                >
                  {password === confirmPassword
                    ? "✓ Passwords match"
                    : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
                className="border border-border rounded-lg bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/70 focus:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-muted-foreground">Role</label>
            <select
            value={role}
             onChange={e => setRole(e.target.value)}
             className="border border-border rounded-lg bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/70"
            >
            <option value="CITIZEN">Citizen</option>
            <option value="OFFICIAL">Official</option>
            </select>
            </div>

            <Button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 mt-2"
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-foreground font-medium hover:underline">
                Sign in
              </Link>
            </p>

          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground/70 mt-6">
          <Link href="/" className="hover:underline">← Back to home</Link>
        </p>
        <div className="absolute top-4 right-4">
        </div>
      </div>
    </div>
  );
}
