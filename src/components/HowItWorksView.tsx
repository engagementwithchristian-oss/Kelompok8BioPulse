import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Cpu, Radio, ShieldAlert, Waves } from 'lucide-react';
import {
  DATA_PIPELINE_STAGES,
  LITERATURE_SOURCES,
  SENSOR_SYSTEMS,
} from '../data/scientificContent';

type WavelengthMode = 'green' | 'red' | 'ir';

export const HowItWorksView: React.FC = () => {
  const [activeSystemId, setActiveSystemId] = useState<'system_a' | 'system_b' | 'system_c'>(
    'system_a'
  );
  const [activeStageId, setActiveStageId] = useState<string>('stage1');
  const [wavelength, setWavelength] = useState<WavelengthMode>('green');

  const activeSystem = SENSOR_SYSTEMS.find((s) => s.id === activeSystemId) ?? SENSOR_SYSTEMS[0];
  const activeStage =
    DATA_PIPELINE_STAGES.find((st) => st.id === activeStageId) ?? DATA_PIPELINE_STAGES[0];

  const wavelengthSpecs: Record<
    WavelengthMode,
    {
      label: string;
      nm: string;
      penetration: string;
      depthPx: number;
      beamColor: string;
      physicsNote: string;
    }
  > = {
    green: {
      label: 'LED Hijau',
      nm: '525 nm',
      penetration: 'Dermis superfisial (~0,5–1,0 mm)',
      depthPx: 54,
      beamColor: '#10B981',
      physicsNote:
        'Diserap kuat oleh oksihemoglobin dan deoksihemoglobin sehingga menghasilkan gelombang nadi AC besar yang lebih tahan gangguan aliran vena dangkal—ideal untuk detak jantung di pergelangan tangan.',
    },
    red: {
      label: 'LED Merah',
      nm: '660 nm',
      penetration: 'Dermis dalam / arteriol (~1,5–2,2 mm)',
      depthPx: 88,
      beamColor: '#EF4444',
      physicsNote:
        'Deoksihemoglobin (Hb) menyerap cahaya merah 660 nm sekitar 10× lebih besar dibanding oksihemoglobin (HbO₂). Saat SpO₂ turun pada hipoksemia, serapan cahaya merah melonjak tajam.',
    },
    ir: {
      label: 'LED Inframerah',
      nm: '940 nm',
      penetration: 'Jaringan arteri subkutan (~2,5–3,5 mm)',
      depthPx: 118,
      beamColor: '#0EA5E9',
      physicsNote:
        'Oksihemoglobin (HbO₂) menyerap cahaya inframerah 940 nm lebih besar dibanding Hb. Membagi rasio AC/DC Merah dengan IR menghasilkan Rasio-dari-Rasio (R) untuk menghitung persentase SpO₂.',
    },
  };

  const wSpec = wavelengthSpecs[wavelength];

  return (
    <div className="space-y-8">
      {/* Expressive Header with Health Gradient */}
      <section className="rounded-2xl bg-gradient-to-br from-[#0B1219] via-[#0F1E2A] to-[#0D2B2E] text-white p-6 sm:p-7 border border-slate-800">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-label font-semibold text-[#5EEAD4]">
            Arsitektur Teknik Biomedis · Sistem A, B &amp; C
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
            Bagaimana Konsep Wearable Berkembang &amp; Mentransfer Data Akurat?
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Perangkat wearable modern tidak mengukur detak jantung atau oksigen secara langsung.
            Mereka memadukan tiga sistem sensor fisik—optik (Sistem A), biopotensial listrik
            (Sistem B), dan gerak inersia (Sistem C)—lalu menyaring sinyal secara bertahap agar
            tetap akurat saat tubuh bergerak maupun sakit.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {SENSOR_SYSTEMS.map((sys) => {
            const selected = sys.id === activeSystemId;
            return (
              <motion.button
                key={sys.id}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveSystemId(sys.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-label font-semibold border transition-colors whitespace-nowrap cursor-pointer ${
                  selected
                    ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                    : 'bg-white/5 text-slate-200 border-white/15 hover:bg-white/10'
                }`}
              >
                {sys.code}: {sys.title.split('(')[0].trim()}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Active System Deep-Dive Split with Smooth Animated Switching */}
      <AnimatePresence mode="wait">
        <motion.section
          key={activeSystemId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
        >
          <div className="lg:col-span-7 bg-white/95 border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-xs">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-label font-semibold text-teal-700">
                  {activeSystem.code} · {activeSystem.modality}
                </span>
                <span className="text-xs font-label text-slate-500">
                  {activeSystem.samplingRate}
                </span>
              </div>

              <h3 className="text-xl font-bold text-slate-950 font-display">
                {activeSystem.title}
              </h3>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="text-xs font-label font-bold text-slate-900">
                  Prinsip Fisika Sensor
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeSystem.physicsPrinciple}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200">
                  <div className="text-xs font-label font-bold text-slate-900 mb-2">
                    Keunggulan Klinis
                  </div>
                  <ul className="space-y-1.5">
                    {activeSystem.strengths.map((s) => (
                      <li key={s} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200">
                  <div className="text-xs font-label font-bold text-slate-900 mb-2">
                    Sumber Galat &amp; Kegagalan
                  </div>
                  <ul className="space-y-1.5">
                    {activeSystem.failureModes.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-label font-bold text-slate-900">Patokan Akurasi: </span>
                <span className="font-mono text-slate-600">{activeSystem.accuracyBenchmarks}</span>
              </div>
              <div className="font-label text-xs text-slate-500">
                {activeSystem.citationIds
                  .map((id) => {
                    const found = LITERATURE_SOURCES.find((l) => l.id === id);
                    return found ? `${found.authors.split(',')[0]} (${found.year})` : '';
                  })
                  .filter(Boolean)
                  .join(' · ')}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/95 border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
            {activeSystemId === 'system_a' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-950 font-display">
                    Lab Interaktif Penetrasi Cahaya Optik
                  </h4>
                  <p className="text-xs text-slate-500">
                    Klik panjang gelombang LED untuk melihat kedalaman tembus foton di lapisan kulit.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  {(['green', 'red', 'ir'] as WavelengthMode[]).map((mode) => (
                    <motion.button
                      key={mode}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setWavelength(mode)}
                      className={`py-2 px-2 rounded-lg text-xs font-label font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        wavelength === mode
                          ? 'bg-white text-slate-950 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {wavelengthSpecs[mode].nm} · {wavelengthSpecs[mode].label.replace('LED ', '')}
                    </motion.button>
                  ))}
                </div>

                <div className="border border-slate-200 rounded-xl bg-slate-50 p-3">
                  <svg
                    viewBox="0 0 360 185"
                    className="w-full h-44"
                    role="img"
                    aria-label="Penampang kedalaman penetrasi cahaya PPG optik pada kulit"
                  >
                    <rect x="115" y="6" width="130" height="22" rx="4" fill="#0F172A" />
                    <rect x="145" y="24" width="22" height="6" rx="1" fill={wSpec.beamColor} />
                    <rect x="193" y="24" width="22" height="6" rx="1" fill="#334155" />
                    <text x="156" y="19" fill="#F8FAFC" fontSize="8" textAnchor="middle">
                      LED ({wSpec.nm})
                    </text>
                    <text x="204" y="19" fill="#94A3B8" fontSize="8" textAnchor="middle">
                      Fotodioda
                    </text>

                    <rect x="15" y="34" width="330" height="24" fill="#FDE68A" opacity="0.6" />
                    <text x="24" y="49" fill="#78350F" fontSize="9" fontWeight="600">
                      Epidermis (Filter Melanin)
                    </text>

                    <rect x="15" y="58" width="330" height="52" fill="#FECDD3" opacity="0.55" />
                    <text x="24" y="75" fill="#881337" fontSize="9" fontWeight="600">
                      Dermis &amp; Kapiler (Target 525 nm)
                    </text>
                    <circle cx="155" cy="84" r="5" fill="#E11D48" opacity="0.7" />
                    <circle cx="180" cy="88" r="6" fill="#E11D48" opacity="0.7" />
                    <circle cx="205" cy="83" r="5" fill="#E11D48" opacity="0.7" />

                    <rect x="15" y="110" width="330" height="60" fill="#E2E8F0" opacity="0.65" />
                    <text x="24" y="128" fill="#334155" fontSize="9" fontWeight="600">
                      Arteriol Dalam (Target 660 / 940 nm)
                    </text>
                    <path
                      d="M 40 148 Q 180 138 320 148"
                      stroke="#DC2626"
                      strokeWidth="6"
                      fill="none"
                      opacity="0.75"
                    />

                    <path
                      d={`M 156 30 Q 180 ${30 + wSpec.depthPx} 204 30`}
                      stroke={wSpec.beamColor}
                      strokeWidth="3"
                      strokeDasharray="4 3"
                      fill="none"
                    />
                  </svg>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-label text-slate-700">
                    <span>{wSpec.penetration}</span>
                    <span className="font-mono text-teal-700 font-semibold">{wSpec.nm}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{wSpec.physicsNote}</p>
                </div>
              </div>
            )}

            {activeSystemId === 'system_b' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-950 font-display">
                    Waktu Listrik QRS vs Gelombang Nadi Mekanik
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mengapa puncak R ECG dada selalu mendahului gelombang PPG tangan sekitar 150–250
                    ms.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl bg-slate-50 p-4">
                  <svg
                    viewBox="0 0 340 165"
                    className="w-full h-40"
                    role="img"
                    aria-label="Diagram Pulse Transit Time antara ECG dan PPG"
                  >
                    <text x="8" y="20" fontSize="9" fill="#0F172A" fontWeight="600">
                      Sistem B: ECG Sternum (mV)
                    </text>
                    <path
                      d="M 10 52 L 60 52 Q 70 42 80 52 L 95 52 L 102 60 L 110 18 L 118 65 L 125 52 L 155 52 Q 175 36 195 52 L 325 52"
                      stroke="#0284C7"
                      strokeWidth="2.5"
                      fill="none"
                    />

                    <line x1="110" y1="18" x2="110" y2="148" stroke="#94A3B8" strokeDasharray="3 3" />
                    <line x1="175" y1="68" x2="175" y2="148" stroke="#94A3B8" strokeDasharray="3 3" />
                    <rect x="110" y="72" width="65" height="16" rx="3" fill="#CCFBF1" />
                    <text
                      x="142"
                      y="83"
                      fontSize="8"
                      fill="#0F766E"
                      textAnchor="middle"
                      fontWeight="600"
                    >
                      PTT ~190 ms
                    </text>

                    <text x="8" y="106" fontSize="9" fill="#0F172A" fontWeight="600">
                      Sistem A: PPG Pergelangan (Optik)
                    </text>
                    <path
                      d="M 10 145 L 130 145 Q 155 145 175 104 Q 192 128 205 122 Q 225 144 265 145 L 325 145"
                      stroke="#0D9488"
                      strokeWidth="2.5"
                      fill="none"
                    />
                  </svg>
                </div>

                <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <p>
                    <strong className="font-label text-slate-900">Pulse Transit Time (PTT):</strong>{' '}
                    Depolarisasi listrik ventrikel (puncak R) terjadi seketika, sedangkan gelombang
                    tekanan darah memerlukan 150–250 ms untuk merambat ke arteri radialis pergelangan
                    tangan.
                  </p>
                  <p>
                    <strong className="font-label text-slate-900">Manfaat Klinis:</strong> Kombinasi
                    ECG dada + PPG tangan memungkinkan estimasi kekakuan arteri dan HRV RMSSD yang
                    jauh lebih presisi.
                  </p>
                </div>
              </div>
            )}

            {activeSystemId === 'system_c' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-950 font-display">
                    Pembatalan Artefak Gerak Adaptif Berbasis IMU
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Bagaimana akselerometer 3-sumbu memisahkan irama ayunan lengan dari detak jantung
                    asli.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl bg-slate-50 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-label">
                    <span className="text-rose-700 font-semibold">PPG Mentah + Ayunan Lengan</span>
                    <span className="text-slate-500">Puncak Gerak ~2,8 Hz</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden flex">
                    <div className="bg-rose-500 w-[62%]" />
                    <div className="bg-teal-600 w-[38%]" />
                  </div>

                  <div className="flex items-center justify-between text-xs font-label pt-1">
                    <span className="text-amber-700 font-semibold">Referensi IMU 3-Sumbu</span>
                    <span className="text-slate-500">Mengisolasi Harmonik 2,8 Hz</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="bg-amber-500 w-[62%] h-full" />
                  </div>

                  <div className="flex items-center justify-between text-xs font-label pt-1">
                    <span className="text-teal-700 font-semibold">Sinyal Nadi Bersih (LMS)</span>
                    <span className="text-slate-500">Detak Asli 145 BPM</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div className="bg-teal-600 w-[92%] h-full" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Tanpa Sistem C (IMU), ayunan lengan pelari 168 langkah/menit menggeser darah vena
                  sehingga jam pintar bisa terkecoh mengira irama langkah sebagai detak jantung
                  ("cadence lock"). Pengurangan adaptif LMS memulihkan sinyal miokardium asli.
                </p>
              </div>
            )}
          </div>
        </motion.section>
      </AnimatePresence>

      {/* 5-Stage Data Transfer & Accuracy Pipeline */}
      <section className="bg-white/95 border border-slate-200/90 rounded-2xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-xs font-label font-semibold text-teal-700">
              Alur Transfer &amp; Validasi Data Ujung-ke-Ujung
            </div>
            <h3 className="text-xl font-bold text-slate-950 mt-0.5 font-display">
              5 Tahap Pemrosesan Sinyal Hingga Tampil Akurat (Klik Setiap Tahap)
            </h3>
          </div>
          <span className="text-xs font-label text-slate-500">
            Sensor Analog → Edge DSP → BLE 5.3 → Cloud ML → EHR
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
          {DATA_PIPELINE_STAGES.map((st, idx) => {
            const active = st.id === activeStageId;
            return (
              <motion.button
                key={st.id}
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveStageId(st.id)}
                className={`text-left p-3.5 rounded-xl border transition-colors cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-label">
                  <span className={active ? 'text-[#FF6B35] font-bold' : 'text-teal-700 font-bold'}>
                    {st.stepNumber}
                  </span>
                  {idx < DATA_PIPELINE_STAGES.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 hidden sm:block text-slate-400" />
                  )}
                </div>
                <div className="text-xs font-semibold mt-1.5 leading-snug">{st.title}</div>
                <div
                  className={`text-[11px] mt-1 font-mono ${
                    active ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {st.latency}
                </div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="p-5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-2 text-xs font-label font-semibold text-teal-700">
                <Cpu className="w-4 h-4" />
                <span>
                  Tahap {activeStage.stepNumber} · {activeStage.domain}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-950 font-display">
                {activeStage.title}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">{activeStage.technicalDetail}</p>
            </div>

            <div className="space-y-3 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-label text-slate-500 flex items-center gap-1.5">
                  <Waves className="w-3.5 h-3.5 text-teal-600" />
                  Latensi Tahap
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {activeStage.latency}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-label text-slate-500 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-teal-600" />
                  Porsi Daya
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {activeStage.powerShare}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <div className="text-xs font-label font-bold text-slate-900">
                  Perlindungan Akurasi &amp; Derau
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                  {activeStage.errorMitigation}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
};
