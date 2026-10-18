// Smart Helmet Dashboard — Typed API Client & WebSocket Hook
// Connected to Live Koyeb Production Backend

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://big-mariejeanne-cybergenii-b60e7032.koyeb.app/api/v1";
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "wss://big-mariejeanne-cybergenii-b60e7032.koyeb.app/api/v1/ws/live";

export interface Device {
  id: string;
  device_id: string;
  serial_number?: string;
  device_type: string;
  name: string;
  label?: string;
  helmet_serial?: string;
  ignition_serial?: string;
  paired_serial_number?: string;
  firmware_version: string;
  status: "ONLINE" | "OFFLINE" | "ALERT" | "ARMED" | "UNPAIRED" | string;
  paired_device_id?: string;
  last_seen_at?: string;
  last_battery_pct?: number;
  last_latitude?: number;
  last_longitude?: number;
  is_active: boolean;
}

export interface TelemetryPoint {
  id?: string;
  device_id: string;
  helmet_worn: boolean;
  alcohol_detected?: boolean;
  alcohol_level_mg_l?: number;
  bac_level: number;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  battery_percentage: number;
  battery_pct?: number;
  battery_voltage?: number;
  battery_mv?: number;
  impact_g?: number;
  tilt_degrees?: number;
  ignition_status: "LOCKED" | "UNLOCKED" | "RUNNING_LATCHED" | "FAULT";
  ignition_state?: string;
  lock_reason?: string;
  timestamp: string;
  recorded_at?: string;
}

export interface SafetyEvent {
  id: string;
  device_id: string;
  event_type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "WARNING" | "INFO";
  description?: string;
  message?: string;
  latitude?: number;
  longitude?: number;
  is_resolved?: boolean;
  acknowledged?: boolean;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone_number: string;
  relationship: string;
  priority: number;
  is_primary?: boolean;
  notify_sms?: boolean;
  notify_call?: boolean;
  is_active: boolean;
}

export function normalizeTelemetry(t: any): TelemetryPoint {
  const bac = t.bac_level ?? t.alcohol_level_mg_l ?? 0;
  return {
    ...t,
    device_id: t.device_id || "HLM-2026-0001",
    helmet_worn: Boolean(t.helmet_worn),
    bac_level: bac,
    alcohol_detected: t.alcohol_detected ?? (bac > 0.05),
    alcohol_level_mg_l: bac,
    battery_percentage: t.battery_percentage ?? t.battery_pct ?? 90,
    battery_voltage: t.battery_voltage ?? (t.battery_mv ? t.battery_mv / 1000 : 4.0),
    speed_kmh: t.speed_kmh ?? 0,
    latitude: t.latitude ?? 6.5244,
    longitude: t.longitude ?? 3.3792,
    ignition_status: (t.ignition_status ?? t.ignition_state ?? "LOCKED") as any,
    timestamp: t.timestamp ?? t.recorded_at ?? new Date().toISOString(),
  };
}

export async function fetchDevices(): Promise<Device[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/devices/`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch devices");
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.items || [];
    return list.map((d: any) => ({
      ...d,
      device_id: d.serial_number || d.device_id || d.id,
      name: d.label || d.name || `Smart Helmet System (${d.serial_number})`,
      helmet_serial: d.serial_number,
      ignition_serial: d.ignition_serial || d.paired_serial_number || (d.paired_device_id ? `IGN-${(d.serial_number || '').replace(/^HLM-?/, '')}` : undefined),
    }));
  } catch (err) {
    console.warn("Could not fetch devices from API:", err);
    return [];
  }
}

export interface DiscoverableDevice {
  kit_code: string;
  serial_number: string;
  ignition_serial: string;
  label: string;
  rssi_dbm: number;
  battery_pct: number;
  ready_to_pair: boolean;
}

export async function fetchDiscoverableDevices(): Promise<DiscoverableDevice[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/devices/discover`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to discover devices");
    return await res.json();
  } catch (err) {
    console.warn("Using local discoverable fallbacks:", err);
    return [
      { kit_code: "8492", serial_number: "HLM-8492", ignition_serial: "IGN-8492", label: "Vanguard Pro Helmet Kit", rssi_dbm: -42, battery_pct: 94, ready_to_pair: true },
      { kit_code: "3917", serial_number: "HLM-3917", ignition_serial: "IGN-3917", label: "AeroSport Helmet Kit", rssi_dbm: -58, battery_pct: 88, ready_to_pair: true },
    ];
  }
}

export async function easyInstallDevice(payload: {
  short_code?: string;
  qr_payload?: string;
  label?: string;
  vehicle_type?: string;
  safety_preset?: string;
  serial_number?: string;
}): Promise<Device> {
  const res = await fetch(`${API_BASE_URL}/devices/easy-install`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.message || "Failed to install smart helmet kit");
  }
  return await res.json();
}

export async function fetchLatestTelemetry(deviceId?: string): Promise<TelemetryPoint | null> {
  try {
    const id = deviceId || 'HLM-2026-0001';
    const res = await fetch(`${API_BASE_URL}/telemetry/latest/${encodeURIComponent(id)}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const raw = await res.json();
    return normalizeTelemetry(raw);
  } catch {
    return null;
  }
}

export async function fetchTelemetryHistory(deviceId?: string, limit = 50): Promise<TelemetryPoint[]> {
  try {
    const id = deviceId || 'HLM-2026-0001';
    const res = await fetch(`${API_BASE_URL}/telemetry/history/${encodeURIComponent(id)}?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.items || [];
    return list.map(normalizeTelemetry);
  } catch {
    return [];
  }
}

export async function fetchEvents(limit = 20): Promise<SafetyEvent[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/events/?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.items || [];
    return list.map((ev: any) => ({
      ...ev,
      description: ev.message || ev.description || "",
      is_resolved: ev.acknowledged ?? ev.is_resolved ?? false,
    }));
  } catch {
    return [];
  }
}

export async function fetchEmergencyContacts(): Promise<EmergencyContact[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/contacts/`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.items || [];
    return list.map((c: any) => ({
      ...c,
      priority: c.is_primary ? 1 : 2,
      is_active: true,
    }));
  } catch {
    return [];
  }
}
