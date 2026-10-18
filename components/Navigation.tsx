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
import { ThemeToggle } from '@/components/ThemeToggle';

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
    <header className="h-16 theme-bg-nav border-b theme-border px-6 flex items-center justify-between sticky top-0 z-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded bg-[#10b981]/20 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3]">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-base theme-text-main font-sans">HELM-GUARD</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded theme-bg-subtle text-[#10b981] dark:text-[#4edea3] border theme-border">
              v1.0.0
            </span>
          </div>
          <p className="text-[11px] font-mono theme-text-sub tracking-tight">
            MISSION-CRITICAL TELEMETRY & IGNITION INTERLOCK
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg theme-bg-subtle border theme-border text-xs font-mono">
          <div className="w-2 h-2 rounded-full bg-[#10b981] dark:bg-[#4edea3] pulse-ring" />
          <span className="text-[#10b981] dark:text-[#4edea3] font-medium">STREAM NOMINAL</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-mono theme-text-sub theme-bg-subtle px-3 py-1.5 rounded-lg border theme-border">
          <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-[#adc6ff]" />
          <span>{timeStr || '12:00:00 UTC'}</span>
        </div>

        {/* Dark / Light Mode Switcher */}
        <ThemeToggle />
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
    <aside className="w-64 theme-bg-sidebar border-r theme-border flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)] transition-colors">
      <nav className="space-y-1.5">
        <div className="text-[10px] font-mono font-bold tracking-wider theme-text-muted uppercase px-3 py-2">
          Fleet Operations
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'theme-bg-subtle text-[#10b981] dark:text-[#4edea3] border-l-2 border-[#10b981] dark:border-[#4edea3] font-semibold'
                  : 'theme-text-sub hover:theme-bg-subtle hover:theme-text-main'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#10b981] dark:text-[#4edea3]' : 'theme-text-muted'}`} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 theme-bg-card rounded-lg border theme-border text-xs font-mono">
        <div className="flex items-center justify-between theme-text-muted mb-2 text-[11px]">
          <span>IGNITION INTERLOCK</span>
          <Radio className="w-3.5 h-3.5 text-[#10b981] dark:text-[#4edea3]" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] dark:bg-[#4edea3]" />
          <span className="theme-text-main font-bold">READY / ARMED</span>
        </div>
        <p className="text-[10px] theme-text-muted mt-1.5">
          Dual-Factor Interlock Active
        </p>
      </div>
    </aside>
  );
}
