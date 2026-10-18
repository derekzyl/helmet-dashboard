'use client';

import React, { useState, useEffect } from 'react';
import { fetchDevices, fetchEvents, Device, SafetyEvent } from '@/lib/api';
import { TrendingUp, ShieldCheck, AlertOctagon, Activity, RefreshCw } from 'lucide-react';

export default function AnalyticsPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [events, setEvents] = useState<SafetyEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const [d, e] = await Promise.all([fetchDevices(), fetchEvents(100)]);
    setDevices(d);
    setEvents(e);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const helmetsCount = devices.filter((d) => d.device_type === 'HELMET').length;
  const ignitionsCount = devices.filter((d) => d.device_type === 'IGNITION').length;
  const alcoholViolations = events.filter((e) => e.event_type === 'ALCOHOL_LOCKOUT' || e.event_type === 'ALCOHOL_VIOLATION').length;
  const collisions = events.filter((e) => e.event_type === 'COLLISION').length;

  const metrics = [
    { label: 'Registered Helmets', value: `${helmetsCount} Units`, change: helmetsCount > 0 ? 'Active in Fleet' : 'Awaiting Units', icon: TrendingUp },
    { label: 'Safety Compliance Rate', value: alcoholViolations === 0 ? '100%' : `${Math.max(0, 100 - alcoholViolations * 10)}%`, change: 'Sober Parameters', icon: ShieldCheck },
    { label: 'Alcohol Lockouts', value: `${alcoholViolations} Violations`, change: alcoholViolations === 0 ? 'Zero Violations' : 'Interlock Engaged', icon: Activity },
    { label: 'Collision Incidents', value: `${collisions} Events`, change: collisions === 0 ? 'Zero Crashes' : 'Emergency Dispatched', icon: AlertOctagon },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b theme-border">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 rounded theme-bg-subtle text-[#10b981] dark:text-[#4edea3] border theme-border">
            TELEMETRY INTELLIGENCE
          </span>
          <h1 className="text-2xl font-bold font-sans theme-text-main tracking-tight mt-1">
            Fleet Safety Analytics & Compliance
          </h1>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg theme-bg-card hover:opacity-80 theme-text-sub border theme-border text-xs font-mono transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Analytics</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="p-5 rounded-lg theme-bg-card border theme-border space-y-2 transition-colors">
              <div className="flex items-center justify-between text-xs font-mono theme-text-muted">
                <span>{m.label}</span>
                <Icon className="w-4 h-4 text-[#10b981] dark:text-[#4edea3]" />
              </div>
              <div className="text-2xl font-bold font-mono theme-text-main">{m.value}</div>
              <div className="text-[11px] font-mono text-[#10b981] dark:text-[#4edea3]">{m.change}</div>
            </div>
          );
        })}
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance & Interlock Summary */}
        <div className="p-5 rounded-lg theme-bg-card border theme-border space-y-4 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono theme-text-muted">
            <span>INTERLOCK INTEGRITY STATUS</span>
            <span className="text-[#10b981] dark:text-[#4edea3]">THRESHOLD: 0.050% BAC</span>
          </div>

          <div className="p-6 rounded-lg theme-bg-subtle border theme-border-subtle text-center space-y-2">
            <div className="text-3xl font-black font-mono text-[#10b981] dark:text-[#4edea3]">
              {ignitionsCount > 0 ? `${ignitionsCount} Paired Relays` : 'Ready For Hardware'}
            </div>
            <p className="text-xs font-mono theme-text-muted max-w-sm mx-auto">
              Automated solid-state relays (SSR) prevent motorcycle engine starter engagement when alcohol exceeds legal limits or when the helmet is not worn.
            </p>
          </div>

          <div className="space-y-2 pt-2 text-xs font-mono">
            <div className="flex justify-between theme-text-sub">
              <span>Dual-Factor Pre-Ride Verification:</span>
              <span className="text-[#10b981] dark:text-[#4edea3] font-bold">ENFORCED</span>
            </div>
            <div className="flex justify-between theme-text-sub">
              <span>Anti-Stall Latched Protection:</span>
              <span className="text-[#10b981] dark:text-[#4edea3] font-bold">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* 6-Axis IMU Crash Detection Status */}
        <div className="p-5 rounded-lg theme-bg-card border theme-border space-y-4 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono theme-text-muted">
            <span>6-AXIS IMU ROAD VIBRATION & SHOCK</span>
            <span className="text-blue-500 dark:text-[#adc6ff]">COLLISION DETECTION</span>
          </div>

          <div className="space-y-3 py-4 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex justify-between theme-text-sub">
                <span>Normal Riding Vibrations (&lt; 1.5G)</span>
                <span className="text-[#10b981] dark:text-[#4edea3]">Nominal</span>
              </div>
              <div className="w-full theme-bg-input h-2 rounded-full overflow-hidden border theme-border-subtle">
                <div className="bg-[#10b981] dark:bg-[#4edea3] h-full w-[100%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between theme-text-sub">
                <span>Pothole & Speedbump Shock (1.5G - 3.5G)</span>
                <span className="text-cyan-500">Filtered</span>
              </div>
              <div className="w-full theme-bg-input h-2 rounded-full overflow-hidden border theme-border-subtle">
                <div className="bg-cyan-500 h-full w-[0%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between theme-text-sub">
                <span>Severe Impact Potential (&ge; 4.0G)</span>
                <span className={collisions > 0 ? 'text-rose-500 font-bold' : 'theme-text-muted'}>
                  {collisions > 0 ? `${collisions} Detected` : '0 Recorded'}
                </span>
              </div>
              <div className="w-full theme-bg-input h-2 rounded-full overflow-hidden border theme-border-subtle">
                <div className="bg-rose-500 h-full w-[0%]" />
              </div>
            </div>
          </div>
          <p className="text-[11px] font-mono theme-text-muted text-center">
            Multi-stage impact analysis filters out false alarms with a 20-second cancellable pre-alert window.
          </p>
        </div>
      </div>
    </div>
  );
}
