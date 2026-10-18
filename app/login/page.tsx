'use client';

import React, { useState } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('hello@cybergenii.com');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.tokens?.access?.token) {
          localStorage.setItem('helm_access_token', data.tokens.access.token);
        }
        window.location.href = '/';
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded-xl theme-bg-card border theme-border space-y-6 shadow-xl transition-colors">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-[#10b981] dark:text-[#4edea3] mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold font-sans theme-text-main">
            HELM-GUARD COMMAND ACCESS
          </h1>
          <p className="text-xs font-mono theme-text-muted">
            FLEET TELEMETRY & IGNITION INTERLOCK
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block theme-text-muted mb-1">OPERATOR EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2.5 rounded-lg theme-bg-input border theme-border theme-text-main focus:outline-none"
            />
          </div>

          <div>
            <label className="block theme-text-muted mb-1">SECURITY PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2.5 rounded-lg theme-bg-input border theme-border theme-text-main focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg theme-primary-bg font-bold flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Authenticate Session'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="pt-4 border-t theme-border text-center text-[10px] font-mono theme-text-muted">
          256-BIT SECURE ENCLAVE ACTIVE • LEVEL-3 MISSION CLEARANCE
        </div>
      </div>
    </div>
  );
}
