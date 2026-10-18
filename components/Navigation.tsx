'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Gauge, 
  MapPin, 
  Cpu, 
  BarChart3, 
  AlertTriangle, 
  Users, 
  ShieldCheck,
  Radio,
  Clock
} from 'lucide-react';

export function Navbar() {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(' ')[0] + ' UTC');
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-16 bg-[#0a0e16] border-b border-[#3c4a42]/50 px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded bg-[#10b981]/20 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3]">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-base text-[#dfe2ee] font-sans">HELM-GUARD</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1c2028] text-[#4edea3] border border-[#3c4a42]">
              v1.0.0
            </span>
          </div>
          <p className="text-[11px] font-mono text-[#bbcabf] tracking-tight">
            MISSION-CRITICAL TELEMETRY & IGNITION INTERLOCK
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#181c24] border border-[#3c4a42]/40 text-xs font-mono">
          <div className="w-2 h-2 rounded-full bg-[#4edea3] pulse-ring" />
          <span className="text-[#4edea3]">TELEMETRY STREAM NOMINAL</span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#bbcabf] bg-[#181c24] px-3 py-1.5 rounded border border-[#3c4a42]/40">
          <Clock className="w-3.5 h-3.5 text-[#adc6ff]" />
          <span>{timeStr || '12:00:00 UTC'}</span>
        </div>
      </div>
    </header>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Telemetry Cockpit', icon: Gauge },
    { href: '/map', label: 'Live Fleet Map', icon: MapPin },
    { href: '/devices', label: 'Device Registry', icon: Cpu },
    { href: '/analytics', label: 'Analytics Panel', icon: BarChart3 },
    { href: '/alerts', label: 'Alert Centre', icon: AlertTriangle },
    { href: '/riders', label: 'Rider Profiles', icon: Users },
  ];

  return (
    <aside className="w-64 bg-[#0a0e16] border-r border-[#3c4a42]/50 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <nav className="space-y-1.5">
        <div className="text-[10px] font-mono font-bold tracking-wider text-[#86948a] uppercase px-3 py-2">
          Fleet Operations
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#1c2028] text-[#4edea3] border-l-2 border-[#4edea3] font-semibold'
                  : 'text-[#bbcabf] hover:bg-[#181c24] hover:text-[#dfe2ee]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#4edea3]' : 'text-[#86948a]'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 bg-[#181c24] rounded border border-[#3c4a42]/40 text-xs font-mono">
        <div className="flex items-center justify-between text-[#86948a] mb-2 text-[11px]">
          <span>IGNITION STATUS</span>
          <Radio className="w-3.5 h-3.5 text-[#4edea3]" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4edea3]" />
          <span className="text-[#dfe2ee] font-bold">READY / ARMED</span>
        </div>
        <p className="text-[10px] text-[#86948a] mt-1.5">
          Dual-Factor Interlock Active
        </p>
      </div>
    </aside>
  );
}
