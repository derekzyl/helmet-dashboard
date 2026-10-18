'use client';

import React, { useState, useEffect } from 'react';
import { fetchDevices, Device, API_BASE_URL } from '@/lib/api';
import { Shield, Plus, Key, RefreshCw, Zap, Radio, Sliders } from 'lucide-react';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [helmetSerial, setHelmetSerial] = useState('');
  const [ignitionSerial, setIgnitionSerial] = useState('');
  const [systemName, setSystemName] = useState('');
  const [alcoholLimit, setAlcoholLimit] = useState(0.05);
  const [impactLimit, setImpactLimit] = useState(3.5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDevices = async () => {
    setLoading(true);
    const data = await fetchDevices();
    setDevices(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDevices();
  }, []);

  // Auto-generate ignition serial when helmet serial is entered
  const handleHelmetSerialChange = (val: string) => {
    setHelmetSerial(val);
    if (!ignitionSerial || ignitionSerial.startsWith('IGN-')) {
      const trimmed = val.trim();
      if (trimmed.startsWith('HLM-')) {
        setIgnitionSerial('IGN-' + trimmed.substring(4));
      } else if (trimmed.startsWith('HLM')) {
        setIgnitionSerial('IGN' + trimmed.substring(3));
      } else if (trimmed) {
        setIgnitionSerial(`${trimmed}-IGN`);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helmetSerial) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/devices/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serial_number: helmetSerial.trim(),
          ignition_serial: ignitionSerial.trim() || undefined,
          label: systemName.trim() || `Smart Helmet System (${helmetSerial.trim()})`,
          device_type: 'SMART_HELMET_SYSTEM',
          alcohol_threshold_mg_l: alcoholLimit,
          collision_accel_g: impactLimit,
          hardware_version: 'v1.2-esp32',
          firmware_version: '1.0.0',
        }),
      });

      if (res.ok) {
        await loadDevices();
        setIsModalOpen(false);
        setHelmetSerial('');
        setIgnitionSerial('');
        setSystemName('');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to register device system: ${err.detail || err.message || 'Error occurred'}`);
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b theme-border">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 rounded theme-bg-subtle text-[#10b981] dark:text-[#4edea3] border theme-border">
            FLEET REGISTRY
          </span>
          <h1 className="text-2xl font-bold font-sans theme-text-main tracking-tight mt-1">
            Smart Helmet & Ignition Systems
          </h1>
          <p className="text-xs font-mono theme-text-muted mt-1">
            Each entry represents 1 unified system pairing an ESP32 Helmet with its Motorcycle Ignition Interlock
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadDevices}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg theme-bg-card hover:opacity-80 theme-text-sub border theme-border text-xs font-mono transition-all"
            title="Refresh fleet list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg theme-primary-bg font-bold text-xs font-mono transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register 1 System Kit</span>
          </button>
        </div>
      </div>

      {/* Hardware Device Grid or Empty State */}
      {devices.length === 0 ? (
        <div className="p-12 rounded-xl theme-bg-card border theme-border text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full theme-bg-subtle border theme-border flex items-center justify-center theme-text-muted">
            <Shield className="w-6 h-6 text-[#10b981] dark:text-[#4edea3]" />
          </div>
          <div>
            <h3 className="text-base font-bold theme-text-main font-sans">No Smart Helmet Systems Registered</h3>
            <p className="text-xs font-mono theme-text-muted max-w-md mx-auto mt-1">
              Smart helmets and motorcycle ignition relays go together as 1 system. Register a paired system kit to begin monitoring safety telemetry.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg theme-primary-bg font-bold text-xs font-mono cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register First System Kit</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {devices.map((dev) => {
            const hlmSn = dev.helmet_serial || dev.serial_number || dev.device_id;
            const ignSn = dev.ignition_serial || dev.paired_serial_number || dev.paired_device_id || `IGN-${hlmSn.replace(/^HLM-?/, '')}`;

            return (
              <div key={dev.id} className="p-5 rounded-xl theme-bg-card border theme-border space-y-4 transition-all hover:shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-[#10b981] dark:text-[#4edea3] theme-bg-subtle px-2.5 py-1 rounded-full border theme-border flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    <span>SMART HELMET SYSTEM</span>
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#10b981] dark:text-[#4edea3]">
                    <div className="w-2 h-2 rounded-full bg-[#10b981] dark:bg-[#4edea3] pulse-ring" />
                    <span>{dev.status || 'ARMED'}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold theme-text-main font-sans">{dev.name}</h3>
                  <p className="text-xs font-mono theme-text-muted mt-0.5">System ID: {hlmSn}</p>
                </div>

                {/* Subsystem Components Box */}
                <div className="p-3 rounded-lg theme-bg-subtle border theme-border space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 theme-text-sub">
                      <Radio className="w-3.5 h-3.5 text-blue-500 dark:text-[#adc6ff]" />
                      <span>HELMET UNIT:</span>
                    </div>
                    <span className="font-bold theme-text-main">{hlmSn}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 theme-text-sub">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>IGNITION RELAY:</span>
                    </div>
                    <span className="font-bold theme-text-main">{ignSn}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 text-xs font-mono">
                  <div className="flex items-center justify-between theme-text-sub">
                    <span className="theme-text-muted">Cryptographic Link:</span>
                    <span className="text-[#10b981] dark:text-[#4edea3] flex items-center gap-1 font-semibold">
                      <Key className="w-3 h-3" />
                      <span>256-bit HMAC PSK</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between theme-text-sub">
                    <span className="theme-text-muted">Interlock State:</span>
                    <span className="theme-text-main font-medium">Ready / Active Latch</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t theme-border">
                  <button className="flex-1 py-1.5 rounded-lg theme-bg-subtle hover:opacity-80 theme-text-main border theme-border text-xs font-mono transition-all cursor-pointer">
                    Diagnostics
                  </button>
                  <button className="py-1.5 px-3 rounded-lg theme-bg-subtle hover:opacity-80 text-blue-500 dark:text-[#4cd7f6] border theme-border text-xs font-mono transition-all flex items-center gap-1 cursor-pointer">
                    <Sliders className="w-3 h-3" />
                    <span>Config</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1-Device System Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-xl theme-bg-card border theme-border space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b theme-border">
              <div>
                <h2 className="text-lg font-bold font-sans theme-text-main">
                  Register Smart Helmet & Ignition System
                </h2>
                <p className="text-xs font-mono theme-text-muted mt-0.5">
                  Registers the helmet and ignition interlock together as 1 device
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="theme-text-muted hover:theme-text-main font-mono text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block theme-text-muted mb-1 font-semibold">SYSTEM / MOTORCYCLE LABEL</label>
                <input
                  type="text"
                  placeholder="e.g. Cruiser Alpha - Unit #01"
                  value={systemName}
                  onChange={(e) => setSystemName(e.target.value)}
                  className="w-full p-2.5 rounded-lg theme-bg-input border theme-border theme-text-main focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block theme-text-muted mb-1 font-semibold">HELMET SERIAL</label>
                  <input
                    type="text"
                    placeholder="e.g. HLM-2026-0001"
                    value={helmetSerial}
                    onChange={(e) => handleHelmetSerialChange(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg theme-bg-input border theme-border theme-text-main focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block theme-text-muted mb-1 font-semibold">IGNITION BOX SERIAL</label>
                  <input
                    type="text"
                    placeholder="e.g. IGN-2026-0001"
                    value={ignitionSerial}
                    onChange={(e) => setIgnitionSerial(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg theme-bg-input border theme-border theme-text-main focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block theme-text-muted mb-1">ALCOHOL LIMIT (BAC %)</label>
                  <input
                    type="number"
                    step="0.005"
                    min="0.01"
                    max="0.10"
                    value={alcoholLimit}
                    onChange={(e) => setAlcoholLimit(parseFloat(e.target.value) || 0.05)}
                    className="w-full p-2 rounded-lg theme-bg-input border theme-border theme-text-main focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block theme-text-muted mb-1">CRASH IMPACT PEAK (G)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="2.0"
                    max="10.0"
                    value={impactLimit}
                    onChange={(e) => setImpactLimit(parseFloat(e.target.value) || 3.5)}
                    className="w-full p-2 rounded-lg theme-bg-input border theme-border theme-text-main focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg theme-bg-subtle border theme-border text-[11px] theme-text-sub space-y-1">
                <span className="font-bold text-[#10b981] dark:text-[#4edea3] block">Automatic Cryptographic Binding</span>
                <p>
                  Upon registration, a unique 256-bit PSK is generated to bind the helmet and ignition over local WPA2 / SoftAP with replay-protected HMAC-SHA256 heartbeats.
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg theme-bg-subtle hover:opacity-80 theme-text-sub border theme-border cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-lg theme-primary-bg font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Registering System...' : 'Register as 1 Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
