'use client';

import React, { useState, useEffect } from 'react';
import { fetchDevices, Device, API_BASE_URL } from '@/lib/api';
import { Cpu, Plus, Key, RefreshCw, AlertCircle } from 'lucide-react';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<'HELMET' | 'IGNITION'>('HELMET');
  const [newDeviceName, setNewDeviceName] = useState('');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/devices/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serial_number: newDeviceId,
          device_type: newDeviceType,
          label: newDeviceName || `${newDeviceType} Unit`,
          hardware_version: 'v1.0-esp32',
          firmware_version: '1.0.0',
        }),
      });

      if (res.ok) {
        await loadDevices();
        setIsModalOpen(false);
        setNewDeviceId('');
        setNewDeviceName('');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to register device: ${err.message || 'Error occurred'}`);
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
            SECURITY ENCLAVE
          </span>
          <h1 className="text-2xl font-bold font-sans theme-text-main tracking-tight mt-1">
            Device Registry & Cryptographic Pairing
          </h1>
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg theme-primary-bg font-bold text-xs font-mono transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Register Hardware Unit</span>
          </button>
        </div>
      </div>

      {/* Hardware Device Grid or Empty State */}
      {devices.length === 0 ? (
        <div className="p-12 rounded-xl theme-bg-card border theme-border text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full theme-bg-subtle border theme-border flex items-center justify-center theme-text-muted">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold theme-text-main font-sans">No Devices Registered</h3>
            <p className="text-xs font-mono theme-text-muted max-w-md mx-auto mt-1">
              The database has been cleaned of dummy records. Connect an ESP32 helmet or ignition unit to begin monitoring.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg theme-primary-bg font-bold text-xs font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>Register First Unit</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((dev) => (
            <div key={dev.id} className="p-5 rounded-lg theme-bg-card border theme-border space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#10b981] dark:text-[#4edea3] theme-bg-subtle px-2 py-0.5 rounded border theme-border">
                  {dev.device_type}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#10b981] dark:text-[#4edea3]">
                  <div className="w-2 h-2 rounded-full bg-[#10b981] dark:bg-[#4edea3] pulse-ring" />
                  <span>{dev.status}</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold theme-text-main font-sans">{dev.name}</h3>
                <p className="text-xs font-mono theme-text-muted mt-0.5">{dev.device_id}</p>
              </div>

              <div className="space-y-2 pt-3 border-t theme-border text-xs font-mono">
                <div className="flex items-center justify-between theme-text-sub">
                  <span className="theme-text-muted">Paired Hardware:</span>
                  <span className="theme-text-main font-bold">{dev.paired_device_id || 'UNPAIRED'}</span>
                </div>
                <div className="flex items-center justify-between theme-text-sub">
                  <span className="theme-text-muted">Firmware:</span>
                  <span className="theme-text-main">v{dev.firmware_version}</span>
                </div>
                <div className="flex items-center justify-between theme-text-sub">
                  <span className="theme-text-muted">HMAC Auth:</span>
                  <span className="text-[#10b981] dark:text-[#4edea3] flex items-center gap-1">
                    <Key className="w-3 h-3" />
                    <span>256-bit PSK</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button className="flex-1 py-1.5 rounded-lg theme-bg-subtle hover:opacity-80 theme-text-main border theme-border text-xs font-mono transition-all">
                  Diagnostics
                </button>
                <button className="py-1.5 px-3 rounded-lg theme-bg-subtle hover:opacity-80 text-blue-500 dark:text-[#4cd7f6] border theme-border text-xs font-mono transition-all">
                  OTA Push
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Device Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-xl theme-bg-card border theme-border space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b theme-border">
              <h2 className="text-lg font-bold font-sans theme-text-main">
                Provision Hardware Unit
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="theme-text-muted hover:theme-text-main font-mono text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block theme-text-muted mb-1">DEVICE TYPE</label>
                <select
                  value={newDeviceType}
                  onChange={(e) => setNewDeviceType(e.target.value as any)}
                  className="w-full p-2.5 rounded-lg theme-bg-input border theme-border theme-text-main focus:outline-none"
                >
                  <option value="HELMET">Smart Helmet (HLM-ESP32)</option>
                  <option value="IGNITION">Ignition Relay Unit (IGN-ESP32)</option>
                </select>
              </div>

              <div>
                <label className="block theme-text-muted mb-1">SERIAL / HARDWARE ID</label>
                <input
                  type="text"
                  placeholder="e.g. HLM-2026-0001"
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-lg theme-bg-input border theme-border theme-text-main focus:outline-none"
                />
              </div>

              <div>
                <label className="block theme-text-muted mb-1">FRIENDLY LABEL</label>
                <input
                  type="text"
                  placeholder="e.g. Primary Helmet Unit"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  className="w-full p-2.5 rounded-lg theme-bg-input border theme-border theme-text-main focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 rounded-lg theme-bg-subtle hover:opacity-80 theme-text-sub border theme-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 rounded-lg theme-primary-bg font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Confirm & Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
