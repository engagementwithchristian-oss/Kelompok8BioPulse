import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Droplets,
  Footprints,
  HeartPulse,
  Hospital,
  Info,
  Sparkles,
  Thermometer,
  Volume2,
  VolumeX,
  Wind,
  X,
} from 'lucide-react';
import {
  ACTIVITY_CONDITIONS,
  ActivityStateId,
  SENSOR_INSPECTIONS,
  SensorNodeId,
  SUBJECT_PROFILES,
  SubjectId,
  WEARABLE_SUITES,
  WearableSuiteId,
  computeSimulatedVitals,
} from '../data/physiologyData';
import { LITERATURE_SOURCES } from '../data/scientificContent';
import { HumanBioViewport } from './HumanBioViewport';
import { LiveWaveformCanvas } from './LiveWaveformCanvas';

interface SimulatorViewProps {
  subjectId: SubjectId;
  onChangeSubject: (id: SubjectId) => void;
  wearableSuite: WearableSuiteId;
  onChangeWearable: (id: WearableSuiteId) => void;
  activityId: ActivityStateId;
  onChangeActivity: (id: ActivityStateId) => void;
  onOpenSourcesTab: () => void;
  onOpenHowItWorksTab: () => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  subjectId,
  onChangeSubject,
  wearableSuite,
  onChangeWearable,
  activityId,
  onChangeActivity,
  onOpenSourcesTab,
  onOpenHowItWorksTab,
}) => {
  const subject = SUBJECT_PROFILES[subjectId];
  const suite = WEARABLE_SUITES[wearableSuite];
  const condition = ACTIVITY_CONDITIONS[activityId];
  const vitals = useMemo(() => computeSimulatedVitals(subject, condition), [subject, condition]);

  const [selectedSensor, setSelectedSensor] = useState<SensorNodeId | null>(null);
  const [waveformMode, setWaveformMode] = useState<'ecg' | 'ppg'>(
    wearableSuite === 'wrist_ppg' ? 'ppg' : 'ecg'
  );
  const [liveSteps, setLiveSteps] = useState<number>(vitals.stepsBase);
  const [liveHrJitter, setLiveHrJitter] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (wearableSuite === 'wrist_ppg') setWaveformMode('ppg');
    else if (wearableSuite === 'chest_patch') setWaveformMode('ecg');
  }, [wearableSuite]);

  useEffect(() => {
    setSelectedQuizOption(null);
  }, [activityId]);

  useEffect(() => {
    setLiveSteps(vitals.stepsBase);
    const interval = window.setInterval(() => {
      setLiveHrJitter(
        condition.irregularRhythm
          ? Math.round((Math.random() - 0.45) * 14)
          : Math.round((Math.random() - 0.5) * 3)
      );
      if (vitals.stepsPerSecond > 0) {
        setLiveSteps((prev) => prev + Math.round(vitals.stepsPerSecond));
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [vitals.stepsBase, vitals.stepsPerSecond, condition.irregularRhythm]);

  const displayedHr = Math.min(subject.maxHr, Math.max(40, vitals.hr + liveHrJitter));

  useEffect(() => {
    if (!audioEnabled) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    let timerId = 0;
    let active = true;

    const scheduleBeat = () => {
      if (!active) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(condition.statusLevel === 'critical' ? 660 : 520, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.045, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);

      const baseMs = (60 / displayedHr) * 1000;
      const nextMs = condition.irregularRhythm
        ? baseMs * (0.65 + Math.random() * 0.75)
        : baseMs;
      timerId = window.setTimeout(scheduleBeat, Math.max(240, nextMs));
    };

    scheduleBeat();
    return () => {
      active = false;
      window.clearTimeout(timerId);
    };
  }, [audioEnabled, displayedHr, condition.irregularRhythm, condition.statusLevel]);

  const hrDeltaFromBase = displayedHr - subject.baselineHr;
  const tempDeltaFromBase = Number((vitals.temp - subject.baselineTemp).toFixed(1));
  const spo2DeltaFromBase = vitals.spo2 - subject.baselineSpo2;

  const statusStyles = {
    nominal: {
      text: 'text-emerald-700',
      surface: 'bg-emerald-50 border-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />,
      prefix: 'NORMAL',
    },
    elevated: {
      text: 'text-amber-800',
      surface: 'bg-amber-50 border-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />,
      prefix: 'MENINGKAT',
    },
    critical: {
      text: 'text-rose-800',
      surface: 'bg-rose-50 border-rose-200',
      icon: <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />,
      prefix: 'KRITIS',
    },
  }[condition.statusLevel];

  const activeCitations = condition.citationIds
    .map((id) => LITERATURE_SOURCES.find((src) => src.id === id))
    .filter(Boolean);

  const inspectedNode = selectedSensor ? SENSOR_INSPECTIONS[selectedSensor] : null;

  return (
    <div className="space-y-6">
      {/* Expressive High-Contrast Editorial Banner with Health Gradient Mesh */}
      <section className="rounded-2xl bg-gradient-to-br from-[#0B1219] via-[#0F1E2A] to-[#0D2B2E] text-white p-6 sm:p-7 overflow-hidden relative border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          <div className="lg:col-span-7 space-y-2.5">
            <div className="text-xs font-label font-semibold text-[#5EEAD4] tracking-wide">
              Laboratorium Fisiologi Digital · Pemantauan Real-Time untuk Mahasiswa
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display leading-[1.06] text-balance">
              Eksplorasi Cara Kerja Wearable Saat Tubuh Aktif &amp; Sakit.
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Pilih profil anatomi tubuh, atur perangkat sensor yang terpasang, lalu simulasikan
              aktivitas maupun penyakit klinis untuk mengamati perubahan sinyal secara langsung pada
              model 3D.
            </p>
          </div>

          {/* Live Delta Snapshot Strip */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-3">
            <motion.div
              key={`hr-${activityId}-${subjectId}`}
              initial={{ opacity: 0.6, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="rounded-xl bg-white/8 border border-white/15 p-3.5"
            >
              <div className="text-xs font-label text-slate-300">Pergeseran HR</div>
              <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
                {hrDeltaFromBase >= 0 ? `+${hrDeltaFromBase}` : hrDeltaFromBase}
                <span className="text-xs font-label font-normal text-slate-300 ml-1">BPM</span>
              </div>
              <div className="text-[11px] font-label text-teal-300 mt-1">
                vs {subject.baselineHr} dasar
              </div>
            </motion.div>

            <motion.div
              key={`temp-${activityId}-${subjectId}`}
              initial={{ opacity: 0.6, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.04 }}
              className="rounded-xl bg-white/8 border border-white/15 p-3.5"
            >
              <div className="text-xs font-label text-slate-300">Pergeseran Suhu</div>
              <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
                {tempDeltaFromBase >= 0 ? `+${tempDeltaFromBase}` : tempDeltaFromBase}
                <span className="text-xs font-label font-normal text-slate-300 ml-1">°C</span>
              </div>
              <div className="text-[11px] font-label text-amber-300 mt-1">
                vs {subject.baselineTemp} °C
              </div>
            </motion.div>

            <motion.div
              key={`spo2-${activityId}-${subjectId}`}
              initial={{ opacity: 0.6, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.08 }}
              className="rounded-xl bg-white/8 border border-white/15 p-3.5"
            >
              <div className="text-xs font-label text-slate-300">Pergeseran SpO₂</div>
              <div className="text-xl font-bold font-mono tabular-nums text-white mt-1">
                {spo2DeltaFromBase >= 0 ? `+${spo2DeltaFromBase}` : spo2DeltaFromBase}
                <span className="text-xs font-label font-normal text-slate-300 ml-1">%</span>
              </div>
              <div className="text-[11px] font-label text-cyan-300 mt-1">
                vs {subject.baselineSpo2}% dasar
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Top Simulation Configuration Toolbar */}
      <section className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Subject Profile Switcher */}
          <div className="lg:col-span-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-label font-bold text-slate-700">
                1. Profil Subjek Manusia
              </span>
              <span className="text-xs font-label font-medium text-teal-700">
                {subject.ageLabel}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {(Object.keys(SUBJECT_PROFILES) as SubjectId[]).map((id) => (
                <motion.button
                  key={id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onChangeSubject(id)}
                  className={`px-2 py-2 rounded-lg text-xs font-label font-semibold transition-colors whitespace-nowrap truncate cursor-pointer ${
                    subjectId === id
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {SUBJECT_PROFILES[id].label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Wearable Device Configuration */}
          <div className="lg:col-span-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-label font-bold text-slate-700">
                2. Perangkat Wearable
              </span>
              <span className="text-xs font-label font-semibold text-teal-700 truncate">
                {suite.shortLabel}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {(Object.keys(WEARABLE_SUITES) as WearableSuiteId[]).map((id) => (
                <motion.button
                  key={id}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onChangeWearable(id)}
                  className={`px-2 py-2 rounded-lg text-xs font-label font-semibold transition-colors whitespace-nowrap truncate cursor-pointer ${
                    wearableSuite === id
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {WEARABLE_SUITES[id].shortLabel}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Activity & Illness Selector */}
          <div className="lg:col-span-4 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-label font-bold text-slate-700">
                3. Aktivitas atau Kondisi Sakit
              </span>
              <span className="text-xs font-label font-medium text-slate-500">
                {condition.category === 'illness' ? 'Kondisi Klinis' : 'Aktivitas Harian'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(ACTIVITY_CONDITIONS) as ActivityStateId[]).map((id) => {
                const item = ACTIVITY_CONDITIONS[id];
                const isSelected = activityId === id;
                const isIllness = item.category === 'illness';
                return (
                  <motion.button
                    key={id}
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => onChangeActivity(id)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-label font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? isIllness
                          ? 'bg-[#FF6B35] text-white border-[#FF6B35] shadow-xs'
                          : 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.shortLabel}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main 3-Column Futuristic Health Digital Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* LEFT RAIL: DATA TUBUH / MONITOR LANGSUNG */}
        <aside className="xl:col-span-3 flex flex-col gap-3.5">
          {/* Header Status Card */}
          <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-950 font-display">
                  Data Tubuh · Monitor Langsung
                </h2>
                <p className="text-xs font-label text-slate-500 mt-0.5">
                  {subject.label} · {suite.shortLabel}
                </p>
              </div>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => setAudioEnabled((a) => !a)}
                title={audioEnabled ? 'Matikan suara detak jantung' : 'Nyalakan suara detak jantung'}
                className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                  audioEnabled
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
                aria-label="Toggle suara monitor detak jantung"
              >
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={condition.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-label font-semibold ${statusStyles.surface} ${statusStyles.text}`}
                >
                  {statusStyles.icon}
                  <span>
                    {statusStyles.prefix} · {condition.statusText}
                  </span>
                </div>

                <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                  <strong className="font-label text-slate-900 font-semibold">
                    Aktivitas saat ini:
                  </strong>{' '}
                  {condition.currentActivityText}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Heart Rate + Real-Time ECG/PPG Trace */}
          <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-label font-semibold text-slate-600">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                  <span>Detak Jantung</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold font-mono tabular-nums text-slate-950">
                    {displayedHr}
                  </span>
                  <span className="text-xs font-label font-semibold text-slate-500">BPM</span>
                </div>
              </div>
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md">
                <button
                  type="button"
                  onClick={() => setWaveformMode('ecg')}
                  className={`px-2 py-1 rounded text-[11px] font-label font-semibold transition-colors cursor-pointer ${
                    waveformMode === 'ecg'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  ECG
                </button>
                <button
                  type="button"
                  onClick={() => setWaveformMode('ppg')}
                  className={`px-2 py-1 rounded text-[11px] font-label font-semibold transition-colors cursor-pointer ${
                    waveformMode === 'ppg'
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  PPG
                </button>
              </div>
            </div>

            <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  condition.statusLevel === 'critical'
                    ? 'bg-rose-600'
                    : condition.statusLevel === 'elevated'
                      ? 'bg-[#FF6B35]'
                      : 'bg-teal-600'
                }`}
                style={{ width: `${Math.min(100, Math.round((displayedHr / subject.maxHr) * 100))}%` }}
              />
            </div>

            <div className="mt-2.5 bg-slate-50 border border-slate-100 rounded-xl p-1.5">
              <LiveWaveformCanvas
                bpm={displayedHr}
                irregularRhythm={condition.irregularRhythm}
                motionArtifactLevel={condition.motionArtifactLevel}
                mode={waveformMode}
                accentColor={condition.statusLevel === 'critical' ? '#E11D48' : '#0D9488'}
                height={62}
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-xs font-label text-slate-600">
              <span>
                HRV (RMSSD): <strong className="font-mono text-slate-900">{vitals.hrv} ms</strong>
              </span>
              <span>
                Napas: <strong className="font-mono text-slate-900">{vitals.respRate} /mnt</strong>
              </span>
            </div>
          </div>

          {/* 3-Card Telemetry Stack: SpO2, Temperature, Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-3">
            <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-label font-semibold text-slate-600">
                  <Wind className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Saturasi SpO₂</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl font-bold font-mono tabular-nums ${
                      vitals.spo2 < 92 ? 'text-rose-700' : 'text-slate-950'
                    }`}
                  >
                    {vitals.spo2}
                  </span>
                  <span className="text-xs font-label font-semibold text-slate-500">%</span>
                </div>
              </div>
              <div className="text-right text-[11px] font-label text-slate-500">
                <div>660 / 940 nm</div>
                <div className="font-semibold text-slate-700">
                  {vitals.spo2 < 92 ? 'Desaturasi' : 'Rentang normal'}
                </div>
              </div>
            </div>

            <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-label font-semibold text-slate-600">
                  <Thermometer className="w-3.5 h-3.5 text-amber-600" />
                  <span>Suhu Tubuh</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl font-bold font-mono tabular-nums ${
                      vitals.temp >= 38.0 ? 'text-amber-700' : 'text-slate-950'
                    }`}
                  >
                    {vitals.temp.toFixed(1)}
                  </span>
                  <span className="text-xs font-label font-semibold text-slate-500">°C</span>
                </div>
              </div>
              <div className="text-right text-[11px] font-label text-slate-500">
                <div>Termistor NTC</div>
                <div className="font-semibold text-slate-700">
                  {vitals.temp >= 38.0 ? 'Demam / Naik' : 'Normotermia'}
                </div>
              </div>
            </div>

            <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-3.5 flex items-center justify-between shadow-xs">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-label font-semibold text-slate-600">
                  <Footprints className="w-3.5 h-3.5 text-teal-600" />
                  <span>Jumlah Langkah</span>
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-mono tabular-nums text-slate-950">
                    {liveSteps.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs font-label font-semibold text-slate-500">langkah</span>
                </div>
              </div>
              <div className="text-right text-[11px] font-label text-slate-500">
                <div>IMU 3-Sumbu</div>
                <div className="font-semibold text-slate-700">
                  {vitals.stepsPerSecond > 0
                    ? `${vitals.stepsPerSecond.toFixed(1)} lgk/dtk`
                    : 'Diam / Stasioner'}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* CENTER STAGE: INTERACTIVE 3D HUMAN & WEARABLE VIEWPORT */}
        <div className="xl:col-span-5 flex flex-col gap-3">
          <div className="flex-1 min-h-[520px]">
            <HumanBioViewport
              subjectId={subjectId}
              wearableSuite={wearableSuite}
              activityId={activityId}
              bpm={displayedHr}
              respRate={vitals.respRate}
              spo2={vitals.spo2}
              temp={vitals.temp}
              irregularRhythm={condition.irregularRhythm}
              selectedSensor={selectedSensor}
              onSelectSensor={setSelectedSensor}
            />
          </div>

          <AnimatePresence mode="wait">
            {inspectedNode ? (
              <motion.div
                key={`inspect-${inspectedNode.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-label font-semibold text-teal-700">
                      {inspectedNode.systemTag} · {inspectedNode.location}
                    </div>
                    <h3 className="text-sm font-bold text-slate-950 mt-0.5 font-display">
                      {inspectedNode.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedSensor(null)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    aria-label="Tutup inspeksi sensor"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {inspectedNode.howItWorksShort}
                </p>
                <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="text-slate-500">
                    <strong className="font-label text-slate-700 font-semibold">
                      Keterbatasan:
                    </strong>{' '}
                    {inspectedNode.limitationsShort}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenHowItWorksTab}
                    className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-900 font-label font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Pelajari Sistem</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="inspect-prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/95 border border-slate-200/90 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs"
              >
                <div className="text-xs font-label text-slate-600">
                  <span className="font-bold text-slate-900">Inspeksi Titik 3D:</span> Klik langsung
                  model 3D atau pilih node:
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['wrist_ppg', 'chest_ecg', 'temple_pod', 'heart', 'lungs'] as SensorNodeId[]).map(
                    (nodeId) => (
                      <motion.button
                        key={nodeId}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedSensor(nodeId)}
                        className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-xs font-label font-semibold text-slate-700 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {nodeId === 'wrist_ppg'
                          ? 'PPG Tangan'
                          : nodeId === 'chest_ecg'
                            ? 'Patch Dada'
                            : nodeId === 'temple_pod'
                              ? 'Pod Pelipis'
                              : nodeId === 'heart'
                                ? 'Jantung'
                                : 'Paru-Paru'}
                      </motion.button>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT RAIL: PENJELASAN ILMIAH UNTUK MAHASISWA & UJI PEMAHAMAN MANDIRI */}
        <aside className="xl:col-span-4 flex flex-col gap-3.5">
          {/* Physiological Mechanism Explanation + Self-Check Student Quiz */}
          <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 flex-1 flex flex-col justify-between space-y-4 shadow-xs">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${condition.id}-${subject.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-3.5"
              >
                <div>
                  <div className="text-xs font-label font-semibold text-teal-700">
                    Penjelasan Fisiologis &amp; Sensor · {subject.label}
                  </div>
                  <h3 className="text-base font-bold text-slate-950 mt-0.5 font-display">
                    {condition.mechanismTitle}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {condition.mechanismSummary}
                  </p>
                </div>

                {/* Subject-Specific Baseline Context */}
                <div className="p-2.5 rounded-xl bg-teal-50/60 border border-teal-200/70 text-xs text-slate-700 leading-relaxed">
                  <span className="font-label font-bold text-teal-900">
                    Karakteristik {subject.label}:{' '}
                  </span>
                  {subject.physiologySummary}
                </div>

                <div className="space-y-2 pt-1">
                  {condition.parameterWhy.map((item) => (
                    <div
                      key={item.parameter}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-label font-bold text-slate-900">
                          {item.parameter}
                        </span>
                        <span className="text-xs font-label font-semibold text-teal-700">
                          {item.direction}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Interactive Student Self-Check */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#0B1219] to-[#132934] text-white space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-label font-semibold text-[#5EEAD4]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Uji Pemahaman Mandiri</span>
                  </div>
                  <p className="text-xs font-semibold leading-snug">{condition.quizPrompt}</p>
                  <div className="space-y-1.5">
                    {condition.quizOptions.map((opt, idx) => {
                      const picked = selectedQuizOption === idx;
                      const isCorrect = idx === condition.quizCorrectIndex;
                      const answered = selectedQuizOption !== null;
                      return (
                        <motion.button
                          key={opt}
                          type="button"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedQuizOption(idx)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[11px] border transition-colors cursor-pointer ${
                            !answered
                              ? 'bg-white/6 border-white/15 hover:bg-white/15 text-slate-200'
                              : isCorrect
                                ? 'bg-emerald-600/35 border-emerald-400 text-white'
                                : picked
                                  ? 'bg-rose-600/35 border-rose-400 text-white'
                                  : 'bg-white/5 border-white/10 text-slate-400'
                          }`}
                        >
                          {opt}
                        </motion.button>
                      );
                    })}
                  </div>
                  <AnimatePresence>
                    {selectedQuizOption !== null && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-[11px] text-teal-200 pt-1 leading-relaxed"
                      >
                        {condition.quizFeedback}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Citations Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="text-xs font-label text-slate-500 truncate">
                <BookOpen className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                Pustaka:{' '}
                {activeCitations
                  .map((c) => `${c!.authors.split(',')[0]} (${c!.year})`)
                  .join(' · ')}
              </div>
              <button
                type="button"
                onClick={onOpenSourcesTab}
                className="text-xs font-label font-semibold text-teal-700 hover:text-teal-900 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Lihat Pustaka →
              </button>
            </div>
          </div>

          {/* Public Health Promotion & Hospital Emergency Alert Box */}
          <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 space-y-2.5 shadow-xs">
            <div className="flex items-start gap-2.5">
              <Droplets className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-label font-bold text-slate-900">
                  Promosi Kesehatan &amp; Tindakan Preventif
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {condition.publicHealthNudge}
                </p>
              </div>
            </div>

            {condition.hospitalTrigger && (
              <div className="pt-2.5 border-t border-slate-100 flex items-start gap-2.5">
                <Hospital className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-label font-bold text-rose-800">
                    Eskalasi Telemetri Rumah Sakit / UGD
                  </div>
                  <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                    {condition.hospitalTrigger}
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Explicit Scientific Educational Disclaimer */}
      <footer className="bg-white/95 border border-slate-200/90 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 shadow-xs">
        <div className="flex items-start sm:items-center gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong className="font-label text-slate-700 font-semibold">Catatan Ilmiah:</strong>{' '}
            Seluruh angka pada simulator ini ditujukan untuk ilustrasi edukasi mahasiswa, bukan
            pengukuran medis aktual maupun batas diagnostik klinis.
          </span>
        </div>
        <span className="font-label font-medium text-xs text-slate-500 whitespace-nowrap shrink-0">
          {suite.samplingSummary}
        </span>
      </footer>
    </div>
  );
};
