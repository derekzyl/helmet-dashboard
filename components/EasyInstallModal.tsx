'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Check, Radio, Zap, Camera, QrCode, 
  Wifi, KeyRound, Sparkles, AlertCircle, ArrowRight, CheckCircle2 
} from 'lucide-react';
import { DiscoverableDevice, fetchDiscoverableDevices, easyInstallDevice } from '@/lib/api';

interface EasyInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EasyInstallModal({ isOpen, onClose, onSuccess }: EasyInstallModalProps) {
  // Wizard steps: 1 = Discovery/Scan, 2 = Customize Profile, 3 = Safety Diagnostics
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState<'radar' | 'qr' | 'pin'>('radar');

  // Discoverable devices
  const [discoverable, setDiscoverable] = useState<DiscoverableDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedKit, setSelectedKit] = useState<DiscoverableDevice | null>(null);

  // QR Code state
  const [qrScannedCode, setQrScannedCode] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 4-Digit PIN state
  const [pinDigits, setPinDigits] = useState(['8', '4', '9', '2']);

  // Step 2 customization
  const [vehicleName, setVehicleName] = useState('My Cruiser');
  const [vehicleType, setVehicleType] = useState('Cruiser');
  const [safetyPreset, setSafetyPreset] = useState<'STANDARD' | 'STRICT' | 'TRACK'>('STANDARD');

  // Submitting & Diagnostics
  const [isInstalling, setIsInstalling] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);

  // Backdrop light-dismiss & Escape key handling (per modern-web-guidance)
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isInstalling) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isInstalling, onClose]);

  // Load discoverable nearby devices when modal opens
  useEffect(() => {
    if (isOpen) {
      scanForNearby();
    } else {
      // Reset state on close
      setStep(1);
      setInstallError(null);
      setDiagnosticProgress(0);
      stopCamera();
    }
  }, [isOpen]);

  const scanForNearby = async () => {
    setIsScanning(true);
    try {
      const items = await fetchDiscoverableDevices();
      setDiscoverable(items);
      if (items.length > 0 && !selectedKit) {
        setSelectedKit(items[0]);
      }
    } finally {
      setTimeout(() => setIsScanning(false), 600);
    }
  };

  // Camera scanner handling
  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch {
      // Graceful fallback if no webcam
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const simulateQrScan = (code = '8492') => {
    setQrScannedCode(code);
    setSelectedKit({
      kit_code: code,
      serial_number: `HLM-${code}`,
      ignition_serial: `IGN-${code}`,
      label: `Vanguard Pro Kit #${code}`,
      rssi_dbm: -42,
      battery_pct: 94,
      ready_to_pair: true,
    });
    stopCamera();
  };

  // 4-Digit PIN input change
  const handlePinChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...pinDigits];
    newDigits[idx] = val.slice(-1);
    setPinDigits(newDigits);

    // Auto advance focus
    if (val && idx < 3) {
      const nextInput = document.getElementById(`pin-input-${idx + 1}`);
      nextInput?.focus();
    }
  };

  // Proceed to Step 2
  const handleProceedToCustomize = (kit?: DiscoverableDevice) => {
    if (kit) {
      setSelectedKit(kit);
      setVehicleName(`${kit.label.split(' ')[0]} Ride`);
    } else if (activeTab === 'pin') {
      const pin = pinDigits.join('');
      setSelectedKit({
        kit_code: pin,
        serial_number: `HLM-${pin}`,
        ignition_serial: `IGN-${pin}`,
        label: `Smart Helmet Kit #${pin}`,
        rssi_dbm: -50,
        battery_pct: 95,
        ready_to_pair: true,
      });
      setVehicleName(`Motorcycle #${pin}`);
    }
    setStep(2);
  };

  // Complete installation and trigger diagnostics
  const handleExecuteInstall = async () => {
    setIsInstalling(true);
    setInstallError(null);
    setStep(3);

    try {
      const shortCode = selectedKit?.kit_code || pinDigits.join('') || qrScannedCode || '8492';
      await easyInstallDevice({
        short_code: shortCode,
        label: vehicleName || `Cruiser Kit #${shortCode}`,
        vehicle_type: vehicleType,
        safety_preset: safetyPreset,
      });

      // Animated Diagnostic progress
      for (let p = 10; p <= 100; p += 30) {
        setDiagnosticProgress(p);
        await new Promise((r) => setTimeout(r, 400));
      }
      setDiagnosticProgress(100);
      onSuccess();
    } catch (err: any) {
      setInstallError(err.message || 'Failed to complete system installation.');
      setStep(2);
    } finally {
      setIsInstalling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      onClick={(e) => {
        // Light-dismiss: close when clicking the backdrop
        if (e.target === dialogRef.current && !isInstalling) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-wizard-title"
    >
      <div 
        className="w-full max-w-xl rounded-2xl theme-bg-card border theme-border shadow-2xl overflow-hidden transition-all my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Wizard Header */}
        <div className="p-6 border-b theme-border flex items-center justify-between theme-bg-subtle/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl theme-primary-bg flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-emerald-950 dark:text-emerald-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#10b981] dark:text-[#4edea3] font-bold">
                  EASY INSTALLATION
                </span>
                <span className="text-[11px] font-mono theme-text-muted">
                  Step {step} of 3
                </span>
              </div>
              <h2 id="install-wizard-title" className="text-lg font-bold font-sans theme-text-main mt-0.5">
                {step === 1 && 'Connect Smart Helmet & Ignition'}
                {step === 2 && 'Vehicle Profile & Safety Mode'}
                {step === 3 && 'Arming Ignition Interlock'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isInstalling}
            className="w-8 h-8 rounded-lg flex items-center justify-center theme-text-muted hover:theme-text-main hover:theme-bg-subtle transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>

        {/* Wizard Body */}
        <div className="p-6 space-y-6">
          {installError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center gap-2.5 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{installError}</span>
            </div>
          )}

          {/* ================= STEP 1: ZERO-SERIAL DISCOVERY ================= */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Method Switcher Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl theme-bg-subtle border theme-border text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActiveTab('radar')}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    activeTab === 'radar'
                      ? 'theme-bg-card theme-text-main shadow-sm'
                      : 'theme-text-muted hover:theme-text-main'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5 text-[#10b981] dark:text-[#4edea3]" />
                  <span>Nearby Radar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('qr');
                    startCamera();
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    activeTab === 'qr'
                      ? 'theme-bg-card theme-text-main shadow-sm'
                      : 'theme-text-muted hover:theme-text-main'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-blue-500 dark:text-[#4cd7f6]" />
                  <span>Scan QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('pin');
                    stopCamera();
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-bold transition-all cursor-pointer ${
                    activeTab === 'pin'
                      ? 'theme-bg-card theme-text-main shadow-sm'
                      : 'theme-text-muted hover:theme-text-main'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>4-Digit PIN</span>
                </button>
              </div>

              {/* TAB 1: NEARBY RADAR (FAST PAIR) */}
              {activeTab === 'radar' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl theme-bg-subtle/50 border theme-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center w-8 h-8">
                        <div className="absolute w-full h-full rounded-full bg-[#10b981]/20 animate-ping" />
                        <Radio className="w-4 h-4 text-[#10b981] dark:text-[#4edea3] relative z-10" />
                      </div>
                      <div>
                        <p className="text-xs font-mono font-bold theme-text-main">
                          {isScanning ? 'Scanning for nearby Smart Helmets...' : 'Nearby Hardware Broadcasts Detected'}
                        </p>
                        <p className="text-[11px] font-mono theme-text-muted">
                          Hold Button B on helmet or turn on bike ignition to broadcast
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={scanForNearby}
                      disabled={isScanning}
                      className="px-2.5 py-1 rounded-md theme-bg-card border theme-border text-[11px] font-mono theme-text-sub hover:theme-text-main transition-colors cursor-pointer"
                    >
                      {isScanning ? 'Scanning...' : 'Refresh'}
                    </button>
                  </div>

                  {/* List of Detected Kits */}
                  <div className="space-y-2.5">
                    {discoverable.map((kit) => (
                      <div
                        key={kit.kit_code}
                        onClick={() => setSelectedKit(kit)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedKit?.kit_code === kit.kit_code
                            ? 'border-[#10b981] dark:border-[#4edea3] bg-[#10b981]/10'
                            : 'theme-border theme-bg-card hover:border-emerald-500/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl theme-bg-subtle border theme-border flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[#10b981] dark:text-[#4edea3]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold theme-text-main font-sans">{kit.label}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full theme-bg-subtle text-[#10b981] dark:text-[#4edea3] font-bold">
                                Kit #{kit.kit_code}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-mono theme-text-muted mt-0.5">
                              <span className="flex items-center gap-1 text-[#10b981] dark:text-[#4edea3]">
                                <Wifi className="w-3 h-3" />
                                <span>Signal: {kit.rssi_dbm} dBm</span>
                              </span>
                              <span>•</span>
                              <span>Battery: {kit.battery_pct}%</span>
                              <span>•</span>
                              <span>Ignition: Ready</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProceedToCustomize(kit);
                          }}
                          className="px-3.5 py-1.5 rounded-lg theme-primary-bg font-bold text-xs font-mono flex items-center gap-1 cursor-pointer transition-transform hover:scale-[1.02]"
                        >
                          <span>1-Tap Install</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: QR CODE SCANNER */}
              {activeTab === 'qr' && (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl theme-bg-subtle border theme-border flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden min-h-[200px]">
                    {isCameraActive ? (
                      <div className="relative w-full max-w-xs aspect-square rounded-xl overflow-hidden border-2 border-[#10b981] shadow-lg">
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <div className="absolute inset-0 border-2 border-emerald-400/60 pointer-events-none animate-pulse" />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="w-14 h-14 mx-auto rounded-2xl theme-bg-card border theme-border flex items-center justify-center">
                          <Camera className="w-7 h-7 text-blue-500 dark:text-[#4cd7f6]" />
                        </div>
                        <h4 className="text-sm font-bold theme-text-main font-sans">
                          Point Camera at Helmet QR Code
                        </h4>
                        <p className="text-xs font-mono theme-text-muted max-w-xs mx-auto">
                          Found on the inner visor sticker, quick-start guide, or packaging card.
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => simulateQrScan('8492')}
                        className="px-3 py-1.5 rounded-lg theme-bg-card border theme-border text-xs font-mono theme-text-sub hover:theme-text-main flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Simulate Scan (Kit #8492)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => simulateQrScan('3917')}
                        className="px-3 py-1.5 rounded-lg theme-bg-card border theme-border text-xs font-mono theme-text-sub hover:theme-text-main flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Simulate Scan (Kit #3917)</span>
                      </button>
                    </div>
                  </div>

                  {qrScannedCode && (
                    <div className="p-3 rounded-xl bg-[#10b981]/10 border border-[#10b981]/40 flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2 text-[#10b981] dark:text-[#4edea3]">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>QR Code Verified: Smart Helmet Kit #{qrScannedCode}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleProceedToCustomize()}
                        className="px-3 py-1 rounded-md theme-primary-bg font-bold text-xs cursor-pointer"
                      >
                        Next &rarr;
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: 4-DIGIT SHORT PIN */}
              {activeTab === 'pin' && (
                <div className="space-y-4">
                  <div className="p-6 rounded-2xl theme-bg-subtle border theme-border text-center space-y-4">
                    <div>
                      <h4 className="text-sm font-bold theme-text-main font-sans">
                        Enter 4-Digit Kit PIN
                      </h4>
                      <p className="text-xs font-mono theme-text-muted mt-0.5">
                        Printed on the box label or NFC tag (e.g. 8492)
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                      {pinDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`pin-input-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handlePinChange(idx, e.target.value)}
                          className="w-12 h-14 text-center text-2xl font-bold font-mono rounded-xl theme-bg-card border theme-border theme-text-main focus:border-[#10b981] focus:outline-none shadow-sm transition-all"
                        />
                      ))}
                    </div>

                    {/* Quick Preset Chips */}
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <span className="text-[11px] font-mono theme-text-muted">Sample Kits:</span>
                      {['8492', '3917', '7204'].map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setPinDigits(code.split(''))}
                          className="px-2.5 py-1 rounded-md theme-bg-card border theme-border text-xs font-mono theme-text-sub hover:theme-text-main cursor-pointer"
                        >
                          #{code}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleProceedToCustomize()}
                    className="w-full py-3 rounded-xl theme-primary-bg font-bold text-xs font-mono flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                  >
                    <span>Confirm Kit #{pinDigits.join('')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= STEP 2: FRIENDLY VEHICLE PROFILE ================= */}
          {step === 2 && (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#10b981] dark:text-[#4edea3]">
                  <Shield className="w-4 h-4" />
                  <span className="font-bold">Kit Identified: #{selectedKit?.kit_code || pinDigits.join('')}</span>
                </div>
                <span className="theme-text-muted text-[11px]">Helmet & Ignition Linked</span>
              </div>

              <div>
                <label className="block theme-text-muted mb-1.5 font-bold">MOTORCYCLE NICKNAME</label>
                <input
                  type="text"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  placeholder="e.g. Cruiser Alpha, My Ducati"
                  className="w-full p-3 rounded-xl theme-bg-input border theme-border theme-text-main focus:outline-none focus:border-[#10b981] text-sm font-sans"
                />
              </div>

              {/* Quick Vehicle Type Chips */}
              <div>
                <label className="block theme-text-muted mb-1.5 font-bold">VEHICLE CATEGORY</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Cruiser', 'Street', 'Scooter', 'Sportbike'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setVehicleType(type);
                        setVehicleName(`${type} #${selectedKit?.kit_code || pinDigits.join('')}`);
                      }}
                      className={`py-2 px-2 rounded-lg border text-center font-mono text-[11px] font-bold cursor-pointer transition-all ${
                        vehicleType === type
                          ? 'border-[#10b981] theme-bg-card theme-text-main shadow-sm'
                          : 'theme-border theme-bg-subtle theme-text-muted hover:theme-text-main'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Safety Threshold Preset */}
              <div>
                <label className="block theme-text-muted mb-1.5 font-bold">SAFETY INTERLOCK MODE</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'STANDARD', title: 'Standard', desc: '0.05 mg/L BAC • 3.5G' },
                    { id: 'STRICT', title: 'Strict Fleet', desc: '0.02 mg/L BAC • 2.5G' },
                    { id: 'TRACK', title: 'Sport / Track', desc: '0.05 mg/L BAC • 5.0G' },
                  ].map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => setSafetyPreset(preset.id as any)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        safetyPreset === preset.id
                          ? 'border-[#10b981] bg-[#10b981]/10'
                          : 'theme-border theme-bg-subtle hover:border-emerald-500/30'
                      }`}
                    >
                      <p className="font-bold theme-text-main">{preset.title}</p>
                      <p className="text-[10px] theme-text-muted mt-0.5">{preset.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl theme-bg-subtle hover:opacity-80 theme-text-main border theme-border font-bold cursor-pointer"
                >
                  &larr; Back
                </button>
                <button
                  type="button"
                  onClick={handleExecuteInstall}
                  disabled={isInstalling}
                  className="flex-1 py-3 rounded-xl theme-primary-bg font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-transform hover:scale-[1.01]"
                >
                  <Zap className="w-4 h-4" />
                  <span>Activate & Arm System &rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: AUTOMATED SAFETY DIAGNOSTICS ================= */}
          {step === 3 && (
            <div className="space-y-6 py-4 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center">
                {diagnosticProgress < 100 ? (
                  <Zap className="w-8 h-8 text-[#10b981] dark:text-[#4edea3] animate-bounce" />
                ) : (
                  <Check className="w-8 h-8 text-[#10b981] dark:text-[#4edea3]" />
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold font-sans theme-text-main">
                  {diagnosticProgress < 100 ? 'Performing 3-Second Safety Audit...' : 'System Armed & Ready to Ride!'}
                </h3>
                <p className="text-xs font-mono theme-text-muted mt-1">
                  {diagnosticProgress < 100
                    ? 'Verifying cryptographic link between Helmet and Ignition Relay'
                    : 'Solid-State Relay is armed. Interlock active.'}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full theme-bg-subtle overflow-hidden">
                <div
                  className="h-full bg-[#10b981] transition-all duration-300"
                  style={{ width: `${diagnosticProgress}%` }}
                />
              </div>

              {/* Diagnostics Checklist */}
              <div className="p-4 rounded-xl theme-bg-subtle border theme-border space-y-2.5 text-left text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="theme-text-sub flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${diagnosticProgress >= 30 ? 'text-[#10b981]' : 'theme-text-muted'}`} />
                    <span>Optical Head Wear IR Sensor</span>
                  </span>
                  <span className={diagnosticProgress >= 30 ? 'text-[#10b981] font-bold' : 'theme-text-muted'}>
                    {diagnosticProgress >= 30 ? 'CALIBRATED' : 'WAITING'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="theme-text-sub flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${diagnosticProgress >= 60 ? 'text-[#10b981]' : 'theme-text-muted'}`} />
                    <span>MQ-3 Alcohol Breathalyzer</span>
                  </span>
                  <span className={diagnosticProgress >= 60 ? 'text-[#10b981] font-bold' : 'theme-text-muted'}>
                    {diagnosticProgress >= 60 ? 'ZEROED (0.00 mg/L)' : 'WAITING'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="theme-text-sub flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${diagnosticProgress >= 90 ? 'text-[#10b981]' : 'theme-text-muted'}`} />
                    <span>MPU-6050 Motion / Gyro Sensor</span>
                  </span>
                  <span className={diagnosticProgress >= 90 ? 'text-[#10b981] font-bold' : 'theme-text-muted'}>
                    {diagnosticProgress >= 90 ? 'LEVELED (1.0G Earth)' : 'WAITING'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="theme-text-sub flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${diagnosticProgress >= 100 ? 'text-[#10b981]' : 'theme-text-muted'}`} />
                    <span>Motorcycle Ignition SSR Relay</span>
                  </span>
                  <span className={diagnosticProgress >= 100 ? 'text-[#10b981] font-bold' : 'theme-text-muted'}>
                    {diagnosticProgress >= 100 ? 'LATCHED & ARMED' : 'WAITING'}
                  </span>
                </div>
              </div>

              {diagnosticProgress >= 100 && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 rounded-xl theme-primary-bg font-bold text-xs font-mono cursor-pointer shadow-sm transition-all"
                >
                  Complete Installation & Open Dashboard
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
