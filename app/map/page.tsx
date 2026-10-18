'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTelemetrySocket } from '@/lib/useTelemetrySocket';
import { fetchLatestTelemetry, fetchDevices, TelemetryPoint } from '@/lib/api';
import { Navigation, Signal } from 'lucide-react';

const FleetMap = dynamic(() => import('@/components/FleetMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[550px] theme-bg-card rounded-lg border theme-border flex items-center justify-center font-mono text-xs theme-text-muted">
      Initializing GIS Vector Tiles...
    </div>
  ),
});

export default function LiveMapPage() {
  const [activeDeviceId, setActiveDeviceId] = useState<string>('');
  const { telemetry: liveTelemetry } = useTelemetrySocket(activeDeviceId || 'HLM-DEFAULT');
  const [telemetry, setTelemetry] = useState<TelemetryPoint | null>(null);

  useEffect(() => {
    fetchDevices().then((devices) => {
      const hlm = devices.find((d) => d.device_type === 'HELMET');
      if (hlm && hlm.device_id) {
        setActiveDeviceId(hlm.device_id);
      }
    });
  }, []);

  useEffect(() => {
    if (!activeDeviceId) return;
    fetchLatestTelemetry(activeDeviceId).then((res) => {
      if (res) setTelemetry(res);
    });
  }, [activeDeviceId]);

  useEffect(() => {
    if (liveTelemetry) setTelemetry(liveTelemetry);
  }, [liveTelemetry]);

  const current: TelemetryPoint = telemetry || {
    device_id: activeDeviceId || 'AWAITING GPS FIX',
    helmet_worn: false,
    bac_level: 0.00,
    latitude: 6.5244,
    longitude: 3.3792,
    speed_kmh: 0.0,
    battery_percentage: 0,
    ignition_status: 'LOCKED',
    timestamp: new Date().toISOString()
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b theme-border">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 rounded theme-bg-subtle text-[#10b981] dark:text-[#4edea3] border theme-border">
            GEOSPATIAL FLEET RADAR
          </span>
          <h1 className="text-2xl font-bold font-sans theme-text-main tracking-tight mt-1">
            Live OpenStreetMap Fleet Radar
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg theme-bg-card border theme-border text-xs font-mono text-[#10b981] dark:text-[#4edea3] flex items-center gap-2">
            <Signal className="w-3.5 h-3.5" />
            <span>{telemetry ? 'DGPS FIX ACTIVE (HDOP 0.9)' : 'STANDBY (AWAITING TRANSMISSION)'}</span>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[600px] rounded-lg overflow-hidden border theme-border relative">
          <FleetMap
            latitude={current.latitude}
            longitude={current.longitude}
            speed={current.speed_kmh}
            deviceId={current.device_id}
          />
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-4">
          <div className="p-4 rounded-lg theme-bg-card border theme-border space-y-3 font-mono text-xs transition-colors">
            <div className="flex items-center justify-between theme-text-muted">
              <span>TARGET VEHICLE</span>
              <Navigation className="w-3.5 h-3.5 text-[#10b981] dark:text-[#4edea3]" />
            </div>
            <div className="text-sm font-bold theme-text-main">
              {current.device_id}
            </div>
            <div className="space-y-1.5 pt-2 border-t theme-border">
              <div className="flex justify-between theme-text-sub">
                <span className="theme-text-muted">Speed:</span>
                <span className="theme-text-main font-bold">{current.speed_kmh.toFixed(1)} km/h</span>
              </div>
              <div className="flex justify-between theme-text-sub">
                <span className="theme-text-muted">Latitude:</span>
                <span className="theme-text-main">{current.latitude.toFixed(5)}</span>
              </div>
              <div className="flex justify-between theme-text-sub">
                <span className="theme-text-muted">Longitude:</span>
                <span className="theme-text-main">{current.longitude.toFixed(5)}</span>
              </div>
              <div className="flex justify-between theme-text-sub">
                <span className="theme-text-muted">Interlock:</span>
                <span className="text-[#10b981] dark:text-[#4edea3] font-bold">{current.ignition_status}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg theme-bg-card border theme-border space-y-2 text-xs font-mono transition-colors">
            <span className="theme-text-muted block text-[10px]">MAP INTEGRATION</span>
            <p className="theme-text-sub text-[11px] leading-relaxed">
              Supports dynamic CartoDB Positron and Dark Matter tile switching that seamlessly synchronizes with light and dark themes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
