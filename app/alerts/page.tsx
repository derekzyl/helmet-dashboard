'use client';

import React, { useState, useEffect } from 'react';
import { fetchEvents, SafetyEvent } from '@/lib/api';
import { AlertTriangle, ShieldCheck, RefreshCw, ExternalLink } from 'lucide-react';

export default function AlertsPage() {
  const [events, setEvents] = useState<SafetyEvent[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    const res = await fetchEvents(50);
    setEvents(res);
    setLoading(false);
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const filtered = events.filter((e) => filter === 'ALL' || e.severity === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b theme-border">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/30">
            INCIDENT AUDIT & LOGS
          </span>
          <h1 className="text-2xl font-bold font-sans theme-text-main tracking-tight mt-1">
            Mission Alert & Emergency Centre
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAlerts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg theme-bg-card hover:opacity-80 theme-text-sub border theme-border text-xs font-mono transition-all"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          {/* Severity Filters */}
          <div className="flex items-center gap-2 text-xs font-mono">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilter(sev)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === sev
                    ? 'theme-primary-bg font-bold'
                    : 'theme-bg-card theme-text-sub hover:opacity-80 border theme-border'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List or Clean Empty State */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-xl theme-bg-card border theme-border text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] dark:text-[#4edea3]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold theme-text-main font-sans">
            {events.length === 0 ? 'No Safety Incidents Logged' : 'No Incidents In This Severity Tier'}
          </h3>
          <p className="text-xs font-mono theme-text-muted max-w-md mx-auto">
            {events.length === 0
              ? 'Database is clean. Any alcohol lockouts, impact collisions, or SOS alerts will be logged here and dispatched via SMTP email.'
              : 'Try selecting a different filter above to view recorded events.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-lg theme-bg-card border transition-all ${
                item.severity === 'CRITICAL'
                  ? 'border-rose-500/40'
                  : 'theme-border'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      item.severity === 'CRITICAL'
                        ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                        : 'theme-bg-subtle text-blue-500 dark:text-[#adc6ff] border theme-border'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono theme-text-main">
                        {item.event_type}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          item.severity === 'CRITICAL'
                            ? 'bg-rose-500 text-white'
                            : 'theme-bg-subtle theme-text-sub border theme-border-subtle'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-xs font-mono theme-text-sub mt-1">
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
                      className="flex items-center gap-1 text-[#10b981] dark:text-[#4edea3] hover:underline"
                    >
                      <span>GPS Map</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <span className="theme-text-muted">
                    {new Date(item.created_at).toLocaleTimeString()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                      item.is_resolved
                        ? 'bg-[#10b981]/15 text-[#10b981] dark:text-[#4edea3] border border-[#10b981]/30'
                        : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                    }`}
                  >
                    {item.is_resolved ? 'RESOLVED' : 'ACTIVE INCIDENT'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
