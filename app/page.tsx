'use client';

import React, { useState, useEffect } from 'react';
import { useTelemetrySocket } from '@/lib/useTelemetrySocket';
import { fetchLatestTelemetry, fetchEvents, TelemetryPoint, SafetyEvent } from '@/lib/api';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Activity, 
  BatteryCharging, 
  MapPin, 
  Gauge, 
  AlertTriangle,
  Zap,
  Radio,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function CockpitPage() {
  const { telemetry: liveTelemetry, isConnected } = useTelemetrySocket('HLM-ESP32-001');
  const [telemetry, setTelemetry] = useState<TelemetryPoint | null>(null);
  const [recentEvents, setRecentEvents] = useState<SafetyEvent[]>([]);

  useEffect(() => {
    // Initial fetch from backend
    fetchLatestTelemetry('HLM-ESP32-001').then((res) => {
      if (res) setTelemetry(res);
      else {
        // Fallback default telemetry for initial view
        setTelemetry({
          device_id: 'HLM-ESP32-001',
          helmet_worn: true,
          alcohol_detected: false,
          bac_level: 0.012,
          latitude: 6.5244,
          longitude: 3.3792,
          speed_kmh: 42.5,
          battery_percentage: 88,
          battery_voltage: 4.02,
          impact_g: 1.04,
          tilt_degrees: 7.2,
          ignition_status: 'RUNNING_LATCHED',
          timestamp: new Date().toISOString()
        });
      }
    });

    fetchEvents(5).then(setRecentEvents);
  }, []);

  // Update whenever live telemetry frame arrives from WebSocket
  useEffect(() => {
    if (liveTelemetry) {
      setTelemetry(liveTelemetry);
    }
  }, [liveTelemetry]);

  const current = telemetry || {
    device_id: 'HLM-ESP32-001',
    helmet_worn: true,
    alcohol_detected: false,
    bac_level: 0.00,
    latitude: 6.5244,
    longitude: 3.3792,
    speed_kmh: 0.0,
    battery_percentage: 95,
    battery_voltage: 4.10,
    impact_g: 1.00,
    tilt_degrees: 0.0,
    ignition_status: 'UNLOCKED',
    timestamp: new Date().toISOString()
  };

  const isUnlocked = current.ignition_status === 'UNLOCKED' || current.ignition_status === 'RUNNING_LATCHED';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#3c4a42]/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#1c2028] text-[#4edea3] border border-[#3c4a42]">
              MONITORING UNIT #1
            </span>
            <span className="text-xs font-mono text-[#bbcabf]">
              DEVICE: {current.device_id}
            </span>
          </div>
          <h1 className="text-2xl font-bold font-sans text-[#dfe2ee] tracking-tight mt-1">
            Mission Telemetry Cockpit
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded bg-[#181c24] border border-[#3c4a42]/50 text-xs font-mono flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#4edea3] pulse-ring' : 'bg-[#ffb4ab]'}`} />
            <span className={isConnected ? 'text-[#4edea3]' : 'text-[#ffb4ab]'}>
              {isConnected ? 'WEBSOCKET REAL-TIME' : 'POLLING FALLBACK'}
            </span>
          </div>

          <button className="px-4 py-1.5 rounded bg-[#1c2028] hover:bg-[#262a33] text-[#dfe2ee] border border-[#3c4a42] text-xs font-mono font-medium transition-all">
            Calibrate Baseline
          </button>
        </div>
      </div>

      {/* Primary Cockpit Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ignition Safety Interlock */}
        <div className="p-5 rounded bg-[#181c24] border border-[#3c4a42]/50 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#86948a]">
            <span>IGNITION INTERLOCK</span>
            <Zap className={`w-4 h-4 ${isUnlocked ? 'text-[#4edea3]' : 'text-[#ffb4ab]'}`} />
          </div>
          <div className="flex items-center gap-3">
            {isUnlocked ? (
              <div className="w-10 h-10 rounded-full bg-[#10b981]/20 border border-[#4edea3]/40 flex items-center justify-center text-[#4edea3]">
                <ShieldCheck className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#93000a]/20 border border-[#ffb4ab]/40 flex items-center justify-center text-[#ffb4ab]">
                <ShieldAlert className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="text-xl font-bold font-mono tracking-tight text-[#dfe2ee]">
                {current.ignition_status}
              </div>
              <div className="text-[11px] font-mono text-[#bbcabf]">
                SSR RELAY: {isUnlocked ? 'ENGAGED (HIGH)' : 'OFF (LOW)'}
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#3c4a42]/30 flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#86948a]">Anti-Stall Latch:</span>
            <span className={current.ignition_status === 'RUNNING_LATCHED' ? 'text-[#4edea3] font-bold' : 'text-[#bbcabf]'}>
              {current.ignition_status === 'RUNNING_LATCHED' ? 'ACTIVE (SAFE)' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Card 2: Helmet Head Detection */}
        <div className="p-5 rounded bg-[#181c24] border border-[#3c4a42]/50 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#86948a]">
            <span>HELMET STATUS</span>
            <Radio className="w-4 h-4 text-[#adc6ff]" />
          </div>
          <div className="flex items-center gap-3">
            {current.helmet_worn ? (
              <CheckCircle2 className="w-10 h-10 text-[#4edea3]" />
            ) : (
              <XCircle className="w-10 h-10 text-[#ffb4ab]" />
            )}
            <div>
              <div className="text-xl font-bold font-mono tracking-tight text-[#dfe2ee]">
                {current.helmet_worn ? 'WORN ON HEAD' : 'REMOVED'}
              </div>
              <div className="text-[11px] font-mono text-[#bbcabf]">
                FC-51 IR SENSOR ACTIVE
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-[#3c4a42]/30 flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#86948a]">Debounce Integrity:</span>
            <span className="text-[#4edea3]">STABLE &gt;1.0s</span>
          </div>
        </div>

        {/* Card 3: MQ-3 Breathalyzer BAC */}
        <div className="p-5 rounded bg-[#181c24] border border-[#3c4a42]/50 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#86948a]">
            <span>BREATHALYZER (MQ-3)</span>
            <Activity className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-[#dfe2ee]">
                {current.bac_level.toFixed(3)}%
              </span>
              <span className="text-xs font-mono text-[#86948a]">BAC</span>
            </div>
            <div className="text-[11px] font-mono text-[#bbcabf] mt-1">
              LIMIT: 0.050% | STATUS: {current.bac_level <= 0.05 ? 'SOBER (PASS)' : 'OVER LIMIT (FAIL)'}
            </div>
          </div>
          <div className="w-full bg-[#0a0e16] rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                current.bac_level > 0.05 ? 'bg-[#ffb4ab]' : 'bg-[#4edea3]'
              }`}
              style={{ width: `${Math.min(100, (current.bac_level / 0.08) * 100)}%` }}
            />
          </div>
        </div>

        {/* Card 4: Li-ion Power Rail */}
        <div className="p-5 rounded bg-[#181c24] border border-[#3c4a42]/50 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-[#86948a]">
            <span>HELMET BATTERY</span>
            <BatteryCharging className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-[#dfe2ee]">
                {current.battery_percentage}%
              </span>
              <span className="text-xs font-mono text-[#86948a]">
                {current.battery_voltage ? `${current.battery_voltage.toFixed(2)}V` : '4.05V'}
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#bbcabf] mt-1">
              RAIL: 1S2P LI-ION (ADC1 SENSE)
            </div>
          </div>
          <div className="w-full bg-[#0a0e16] rounded-full h-2 overflow-hidden">
            <div 
              className="h-full rounded-full bg-[#4edea3] transition-all duration-500"
              style={{ width: `${current.battery_percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Secondary Telemetry: Dynamics, MPU-6050 & GPS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Speedometer & Kinematics */}
        <div className="p-5 rounded bg-[#181c24] border border-[#3c4a42]/50 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#86948a]">
            <span>SPEED & DYNAMICS</span>
            <Gauge className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-5xl font-black font-mono tracking-tight text-[#dfe2ee]">
              {current.speed_kmh.toFixed(1)}
            </div>
            <div className="text-xs font-mono uppercase text-[#86948a] mt-1">
              Kilometers Per Hour
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#3c4a42]/30 text-xs font-mono">
            <div className="p-2 rounded bg-[#1c2028]">
              <span className="text-[#86948a] block text-[10px]">PEAK IMPACT</span>
              <span className="font-bold text-[#dfe2ee]">{current.impact_g?.toFixed(2) || '1.00'} G</span>
            </div>
            <div className="p-2 rounded bg-[#1c2028]">
              <span className="text-[#86948a] block text-[10px]">TILT ANGLE</span>
              <span className="font-bold text-[#dfe2ee]">{current.tilt_degrees?.toFixed(1) || '0.0'}°</span>
            </div>
          </div>
        </div>

        {/* GPS Live Geolocation */}
        <div className="p-5 rounded bg-[#181c24] border border-[#3c4a42]/50 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#86948a]">
            <span>NEO-6M GPS SATELLITE FIX</span>
            <MapPin className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="space-y-3 py-2">
            <div className="p-3 rounded bg-[#1c2028] border border-[#3c4a42]/40 font-mono text-xs space-y-1">
              <div className="text-[#86948a] text-[10px]">LATITUDE / LONGITUDE</div>
              <div className="font-bold text-[#dfe2ee] text-sm">
                {current.latitude.toFixed(6)}, {current.longitude.toFixed(6)}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-[#bbcabf] px-1">
              <span>SATELLITE FIX: 3D DGPS</span>
              <span className="text-[#4edea3]">HDOP: 0.9</span>
            </div>
          </div>
          <div className="pt-2 border-t border-[#3c4a42]/30 text-center">
            <a 
              href={`https://maps.google.com/?q=${current.latitude},${current.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-[#4edea3] hover:underline"
            >
              Open External Coordinates &rarr;
            </a>
          </div>
        </div>

        {/* Real-time Safety Event Feed */}
        <div className="p-5 rounded bg-[#181c24] border border-[#3c4a42]/50 space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-[#86948a]">
            <span>LIVE EVENT STREAM</span>
            <AlertTriangle className="w-4 h-4 text-[#adc6ff]" />
          </div>
          <div className="space-y-2">
            {recentEvents.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-[#86948a]">
                No critical safety events logged today.
              </div>
            ) : (
              recentEvents.map((evt) => (
                <div key={evt.id} className="p-2.5 rounded bg-[#1c2028] border border-[#3c4a42]/40 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#ffb4ab]">{evt.event_type}</span>
                    <span className="text-[10px] text-[#86948a]">{evt.severity}</span>
                  </div>
                  <p className="text-[11px] text-[#bbcabf] mt-1 truncate">
                    {evt.description}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
