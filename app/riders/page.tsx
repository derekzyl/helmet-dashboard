'use client';

import React, { useState, useEffect } from 'react';
import { fetchEmergencyContacts, EmergencyContact } from '@/lib/api';
import { Users, Phone, ShieldCheck, Award, HeartPulse } from 'lucide-react';

export default function RidersPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    fetchEmergencyContacts().then((res) => {
      if (res && res.length > 0) setContacts(res);
      else {
        setContacts([
          {
            id: 'c-1',
            name: 'Dr. Aisha Bello',
            phone_number: '+2348000000001',
            relationship: 'Primary Family Physician',
            priority: 1,
            is_active: true
          },
          {
            id: 'c-2',
            name: 'Fleet Dispatch Command Lagos',
            phone_number: '+2348000000002',
            relationship: 'Fleet Operational HQ',
            priority: 2,
            is_active: true
          }
        ]);
      }
    });
  }, []);

  const riders = [
    {
      id: 'r-1',
      name: 'Tunde Adebayo',
      badge: 'COURIER LEAD #04',
      safetyScore: 99,
      helmetId: 'HLM-ESP32-001',
      ignitionId: 'IGN-ESP32-001',
      status: 'ACTIVE ON ROUTE'
    },
    {
      id: 'r-2',
      name: 'Chidi Okonkwo',
      badge: 'RAPID RESPONSE #09',
      safetyScore: 97,
      helmetId: 'HLM-ESP32-002',
      ignitionId: 'IGN-ESP32-002',
      status: 'OFF DUTY'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#3c4a42]/40">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1c2028] text-[#4edea3] border border-[#3c4a42]">
            PERSONNEL SAFETY INDEX
          </span>
          <h1 className="text-2xl font-bold font-sans text-[#dfe2ee] tracking-tight mt-1">
            Rider Profiles & Emergency Contacts
          </h1>
        </div>
      </div>

      {/* Riders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {riders.map((r) => (
          <div key={r.id} className="p-5 rounded bg-[#181c24] border border-[#3c4a42]/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-sans text-[#dfe2ee]">{r.name}</h3>
                <p className="text-xs font-mono text-[#86948a]">{r.badge}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-[#4edea3]">{r.safetyScore}</span>
                <span className="text-[10px] font-mono text-[#86948a] block">SAFETY SCORE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#3c4a42]/30 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#1c2028]">
                <span className="text-[#86948a] text-[10px] block">ASSIGNED HELMET</span>
                <span className="font-bold text-[#dfe2ee]">{r.helmetId}</span>
              </div>
              <div className="p-2.5 rounded bg-[#1c2028]">
                <span className="text-[#86948a] text-[10px] block">IGNITION RELAY</span>
                <span className="font-bold text-[#dfe2ee]">{r.ignitionId}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Emergency Contacts Section */}
      <div className="p-5 rounded bg-[#181c24] border border-[#3c4a42]/50 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#3c4a42]/30">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-[#ffb4ab]" />
            <h2 className="text-base font-bold font-sans text-[#dfe2ee]">
              Emergency SOS Contact Roster (Synced to SIM800L Flash)
            </h2>
          </div>
          <span className="text-xs font-mono text-[#4edea3]">2 ACTIVE CONTACTS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contacts.map((c) => (
            <div key={c.id} className="p-4 rounded bg-[#1c2028] border border-[#3c4a42]/40 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#dfe2ee] font-sans">{c.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#181c24] text-[#adc6ff] border border-[#3c4a42]">
                  PRIORITY #{c.priority}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#4edea3]">
                <Phone className="w-3.5 h-3.5" />
                <span className="font-bold">{c.phone_number}</span>
              </div>
              <p className="text-[11px] text-[#86948a]">{c.relationship}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
