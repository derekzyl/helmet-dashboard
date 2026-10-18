'use client';

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface FleetMapProps {
  latitude: number;
  longitude: number;
  speed: number;
  deviceId: string;
}

export default function FleetMap({ latitude, longitude, speed, deviceId }: FleetMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (!mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      if (isCancelled) return;

      const isLight = typeof document !== 'undefined' && document.documentElement.classList.contains('light');
      const tileUrl = isLight
        ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [latitude, longitude],
          zoom: 14,
          zoomControl: false,
        });

        const tileLayer = L.tileLayer(tileUrl, {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          maxZoom: 19,
        }).addTo(map);

        tileLayerRef.current = tileLayer;
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Custom Mint / Green Pulse Marker Icon
        const customIcon = L.divIcon({
          className: 'custom-fleet-pin',
          html: `
            <div style="position: relative; width: 24px; height: 24px;">
              <div style="position: absolute; width: 24px; height: 24px; background: rgba(16, 185, 129, 0.35); border-radius: 50%; animation: radarPulse 1.8s infinite;"></div>
              <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; background: #10b981; border: 2px solid white; border-radius: 50%;"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; padding: 4px;">
            <b>${deviceId}</b><br/>
            Speed: ${speed.toFixed(1)} km/h<br/>
            Lat: ${latitude.toFixed(5)}<br/>
            Lng: ${longitude.toFixed(5)}
          </div>
        `);

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } else {
        mapInstanceRef.current.panTo([latitude, longitude]);
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        }
      }
    }

    initMap();

    // Listen for theme change event from ThemeToggle
    const handleThemeChange = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const newTheme = customEvent.detail?.theme;
      if (!mapInstanceRef.current) return;
      const L = (await import('leaflet')).default;

      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }

      const newTileUrl = newTheme === 'light'
        ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

      const newTileLayer = L.tileLayer(newTileUrl, {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        maxZoom: 19,
      }).addTo(mapInstanceRef.current);

      tileLayerRef.current = newTileLayer;
    };

    window.addEventListener('helm-theme-changed', handleThemeChange);

    return () => {
      isCancelled = true;
      window.removeEventListener('helm-theme-changed', handleThemeChange);
    };
  }, [latitude, longitude, speed, deviceId]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[500px] rounded-lg border theme-border overflow-hidden" />;
}
