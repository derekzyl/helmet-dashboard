'use client';

import React, { useState, useEffect } from 'react';
import { fetchDevices, Device } from '@/lib/api';
import { Cpu, Plus, CheckCircle, Wifi, Battery, RefreshCw, Key } from 'lucide-react';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<'HELMET' | 'IGNITION'>('HELMET');
  const [newDeviceName, setNewDeviceName] = useState('');

  useEffect(() => {
    fetchDevices().then(setDevices);
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceId) return;

    const newDev: Device = {
      id: `dev-${Date.now()}`,
      device_id: newDeviceId,
      device_type: newDeviceType,
      name: newDeviceName || `${newDeviceType} Unit`,
      firmware_version: '1.0.0',
      status: 'ONLINE',
      paired_device_id: newDeviceType === 'HELMET' ? 'IGN-ESP32-001' : 'HLM-ESP32-001',
      last_seen_at: new Date().toISOString(),
      is_active: true
    };

    setDevices([newDev, ...devices]);
    setIsModalOpen(false);
    setNewDeviceId('');
    setNewDeviceName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#3c4a42]/40">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1c2028] text-[#4edea3] border border-[#3c4a42]">
            SECURITY ENCLAVE
          </span>
          <h1 className="text-2xl font-bold font-sans text-[#dfe2ee] tracking-tight mt-1">
            Device Registry & Cryptographic Pairing
          </h1>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded bg-[#10b981] hover:bg-[#4edea3] text-[#002113] font-bold text-xs font-mono transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Register Hardware Unit</span>
        </button>
      </div>

      {/* Hardware Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((dev) => (
          <div key={dev.id} className="p-5 rounded bg-[#181c24] border border-[#3c4a42]/50 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#4edea3] bg-[#1c2028] px-2 py-0.5 rounded border border-[#3c4a42]/40">
                {dev.device_type}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#4edea3]">
                <div className="w-2 h-2 rounded-full bg-[#4edea3] pulse-ring" />
                <span>{dev.status}</span>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#dfe2ee] font-sans">{dev.name}</h3>
              <p className="text-xs font-mono text-[#86948a] mt-0.5">{dev.device_id}</p>
            </div>

            <div className="space-y-2 pt-3 border-t border-[#3c4a42]/30 text-xs font-mono">
              <div className="flex items-center justify-between text-[#bbcabf]">
                <span className="text-[#86948a]">Paired Hardware:</span>
                <span className="text-[#dfe2ee] font-bold">{dev.paired_device_id || 'UNPAIRED'}</span>
              </div>
              <div className="flex items-center justify-between text-[#bbcabf]">
                <span className="text-[#86948a]">Firmware:</span>
                <span className="text-[#dfe2ee]">v{dev.firmware_version}</span>
              </div>
              <div className="flex items-center justify-between text-[#bbcabf]">
                <span className="text-[#86948a]">HMAC Auth:</span>
                <span className="text-[#4edea3] flex items-center gap-1">
                  <Key className="w-3 h-3" />
                  <span>256-bit PSK</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button className="flex-1 py-1.5 rounded bg-[#1c2028] hover:bg-[#262a33] text-[#dfe2ee] border border-[#3c4a42] text-xs font-mono">
                Diagnostics
              </button>
              <button className="py-1.5 px-3 rounded bg-[#1c2028] hover:bg-[#262a33] text-[#4cd7f6] border border-[#3c4a42] text-xs font-mono">
                OTA Push
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Device Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded bg-[#181c24] border border-[#3c4a42] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#3c4a42]/40">
              <h2 className="text-lg font-bold font-sans text-[#dfe2ee]">
                Provision New Hardware
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#86948a] hover:text-[#dfe2ee] font-mono text-sm"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[#86948a] mb-1">DEVICE TYPE</label>
                <select
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value as any)}
                  className="w-full p-2.5 rounded bg-[#1c2028] border border-[#3c4a42] text-[#dfe2ee] focus:border-[#4edea3] focus:outline-none"
                >
                  <option value="HELMET">Smart Helmet (HLM-ESP32)</option>
                  <option value="IGNITION">Ignition Relay Unit (IGN-ESP32)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#86948a] mb-1">SERIAL / HARDWARE ID</label>
                <input
                  type="text"
                  placeholder="e.g. HLM-ESP32-002"
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                  required
                  className="w-full p-2.5 rounded bg-[#1c2028] border border-[#3c4a42] text-[#dfe2ee] focus:border-[#4edea3] focus:outline-none"
                >
                </input>
              </div>

              <div>
                <label className="block text-[#86948a] mb-1">FRIENDLY NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Courier Helmet Alpha"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#1c2028] border border-[#3c4a42] text-[#dfe2ee] focus:border-[#4edea3] focus:outline-none"
                >
                </input>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded bg-[#1c2028] hover:bg-[#262a33] text-[#bbcabf] border border-[#3c4a42]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded bg-[#10b981] hover:bg-[#4edea3] text-[#002113] font-bold"
                >
                  Confirm & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
