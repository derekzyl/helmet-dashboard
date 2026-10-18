# Smart Helmet Fleet Mission Dashboard (`dashboard`)

Enterprise Next.js 16 (App Router + TypeScript + Tailwind CSS v4) real-time telematics and safety management console, designed precisely to Google Stitch specifications.

---

## Features & Screens

1. **Mission Telemetry Cockpit (`/`)**:
   - Live WebSocket feed with automatic reconnection.
   - Dual-Factor Ignition Interlock state indicator (`LOCKED`, `UNLOCKED`, `RUNNING_LATCHED`, `FAULT`).
   - Anti-Stall latch protection indicator.
   - Head detection status via infrared FC-51 sensor.
   - MQ-3 breathalyzer BAC gauge with legal threshold comparison.
   - Li-ion battery voltage & percentage smoothing.
   - 6-axis IMU collision impact magnitude (G) & tilt angle monitor.
   - Dynamic speedometer & live kinematics.

2. **Geospatial Fleet Map (`/map`)**:
   - Interactive Leaflet OpenStreetMap vector layer with dark CartoDB tile theme.
   - Real-time vehicle pin with animated pulse ring.
   - Live coordinates, speed, and GPS fix metadata.

3. **Device Registry & Security Enclave (`/devices`)**:
   - Paired Helmets and Ignition hardware registry.
   - 256-bit PSK pairing status and firmware version tracking.
   - Modal to provision and enroll new hardware devices.

4. **Analytics Panel (`/analytics`)**:
   - Breathalyzer BAC distribution histogram.
   - Road vibration & shock severity breakdown (normal riding vs potholes vs collisions).
   - Trip duration and safety compliance rate.

5. **Alert Centre (`/alerts`)**:
   - High-priority incident feed with severity filtering (`CRITICAL`, `HIGH`, `MEDIUM`).
   - One-click Google Maps location deep-linking for incident coordinates.
   - Emergency dispatch resolution status.

6. **Rider Profiles & Emergency Contacts (`/riders`)**:
   - Rider safety index and badge numbers.
   - Emergency contact roster synchronized to hardware SIM800L flash.

7. **Login Access Portal (`/login`)**:
   - Security terminal access authentication.

---

## Running Locally

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build production bundle
npm run build
```
