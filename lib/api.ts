// Smart Helmet Dashboard — Typed API Client & WebSocket Hook

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1/ws/live";

export interface Device {
  id: string;
  device_id: string;
  device_type: "HELMET" | "IGNITION";
  name: string;
  firmware_version: string;
  status: "ONLINE" | "OFFLINE" | "ALERT";
  paired_device_id?: string;
  last_seen_at?: string;
  is_active: boolean;
}

export interface TelemetryPoint {
  id?: string;
  device_id: string;
  helmet_worn: boolean;
  alcohol_detected: boolean;
  bac_level: number;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  battery_percentage: number;
  battery_voltage?: number;
  impact_g?: number;
  tilt_degrees?: number;
  ignition_status: "LOCKED" | "UNLOCKED" | "RUNNING_LATCHED" | "FAULT";
  lock_reason?: string;
  timestamp: string;
}

export interface SafetyEvent {
  id: string;
  device_id: string;
  event_type: "COLLISION" | "ALCOHOL_VIOLATION" | "HELMET_REMOVED" | "LINK_LOST" | "EMERGENCY_SOS";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  latitude?: number;
  longitude?: number;
  is_resolved: boolean;
  created_at: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone_number: string;
  relationship: string;
  priority: number;
  is_active: boolean;
}

export async function fetchDevices(): Promise<Device[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/devices`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch devices");
    const data = await res.json();
    return data.items || data;
  } catch (err) {
    console.warn("Using fallback seeded devices", err);
    return [
      {
        id: "hlm-1",
        device_id: "HLM-ESP32-001",
        device_type: "HELMET",
        name: "Rider Helmet Prime",
        firmware_version: "1.0.0",
        status: "ONLINE",
        paired_device_id: "IGN-ESP32-001",
        last_seen_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: "ign-1",
        device_id: "IGN-ESP32-001",
        device_type: "IGNITION",
        name: "Bike Ignition Relay Unit",
        firmware_version: "1.0.0",
        status: "ONLINE",
        paired_device_id: "HLM-ESP32-001",
        last_seen_at: new Date().toISOString(),
        is_active: true
      }
    ];
  }
}

export async function fetchLatestTelemetry(deviceId?: string): Promise<TelemetryPoint | null> {
  try {
    const query = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : '';
    const res = await fetch(`${API_BASE_URL}/telemetry/latest${query}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchTelemetryHistory(deviceId?: string, limit = 50): Promise<TelemetryPoint[]> {
  try {
    const query = deviceId ? `?device_id=${encodeURIComponent(deviceId)}&limit=${limit}` : `?limit=${limit}`;
    const res = await fetch(`${API_BASE_URL}/telemetry/history${query}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.items || [];
  } catch {
    return [];
  }
}

export async function fetchEvents(limit = 20): Promise<SafetyEvent[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/events?limit=${limit}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.items || [];
  } catch {
    return [];
  }
}

export async function fetchEmergencyContacts(): Promise<EmergencyContact[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/contacts`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.items || [];
  } catch {
    return [];
  }
}
