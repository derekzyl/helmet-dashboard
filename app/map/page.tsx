'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTelemetrySocket } from '@/lib/useTelemetrySocket';
import { fetchLatestTelemetry, TelemetryPoint } from '@/lib/api';
import { MapPin, Navigation, Signal, Layers } from 'lucide-react';

const FleetMap = dynamic(() => import('@/components/FleetMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[550px] bg-[#181c24] rounded border border-[#3c4a42]/50 flex items-center justify-center font-mono text-xs text-[#86948a]">
      Initializing GIS Vector Tiles...
    </div>
  ),
});

export default function LiveMapPage() {
  const { telemetry: liveTelemetry } = useTelemetrySocket('HLM-ESP32-001');
  const [telemetry, setTelemetry] = useState<TelemetryPoint | null>(null);

  useEffect(() => {
    fetchLatestTelemetry('HLM-ESP32-001').then((res) => {
      if (res) setTelemetry(res);
      else {
        setTelemetry({
          device_id: 'HLM-ESP32-001',
          helmet_worn: true,
          alcohol_detected: false,
          bac_level: 0.012,
          latitude: 6.5244,
          longitude: 3.3792,
          speed_kmh: 38.2,
          battery_percentage: 89,
          ignition_status: 'RUNNING_LATCHED',
          timestamp: new Date().toISOString()
        });
      }
    });
  }, []);

  useEffect(() => {
    if (liveTelemetry) setTelemetry(liveTelemetry);
  }, [liveTelemetry]);

  const current = telemetry || {
    device_id: 'HLM-ESP32-001',
    latitude: 6.5244,
    longitude: 3.3792,
    speed_kmh: 38.2,
    ignition_status: 'RUNNING_LATCHED'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#3c4a42]/40">
        <div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1c2028] text-[#4edea3] border border-[#3c4a42]">
            GEOSPATIAL FLEET TRACKING
          </span>
          <h1 className="text-2xl font-bold font-sans text-[#dfe2ee] tracking-tight mt-1">
            Live OpenStreetMap Fleet Radar
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded bg-[#181c24] border border-[#3c4a42]/40 text-xs font-mono text-[#4edea3] flex items-center gap-2">
            <Signal className="w-3.5 h-3.5" />
            <span>DGPS FIX ACTIVE (HDOP 0.9)</span>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 h-[600px] rounded overflow-hidden border border-[#3c4a42]/60 relative">
          <FleetMap
            latitude={current.latitude}
            longitude={current.longitude}
            speed={current.speed_kmh}
            deviceId={current.device_id}
          />
        </div>

        {/* Sidebar Info Panel */}
        <div className="space-y-4">
          <div className="p-4 rounded bg-[#181c24] border border-[#3c4a42]/50 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-[#86948a]">
              <span>ACTIVE VEHICLE</span>
              <Navigation className="w-3.5 h-3.5 text-[#4edea3]" />
            </div>
            <div className="text-sm font-bold text-[#dfe2ee]">
              {current.device_id}
            </div>
            <div className="space-y-1.5 pt-2 border-t border-[#3c4a42]/30">
              <div className="flex justify-between text-[#bbcabf]">
                <span className="text-[#86948a]">Speed:</span>
                <span className="text-[#dfe2ee] font-bold">{current.speed_kmh.toFixed(1)} km/h</span>
              </div>
              <div className="flex justify-between text-[#bbcabf]">
                <span className="text-[#86948a]">Latitude:</span>
                <span>{current.latitude.toFixed(5)}</span>
              </div>
              <div className="flex justify-between text-[#bbcabf]">
                <span className="text-[#86948a]">Longitude:</span>
                <span>{current.longitude.toFixed(5)}</span>
              </div>
              <div className="flex justify-between text-[#bbcabf]">
                <span className="text-[#86948a]">Status:</span>
                <span className="text-[#4edea3] font-bold">{current.ignition_status}</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded bg-[#181c24] border border-[#3c4a42]/50 space-y-2 text-xs font-mono">
            <span className="text-[#86948a] block text-[10px]">MAP METADATA</span>
            <p className="text-[#bbcabf] text-[11px] leading-relaxed">
              Real-time vector rendering fed from NEO-6M GPS NMEA stream with 1Hz coordinate update frequency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
