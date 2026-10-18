'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchEmergencyContacts, fetchDevices, EmergencyContact, Device } from '@/lib/api';
import { Users, Phone, HeartPulse, Plus, Cpu } from 'lucide-react';

export default function RidersPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [c, d] = await Promise.all([
        fetchEmergencyContacts(),
        fetchDevices()
      ]);
      setContacts(c);
      setDevices(d);
      setLoading(false);
    }
    load();
  }, []);

  const helmets = devices.filter((d) => d.device_type === 'HELMET');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b theme-border">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 rounded theme-bg-subtle text-[#10b981] dark:text-[#4edea3] border theme-border">
            PERSONNEL AUDIT
          </span>
          <h1 className="text-2xl font-bold font-sans theme-text-main tracking-tight mt-1">
            Rider Profiles & Emergency Contacts
          </h1>
        </div>
      </div>

      {/* Riders Grid or Empty State */}
      <div>
        <h2 className="text-sm font-mono font-bold theme-text-muted uppercase mb-3">
          Assigned Fleet Riders
        </h2>
        {helmets.length === 0 ? (
          <div className="p-8 rounded-xl theme-bg-card border theme-border text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full theme-bg-subtle border theme-border flex items-center justify-center theme-text-muted">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold theme-text-main font-sans">No Active Rider Units</h3>
            <p className="text-xs font-mono theme-text-muted max-w-sm mx-auto">
              Hardware units have been cleared. Register an ESP32 helmet unit in the Device Registry to bind a rider profile.
            </p>
            <Link
              href="/devices"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg theme-primary-bg font-bold text-xs font-mono"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Unit</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helmets.map((h) => (
              <div key={h.id} className="p-5 rounded-lg theme-bg-card border theme-border space-y-4 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold font-sans theme-text-main">{h.name}</h3>
                    <p className="text-xs font-mono theme-text-muted">{h.device_id}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono px-2 py-0.5 rounded theme-bg-subtle text-[#10b981] dark:text-[#4edea3] border theme-border">
                      {h.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t theme-border text-xs font-mono">
                  <div className="p-2.5 rounded theme-bg-subtle border theme-border-subtle">
                    <span className="theme-text-muted text-[10px] block">HARDWARE UNIT</span>
                    <span className="font-bold theme-text-main">{h.device_id}</span>
                  </div>
                  <div className="p-2.5 rounded theme-bg-subtle border theme-border-subtle">
                    <span className="theme-text-muted text-[10px] block">PAIRED RELAY</span>
                    <span className="font-bold theme-text-main">{h.paired_device_id || 'STANDALONE'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Contacts Section */}
      <div className="p-5 rounded-lg theme-bg-card border theme-border space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b theme-border">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold font-sans theme-text-main">
              Emergency SOS Contact Roster (Synced to Cloud & SIM800L)
            </h2>
          </div>
          <span className="text-xs font-mono text-[#10b981] dark:text-[#4edea3]">
            {contacts.length} ACTIVE CONTACTS
          </span>
        </div>

        {contacts.length === 0 ? (
          <div className="p-6 text-center text-xs font-mono theme-text-muted">
            No emergency contacts currently stored. When configured, emergency dispatches and Google Maps GPS links are automatically emailed and texted upon crash detection.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((c) => (
              <div key={c.id} className="p-4 rounded-lg theme-bg-subtle border theme-border space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm theme-text-main font-sans">{c.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded theme-bg-card theme-text-sub border theme-border">
                    PRIORITY #{c.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#10b981] dark:text-[#4edea3]">
                  <Phone className="w-3.5 h-3.5" />
                  <span className="font-bold">{c.phone_number}</span>
                </div>
                <p className="text-[11px] theme-text-muted">{c.relationship}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
