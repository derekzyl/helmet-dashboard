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

  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (!mapContainerRef.current) return;
      const L = (await import('leaflet')).default;

      if (isCancelled) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [latitude, longitude],
          zoom: 14,
          zoomControl: false,
        });

        // Dark CartoDB tiles matching dark mode theme
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Custom Mint Pulse Marker Icon
        const customIcon = L.divIcon({
          className: 'custom-fleet-pin',
          html: `
            <div style="position: relative; width: 24px; height: 24px;">
              <div style="position: absolute; width: 24px; height: 24px; background: rgba(78, 222, 163, 0.35); border-radius: 50%; animation: radarPulse 1.8s infinite;"></div>
              <div style="position: absolute; top: 4px; left: 4px; width: 16px; height: 16px; background: #4edea3; border: 2px solid #0f131c; border-radius: 50%;"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #dfe2ee; background: #181c24; padding: 6px; border-radius: 4px;">
            <b>${deviceId}</b><br/>
            Speed: ${speed} km/h<br/>
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

    return () => {
      isCancelled = true;
    };
  }, [latitude, longitude, speed, deviceId]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[500px] rounded" />;
}
