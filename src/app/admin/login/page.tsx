'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Lock, 
  KeyRound, 
  Mail, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Loader2,
  Store,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextDestination = searchParams.get('next') || '/admin';

  // Toggle between PIN (fast phone access) and Password
  const [authMode, setAuthMode] = useState<'pin' | 'password'>('pin');

  // Form State
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('owner@arubekee.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const payload = authMode === 'pin' 
        ? { authMode: 'pin', pin: pin.trim() }
        : { authMode: 'password', email: email.trim(), password: password.trim() };

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      // Hard redirect to make sure middleware and cookies sync
      window.location.href = nextDestination;
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to sign in. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 sm:p-6">
      
      {/* Brand Badge */}
      <div className="text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#EADDCF] rounded-full text-oxblood text-[10px] uppercase font-semibold tracking-widest shadow-xs">
          <Sparkles className="w-3 h-3 text-gold" />
          <span>Atelier Management Portal</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-obsidian tracking-wide uppercase mt-2">
          ARUBEKEE
        </h1>
        <p className="text-xs text-obsidian-muted font-sans tracking-widest uppercase font-semibold -mt-1">
          Boutique Owner Access
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white rounded-2xl border border-[#EADDCF] shadow-card p-6 sm:p-8 space-y-6">
        
        {/* Toggle Login Mode: Quick PIN vs Password */}
        <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl text-xs font-semibold select-none">
          <button
            type="button"
            onClick={() => { setAuthMode('pin'); setErrorMessage(null); }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              authMode === 'pin'
                ? 'bg-white text-stone-900 shadow-sm font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Quick PIN</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('password'); setErrorMessage(null); }}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
              authMode === 'password'
                ? 'bg-white text-stone-900 shadow-sm font-bold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Password</span>
          </button>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {authMode === 'pin' ? (
            /* 1. Quick PIN Input (Thumb-Optimized for Phones) */
            <div className="space-y-2">
              <label className="block text-xs uppercase font-bold tracking-wider text-stone-700 text-center">
                Enter 6-Digit Store PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  className="w-full text-center text-3xl tracking-[0.4em] font-mono py-3.5 bg-stone-50 border-2 border-stone-200 rounded-xl focus:outline-none focus:border-oxblood focus:bg-white text-stone-900 transition-all font-bold placeholder:text-stone-300"
                />
              </div>
              <p className="text-[11px] text-stone-500 text-center">
                Fast smartphone sign-in for store owner & boutique staff.
              </p>
            </div>
          ) : (
            /* 2. Email & Password Input */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs uppercase font-bold tracking-wider text-stone-700">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@arubekee.com"
                    className="w-full pl-10 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-oxblood focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase font-bold tracking-wider text-stone-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-oxblood focus:bg-white transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading || (authMode === 'pin' && pin.length < 4)}
            className="w-full mt-4 py-3 bg-oxblood hover:bg-oxblood-hover text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-99"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Access...</span>
              </>
            ) : (
              <>
                <span>Enter Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security & Credentials Notice */}
        <div className="pt-4 border-t border-stone-100 space-y-2">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 space-y-1">
            <div className="font-semibold text-stone-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Default Store Access Credentials:</span>
            </div>
            <div className="font-mono text-[10px] text-stone-700 space-y-0.5 pt-0.5">
              <div>Quick PIN: <strong className="text-oxblood">202688</strong></div>
              <div>Password: <strong className="text-oxblood">Arubekee@Aba2026</strong></div>
            </div>
          </div>
        </div>

      </div>

      {/* Return to Public Storefront */}
      <div className="text-center mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-oxblood font-medium transition-colors"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Return to Arubekee Consumer Storefront</span>
        </Link>
      </div>

    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-ivory-warm flex items-center justify-center py-12 px-4 selection:bg-oxblood selection:text-white">
      <Suspense fallback={
        <div className="flex items-center justify-center p-8 text-xs text-stone-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span>Loading portal...</span>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}

