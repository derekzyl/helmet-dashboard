'use client';

import React from 'react';
import { BarChart3, TrendingUp, ShieldCheck, AlertOctagon, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const metrics = [
    { label: 'Total Fleet Distance', value: '4,892 km', change: '+12.4%', icon: TrendingUp },
    { label: 'Safety Compliance Rate', value: '98.6%', change: '+1.8%', icon: ShieldCheck },
    { label: 'Alcohol Interlocks', value: '0 Violations', change: '100% Sober', icon: Activity },
    { label: 'False Alarms Cancelled', value: '14 Events', change: 'Button A Filtered', icon: AlertOctagon },
  ];

  const hourlyBAC = [
    { hour: '08:00', bac: 0.000 },
    { hour: '10:00', bac: 0.005 },
    { hour: '12:00', bac: 0.012 },
    { hour: '14:00', bac: 0.008 },
    { hour: '16:00', bac: 0.015 },
    { hour: '18:00', bac: 0.010 },
    { hour: '20:00', bac: 0.000 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#3c4a42]/40">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1c2028] text-[#4edea3] border border-[#3c4a42]">
            TELEMETRY INTELLIGENCE
          </span>
          <h1 className="text-2xl font-bold font-sans text-[#dfe2ee] tracking-tight mt-1">
            Fleet Safety Analytics & Compliance
          </h1>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="p-5 rounded bg-[#181c24] border border-[#3c4a42]/50 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#86948a]">
                <span>{m.label}</span>
                <Icon className="w-4 h-4 text-[#4edea3]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#dfe2ee]">{m.value}</div>
              <div className="text-[11px] font-mono text-[#4edea3]">{m.change}</div>
            </div>
          );
        })}
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly BAC Profile Chart */}
        <div className="p-5 rounded bg-[#181c24] border border-[#3c4a42]/50 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#86948a]">
            <span>BREATHALYZER BAC DISTRIBUTION</span>
            <span className="text-[#4edea3]">THRESHOLD: 0.050%</span>
          </div>

          <div className="h-64 flex items-end gap-6 pt-8 pb-4 px-2">
            {hourlyBAC.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="text-[10px] font-mono text-[#86948a]">
                  {item.bac.toFixed(3)}%
                </div>
                <div
                  className="w-full bg-[#10b981] rounded-t transition-all hover:bg-[#4edea3]"
                  style={{ height: `${Math.max(12, (item.bac / 0.03) * 100)}%` }}
                />
                <div className="text-[10px] font-mono text-[#bbcabf]">{item.hour}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] font-mono text-[#86948a] text-center">
            All breath tests remained strictly within nominal sober parameters.
          </p>
        </div>

        {/* Impact G Distribution */}
        <div className="p-5 rounded bg-[#181c24] border border-[#3c4a42]/50 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#86948a]">
            <span>6-AXIS IMU ROAD VIBRATION & SHOCK</span>
            <span className="text-[#adc6ff]">POTHOLE VS ACCIDENT</span>
          </div>

          <div className="space-y-3 py-4 font-mono text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-[#bbcabf]">
                <span>Normal Riding Vibrations (&lt; 1.5G)</span>
                <span className="text-[#4edea3]">98.2%</span>
              </div>
              <div className="w-full bg-[#0a0e16] h-2 rounded-full overflow-hidden">
                <div className="bg-[#4edea3] h-full w-[98.2%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[#bbcabf]">
                <span>Pothole & Speedbump Shock (1.5G - 3.5G)</span>
                <span className="text-[#4cd7f6]">1.8%</span>
              </div>
              <div className="w-full bg-[#0a0e16] h-2 rounded-full overflow-hidden">
                <div className="bg-[#4cd7f6] h-full w-[1.8%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[#bbcabf]">
                <span>Severe Impact Potential (&ge; 4.0G)</span>
                <span className="text-[#ffb4ab]">0.0%</span>
              </div>
              <div className="w-full bg-[#0a0e16] h-2 rounded-full overflow-hidden">
                <div className="bg-[#ffb4ab] h-full w-[0%]" />
              </div>
            </div>
          </div>
          <p className="text-[11px] font-mono text-[#86948a] text-center">
            Zero fatal crashes logged in the past 30 operating days.
          </p>
        </div>
      </div>
    </div>
  );
}
