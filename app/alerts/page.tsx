'use client';

import React, { useState, useEffect } from 'react';
import { fetchEvents, SafetyEvent } from '@/lib/api';
import { AlertTriangle, ShieldAlert, CheckCircle, PhoneCall, ExternalLink } from 'lucide-react';

export default function AlertsPage() {
  const [events, setEvents] = useState<SafetyEvent[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');

  useEffect(() => {
    fetchEvents(50).then((res) => {
      if (res && res.length > 0) setEvents(res);
      else {
        // Fallback seeded demo alerts
        setEvents([
          {
            id: 'evt-1',
            device_id: 'HLM-ESP32-001',
            event_type: 'COLLISION',
            severity: 'CRITICAL',
            description: 'Simulated 5.5G high-g collision impact detected with 75 deg tilt',
            latitude: 6.5244,
            longitude: 3.3792,
            is_resolved: false,
            created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString()
          },
          {
            id: 'evt-2',
            device_id: 'HLM-ESP32-001',
            event_type: 'ALCOHOL_VIOLATION',
            severity: 'HIGH',
            description: 'Breathalyzer test failed: BAC measured 0.082% (threshold 0.050%)',
            latitude: 6.5210,
            longitude: 3.3750,
            is_resolved: true,
            created_at: new Date(Date.now() - 120 * 60 * 1000).toISOString()
          },
          {
            id: 'evt-3',
            device_id: 'HLM-ESP32-001',
            event_type: 'HELMET_REMOVED',
            severity: 'MEDIUM',
            description: 'Helmet unbuckled while motorcycle was in motion (Anti-Stall Latched)',
            latitude: 6.5180,
            longitude: 3.3710,
            is_resolved: true,
            created_at: new Date(Date.now() - 360 * 60 * 1000).toISOString()
          }
        ]);
      }
    });
  }, []);

  const filtered = events.filter((e) => filter === 'ALL' || e.severity === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#3c4a42]/40">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/30">
            INCIDENT RESPONSE & DISPATCH
          </span>
          <h1 className="text-2xl font-bold font-sans text-[#dfe2ee] tracking-tight mt-1">
            Mission Alert & Emergency Centre
          </h1>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-2 text-xs font-mono">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={`px-3 py-1.5 rounded transition-all ${
                filter === sev
                  ? 'bg-[#10b981] text-[#002113] font-bold'
                  : 'bg-[#181c24] text-[#bbcabf] hover:bg-[#262a33] border border-[#3c4a42]/50'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded bg-[#181c24] border transition-all ${
              item.severity === 'CRITICAL'
                ? 'border-[#ffb4ab]/50 bg-[#181c24]'
                : 'border-[#3c4a42]/50'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    item.severity === 'CRITICAL'
                      ? 'bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/40'
                      : 'bg-[#1c2028] text-[#adc6ff] border border-[#3c4a42]'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-mono text-[#dfe2ee]">
                      {item.event_type}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        item.severity === 'CRITICAL'
                          ? 'bg-[#93000a] text-[#ffdad6]'
                          : 'bg-[#1c2028] text-[#bbcabf]'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#bbcabf] mt-1">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono self-end md:self-center">
                {item.latitude && item.longitude && (
                  <a
                    href={`https://maps.google.com/?q=${item.latitude},${item.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#4edea3] hover:underline"
                  >
                    <span>GPS Map</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <span className="text-[#86948a]">
                  {new Date(item.created_at).toLocaleTimeString()}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                    item.is_resolved
                      ? 'bg-[#10b981]/10 text-[#4edea3] border border-[#4edea3]/30'
                      : 'bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/30'
                  }`}
                >
                  {item.is_resolved ? 'RESOLVED' : 'ACTIVE DISPATCH'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
