'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Key, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [operatorId, setOperatorId] = useState('ADMIN-01');
  const [accessKey, setAccessKey] = useState('••••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/';
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md p-8 rounded bg-[#181c24] border border-[#3c4a42] space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#10b981]/20 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3] mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold font-sans text-[#dfe2ee]">
            HELM-GUARD COMMAND ACCESS
          </h1>
          <p className="text-xs font-mono text-[#86948a]">
            FLEET TELEMETRY & IGNITION INTERLOCK
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-[#86948a] mb-1">OPERATOR IDENTIFIER</label>
            <div className="relative">
              <input
                type="text"
                value={operatorId}
                onChange={(e) => setOperatorId(e.target.value)}
                className="w-full p-2.5 rounded bg-[#1c2028] border border-[#3c4a42] text-[#dfe2ee] focus:border-[#4edea3] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#86948a] mb-1">SECURITY TOKEN / KEY</label>
            <div className="relative">
              <input
                type="password"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                className="w-full p-2.5 rounded bg-[#1c2028] border border-[#3c4a42] text-[#dfe2ee] focus:border-[#4edea3] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded bg-[#10b981] hover:bg-[#4edea3] text-[#002113] font-bold flex items-center justify-center gap-2 transition-all"
            >
              <span>Authenticate Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#3c4a42]/30 text-center text-[10px] font-mono text-[#86948a]">
          256-BIT SECURE ENCLAVE ACTIVE • LEVEL-3 MISSION CLEARANCE
        </div>
      </div>
    </div>
  );
}
