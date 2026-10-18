'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTelemetrySocket } from '@/lib/useTelemetrySocket';
import { fetchLatestTelemetry, fetchEvents, fetchDevices, TelemetryPoint, SafetyEvent } from '@/lib/api';
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
  XCircle,
  Plus
} from 'lucide-react';

export default function CockpitPage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [deviceList, setDeviceList] = useState<any[]>([]);
  const { telemetry: liveTelemetry, isConnected } = useTelemetrySocket(selectedDeviceId || 'HLM-DEFAULT');
  const [telemetry, setTelemetry] = useState<TelemetryPoint | null>(null);
  const [recentEvents, setRecentEvents] = useState<SafetyEvent[]>([]);

  useEffect(() => {
    fetchDevices().then((devices) => {
      setDeviceList(devices);
      const hlm = devices.find((d) => d.device_type === 'HELMET');
      if (hlm && hlm.device_id) {
        setSelectedDeviceId(hlm.device_id);
      }
    });

    fetchEvents(5).then(setRecentEvents);
  }, []);

  useEffect(() => {
    if (!selectedDeviceId) return;
    fetchLatestTelemetry(selectedDeviceId).then((res) => {
      if (res) setTelemetry(res);
    });
  }, [selectedDeviceId]);

  // Update whenever live telemetry frame arrives from WebSocket
  useEffect(() => {
    if (liveTelemetry) {
      setTelemetry(liveTelemetry);
    }
  }, [liveTelemetry]);

  const hasData = Boolean(telemetry);

  const current: TelemetryPoint = telemetry || {
    device_id: selectedDeviceId || 'NO DEVICE REGISTERED',
    helmet_worn: false,
    alcohol_detected: false,
    bac_level: 0.00,
    latitude: 6.5244,
    longitude: 3.3792,
    speed_kmh: 0.0,
    battery_percentage: 0,
    battery_voltage: 0.0,
    impact_g: 1.00,
    tilt_degrees: 0.0,
    ignition_status: 'LOCKED',
    timestamp: new Date().toISOString()
  };

  const isUnlocked = current.ignition_status === 'UNLOCKED' || current.ignition_status === 'RUNNING_LATCHED';

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b theme-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded theme-bg-subtle text-[#10b981] dark:text-[#4edea3] border theme-border">
              {deviceList.length > 0 ? `FLEET UNITS: ${deviceList.length}` : 'AWAITING HARDWARE'}
            </span>
            <span className="text-xs font-mono theme-text-sub">
              ACTIVE ID: {selectedDeviceId || 'None Selected'}
            </span>
          </div>
          <h1 className="text-2xl font-bold font-sans theme-text-main tracking-tight mt-1">
            Mission Telemetry Cockpit
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg theme-bg-card border theme-border text-xs font-mono flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#10b981] dark:bg-[#4edea3] pulse-ring' : 'bg-amber-400'}`} />
            <span className={isConnected ? 'text-[#10b981] dark:text-[#4edea3]' : 'theme-text-muted'}>
              {isConnected ? 'WEBSOCKET STREAM ACTIVE' : 'AWAITING CONNECTION'}
            </span>
          </div>

          <Link
            href="/devices"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg theme-bg-subtle hover:opacity-80 theme-text-main border theme-border text-xs font-mono font-medium transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Device</span>
          </Link>
        </div>
      </div>

      {/* Empty State Banner if no telemetry received */}
      {!hasData && (
        <div className="p-4 rounded-lg theme-bg-subtle border theme-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 theme-text-sub">
            <Radio className="w-4 h-4 text-[#10b981] dark:text-[#4edea3]" />
            <span>Database is clean. Connect an ESP32 hardware unit or run simulator to stream live telemetry.</span>
          </div>
          <Link
            href="/devices"
            className="px-3 py-1 rounded theme-primary-bg font-bold text-[11px] whitespace-nowrap"
          >
            Pair Hardware Unit &rarr;
          </Link>
        </div>
      )}

      {/* Primary Cockpit Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ignition Safety Interlock */}
        <div className="p-5 rounded-lg theme-bg-card border theme-border space-y-3 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono theme-text-muted">
            <span>IGNITION INTERLOCK</span>
            <Zap className={`w-4 h-4 ${isUnlocked ? 'text-[#10b981] dark:text-[#4edea3]' : 'text-rose-500'}`} />
          </div>
          <div className="flex items-center gap-3">
            {isUnlocked ? (
              <div className="w-10 h-10 rounded-full bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-[#10b981] dark:text-[#4edea3]">
                <ShieldCheck className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
                <ShieldAlert className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="text-xl font-bold font-mono tracking-tight theme-text-main">
                {current.ignition_status}
              </div>
              <div className="text-[11px] font-mono theme-text-sub">
                SSR RELAY: {isUnlocked ? 'ENGAGED (HIGH)' : 'DE-ENERGIZED (LOW)'}
              </div>
            </div>
          </div>
          <div className="pt-2 border-t theme-border flex items-center justify-between text-[11px] font-mono">
            <span className="theme-text-muted">Anti-Stall Latch:</span>
            <span className={current.ignition_status === 'RUNNING_LATCHED' ? 'text-[#10b981] dark:text-[#4edea3] font-bold' : 'theme-text-sub'}>
              {current.ignition_status === 'RUNNING_LATCHED' ? 'ACTIVE (SAFE)' : 'STANDBY'}
            </span>
          </div>
        </div>

        {/* Card 2: Helmet Head Detection */}
        <div className="p-5 rounded-lg theme-bg-card border theme-border space-y-3 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono theme-text-muted">
            <span>HELMET WEAR STATUS</span>
            <Radio className="w-4 h-4 text-blue-500 dark:text-[#adc6ff]" />
          </div>
          <div className="flex items-center gap-3">
            {current.helmet_worn ? (
              <CheckCircle2 className="w-10 h-10 text-[#10b981] dark:text-[#4edea3]" />
            ) : (
              <XCircle className="w-10 h-10 text-rose-400" />
            )}
            <div>
              <div className="text-xl font-bold font-mono tracking-tight theme-text-main">
                {current.helmet_worn ? 'WORN ON HEAD' : 'REMOVED / UNLATCHED'}
              </div>
              <div className="text-[11px] font-mono theme-text-sub">
                FC-51 INFRARED PROXIMITY
              </div>
            </div>
          </div>
          <div className="pt-2 border-t theme-border flex items-center justify-between text-[11px] font-mono">
            <span className="theme-text-muted">Debounce Gate:</span>
            <span className={current.helmet_worn ? 'text-[#10b981] dark:text-[#4edea3]' : 'theme-text-muted'}>
              {current.helmet_worn ? 'CONFIRMED (>1.0s)' : 'DISENGAGED'}
            </span>
          </div>
        </div>

        {/* Card 3: MQ-3 Breathalyzer BAC */}
        <div className="p-5 rounded-lg theme-bg-card border theme-border space-y-3 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono theme-text-muted">
            <span>BREATHALYZER (MQ-3)</span>
            <Activity className="w-4 h-4 text-cyan-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono theme-text-main">
                {current.bac_level.toFixed(3)}%
              </span>
              <span className="text-xs font-mono theme-text-muted">BAC</span>
            </div>
            <div className="text-[11px] font-mono theme-text-sub mt-1">
              THRESHOLD: 0.050% | STATUS: {current.bac_level <= 0.05 ? 'SOBER (PASS)' : 'OVER LIMIT (LOCKOUT)'}
            </div>
          </div>
          <div className="w-full theme-bg-input rounded-full h-2 overflow-hidden border theme-border-subtle">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                current.bac_level > 0.05 ? 'bg-rose-500' : 'bg-[#10b981] dark:bg-[#4edea3]'
              }`}
              style={{ width: `${Math.min(100, (current.bac_level / 0.08) * 100)}%` }}
            />
          </div>
        </div>

        {/* Card 4: Li-ion Power Rail */}
        <div className="p-5 rounded-lg theme-bg-card border theme-border space-y-3 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono theme-text-muted">
            <span>HELMET BATTERY</span>
            <BatteryCharging className="w-4 h-4 text-[#10b981] dark:text-[#4edea3]" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono theme-text-main">
                {current.battery_percentage}%
              </span>
              <span className="text-xs font-mono theme-text-muted">
                {current.battery_voltage ? `${current.battery_voltage.toFixed(2)}V` : '--'}
              </span>
            </div>
            <div className="text-[11px] font-mono theme-text-sub mt-1">
              RAIL: 1S2P LI-ION (ADC1_CH7)
            </div>
          </div>
          <div className="w-full theme-bg-input rounded-full h-2 overflow-hidden border theme-border-subtle">
            <div 
              className="h-full rounded-full bg-[#10b981] dark:bg-[#4edea3] transition-all duration-500"
              style={{ width: `${current.battery_percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Secondary Telemetry: Dynamics, MPU-6050 & GPS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Speedometer & Kinematics */}
        <div className="p-5 rounded-lg theme-bg-card border theme-border space-y-4 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono theme-text-muted">
            <span>SPEED & DYNAMICS</span>
            <Gauge className="w-4 h-4 text-[#10b981] dark:text-[#4edea3]" />
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="text-5xl font-black font-mono tracking-tight theme-text-main">
              {current.speed_kmh.toFixed(1)}
            </div>
            <div className="text-xs font-mono uppercase theme-text-muted mt-1">
              Kilometers Per Hour
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-3 border-t theme-border text-xs font-mono">
            <div className="p-2.5 rounded theme-bg-subtle border theme-border-subtle">
              <span className="theme-text-muted block text-[10px]">PEAK IMPACT</span>
              <span className="font-bold theme-text-main">{current.impact_g?.toFixed(2) || '1.00'} G</span>
            </div>
            <div className="p-2.5 rounded theme-bg-subtle border theme-border-subtle">
              <span className="theme-text-muted block text-[10px]">TILT ANGLE</span>
              <span className="font-bold theme-text-main">{current.tilt_degrees?.toFixed(1) || '0.0'}°</span>
            </div>
          </div>
        </div>

        {/* GPS Live Geolocation */}
        <div className="p-5 rounded-lg theme-bg-card border theme-border space-y-4 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono theme-text-muted">
            <span>NEO-6M GPS GEOLOCATION</span>
            <MapPin className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="space-y-3 py-2">
            <div className="p-3 rounded-lg theme-bg-subtle border theme-border font-mono text-xs space-y-1">
              <div className="theme-text-muted text-[10px]">LATITUDE / LONGITUDE</div>
              <div className="font-bold theme-text-main text-sm">
                {current.latitude.toFixed(6)}, {current.longitude.toFixed(6)}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-mono theme-text-sub px-1">
              <span>GPS LOCK: 3D DGPS</span>
              <span className="text-[#10b981] dark:text-[#4edea3]">HDOP: 0.9</span>
            </div>
          </div>
          <div className="pt-2 border-t theme-border text-center">
            <a 
              href={`https://maps.google.com/?q=${current.latitude},${current.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-[#10b981] dark:text-[#4edea3] hover:underline"
            >
              Open External Coordinates &rarr;
            </a>
          </div>
        </div>

        {/* Real-time Safety Event Feed */}
        <div className="p-5 rounded-lg theme-bg-card border theme-border space-y-4 transition-colors">
          <div className="flex items-center justify-between text-xs font-mono theme-text-muted">
            <span>LIVE SAFETY FEED</span>
            <AlertTriangle className="w-4 h-4 text-blue-500 dark:text-[#adc6ff]" />
          </div>
          <div className="space-y-2">
            {recentEvents.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono theme-text-muted">
                No safety events recorded. Fleet status nominal.
              </div>
            ) : (
              recentEvents.map((evt) => (
                <div key={evt.id} className="p-2.5 rounded-lg theme-bg-subtle border theme-border text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-500 dark:text-rose-400">{evt.event_type}</span>
                    <span className="text-[10px] theme-text-muted">{evt.severity}</span>
                  </div>
                  <p className="text-[11px] theme-text-sub mt-1 truncate">
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
