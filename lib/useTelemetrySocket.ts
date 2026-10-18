'use client';

import { useState, useEffect, useRef } from 'react';
import { TelemetryPoint, WS_BASE_URL } from './api';

export function useTelemetrySocket(initialDeviceId?: string) {
  const [telemetry, setTelemetry] = useState<TelemetryPoint | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let unmounted = false;

    function connect() {
      if (unmounted) return;
      try {
        const ws = new WebSocket(WS_BASE_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          if (!unmounted) {
            setIsConnected(true);
            console.log('[Dashboard-WS] Connected to live telemetry stream');
          }
        };

        ws.onmessage = (event) => {
          if (unmounted) return;
          try {
            const data: TelemetryPoint = JSON.parse(event.data);
            if (!initialDeviceId || data.device_id === initialDeviceId) {
              setTelemetry(data);
              setTelemetryHistory((prev) => [data, ...prev.slice(0, 49)]);
            }
          } catch (e) {
            console.warn('[Dashboard-WS] Failed to parse message', e);
          }
        };

        ws.onclose = () => {
          if (!unmounted) {
            setIsConnected(false);
            console.log('[Dashboard-WS] Disconnected. Reconnecting in 3s...');
            reconnectTimeoutRef.current = setTimeout(connect, 3000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch (err) {
        console.warn('[Dashboard-WS] Connection error', err);
        if (!unmounted) {
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        }
      }
    }

    connect();

    return () => {
      unmounted = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [initialDeviceId]);

  return { telemetry, telemetryHistory, isConnected };
}
