import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, HelpCircle, Users } from 'lucide-react';
import { LITERATURE_SOURCES, POPULATION_COHORTS } from '../data/scientificContent';

const FITZPATRICK_SCALES = [
  { level: 1, label: 'Tipe I', desc: 'Kulit sangat terang', swatch: '#FDE8D7', melaninFactor: 0.0 },
  { level: 2, label: 'Tipe II', desc: 'Kulit terang', swatch: '#F6D0B1', melaninFactor: 0.12 },
  { level: 3, label: 'Tipe III', desc: 'Sawo matang muda', swatch: '#DFAC83', melaninFactor: 0.28 },
  { level: 4, label: 'Tipe IV', desc: 'Sawo matang / cokelat', swatch: '#B87C50', melaninFactor: 0.52 },
  { level: 5, label: 'Tipe V', desc: 'Cokelat gelap', swatch: '#7D4E2D', melaninFactor: 0.78 },
  { level: 6, label: 'Tipe VI', desc: 'Sangat gelap', swatch: '#452815', melaninFactor: 1.0 },
];

export const AccuracyEquityView: React.FC = () => {
  const [skinLevel, setSkinLevel] = useState<number>(3);
  const [motionPct, setMotionPct] = useState<number>(15);
  const [coldVasoconstriction, setColdVasoconstriction] = useState<boolean>(false);

  const metrics = useMemo(() => {
    const skin = FITZPATRICK_SCALES.find((s) => s.level === skinLevel) ?? FITZPATRICK_SCALES[2];
    const motionFactor = motionPct / 100;
    const coldPenalty = coldVasoconstriction ? 1.0 : 0.0;

    const snrDb = Math.max(
      4.2,
      Number((24.5 - skin.melaninFactor * 6.8 - motionFactor * 9.5 - coldPenalty * 5.2).toFixed(1))
    );
    const hrMae = Number(
      (1.6 + skin.melaninFactor * 1.9 + motionFactor * 5.4 + coldPenalty * 1.4).toFixed(1)
    );
    const spo2Bias = Number(
      (0.2 + skin.melaninFactor * 2.3 + coldPenalty * 0.9 + motionFactor * 1.1).toFixed(1)
    );
    const spo2Rmse = Number(
      (1.6 + skin.melaninFactor * 1.4 + motionFactor * 1.8 + coldPenalty * 1.1).toFixed(1)
    );

    const meetsFda = spo2Rmse <= 3.0;
    const occultRisk =
      spo2Bias >= 2.0 ? 'Risiko Hipoksemia Tersembunyi Tinggi' : 'Bias Sistematis Rendah';

    return { skin, snrDb, hrMae, spo2Bias, spo2Rmse, meetsFda, occultRisk };
  }, [skinLevel, motionPct, coldVasoconstriction]);

  const accuracyCitations = LITERATURE_SOURCES.filter((s) => s.topic === 'Populasi & Akurasi');

  return (
    <div className="space-y-8">
      {/* Expressive Header with Health Gradient */}
      <section className="rounded-2xl bg-gradient-to-br from-[#0B1219] via-[#0F1E2A] to-[#0D2B2E] text-white p-6 sm:p-7 border border-slate-800">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-label font-semibold text-[#5EEAD4]">
            Cakupan Populasi &amp; Validasi Akurasi · Bukti Ilmiah 2021–2026
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
            Apakah Wearable Akurat untuk Semua Populasi? Seberapa Besar Akurasinya?
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Akurasi wearable bukanlah angka tunggal yang statis—nilainya dipengaruhi oleh lokasi
            sensor, pigmentasi kulit (serapan melanin terhadap cahaya optik), intensitas gerak,
            perfusi pembuluh tepi, serta apakah algoritma dikalibrasi pada populasi anak, lansia,
            dan beragam warna kulit.
          </p>
        </div>
      </section>

      {/* Interactive Optical Bias & Accuracy Simulator */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-6 bg-white/95 border border-slate-200/90 rounded-2xl p-6 space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-950 font-display">
              Eksplorasi Interaktif Bias Optik &amp; Akurasi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ubah warna kulit subjek, intensitas gerak lengan, dan suhu dingin untuk menguji
              keandalan sinyal PPG optik.
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-label font-bold text-slate-900">
                1. Pigmentasi Kulit (Skala Fitzpatrick)
              </span>
              <span className="font-label font-semibold text-teal-700">
                {metrics.skin.label} · {metrics.skin.desc}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {FITZPATRICK_SCALES.map((item) => (
                <motion.button
                  key={item.level}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ y: -2 }}
                  onClick={() => setSkinLevel(item.level)}
                  className={`p-2 rounded-xl border text-center transition-colors cursor-pointer ${
                    skinLevel === item.level
                      ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="block w-6 h-6 rounded-full mx-auto border border-black/15"
                    style={{ backgroundColor: item.swatch }}
                  />
                  <span className="block text-[11px] font-label font-semibold mt-1.5">
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="motion-slider" className="font-label font-bold text-slate-900">
                2. Intensitas Gerakan Lengan / Olahraga
              </label>
              <span className="font-label font-semibold text-slate-700">
                <span className="font-mono tabular-nums">{motionPct}%</span> (
                {motionPct < 25 ? 'Istirahat' : motionPct < 65 ? 'Jalan Kaki' : 'Lari Cepat'})
              </span>
            </div>
            <input
              id="motion-slider"
              type="range"
              min={0}
              max={100}
              step={5}
              value={motionPct}
              onChange={(e) => setMotionPct(Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <div className="text-xs font-label font-bold text-slate-900">
                3. Lingkungan Dingin / Perfusi Perifer Lemah
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Mensimulasikan penyempitan pembuluh darah (vasokonstriksi) yang mengecilkan sinyal AC.
              </p>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setColdVasoconstriction((c) => !c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-label font-semibold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                coldVasoconstriction
                  ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {coldVasoconstriction ? 'Dingin (Konstriksi)' : 'Hangat (Perfusi Baik)'}
            </motion.button>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white/95 border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between space-y-5 shadow-xs">
          <div>
            <div className="text-xs font-label text-slate-500">
              Estimasi Performa Sinyal PPG Optik
            </div>
            <h3 className="text-base font-bold text-slate-950 mt-0.5 font-display">
              Kualitas Sinyal &amp; Evaluasi Batas Toleransi Klinis
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-label font-semibold text-slate-600">
                Signal-to-Noise Ratio (SNR)
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-950 mt-1">
                {metrics.snrDb}{' '}
                <span className="text-xs font-label font-normal text-slate-500">dB</span>
              </div>
              <div className="text-xs font-label text-slate-500 mt-1">
                {metrics.snrDb > 14 ? 'Gelombang jernih' : 'Berderau · butuh bantuan IMU/ECG'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-label font-semibold text-slate-600">
                Rata-Rata Galat Detak Jantung
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-950 mt-1">
                ±{metrics.hrMae}{' '}
                <span className="text-xs font-label font-normal text-slate-500">BPM</span>
              </div>
              <div className="text-xs font-label text-slate-500 mt-1">
                {metrics.hrMae <= 3.5 ? 'Setara standar klinis' : 'Pergeseran akibat gerak/perfusi'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-label font-semibold text-slate-600">
                Bias Pembacaan SpO₂ Berlebih
              </div>
              <div
                className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
                  metrics.spo2Bias >= 2.0 ? 'text-amber-700' : 'text-slate-950'
                }`}
              >
                +{metrics.spo2Bias}%
              </div>
              <div className="text-xs font-label text-slate-500 mt-1">{metrics.occultRisk}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs font-label font-semibold text-slate-600">
                Galat RMSE SpO₂
              </div>
              <div
                className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
                  metrics.meetsFda ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {metrics.spo2Rmse}%
              </div>
              <div className="text-xs font-label text-slate-500 mt-1">
                {metrics.meetsFda ? 'Memenuhi batas FDA ≤ 3,0%' : 'Melebihi batas FDA 3,0%'}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <strong className="font-label text-slate-900">Mengapa ini penting bagi mahasiswa:</strong>{' '}
            Melanin epidermis kuat menyerap cahaya hijau (525 nm) dan merah (660 nm). Riset Sjoding
            dkk. (NEJM) &amp; FDA 2024–2025 menemukan oksimeter yang tidak terkalibrasi cenderung
            membaca SpO₂ terlalu tinggi pada pasien berkulit gelap—menunda deteksi hipoksemia.
            Sebaliknya, ECG sternum (Sistem B) mengukur listrik jantung sehingga kebal terhadap
            perbedaan warna kulit.
          </div>
        </div>
      </section>

      {/* Population Coverage Table */}
      <section className="bg-white/95 border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-label font-semibold text-teal-700">
              <Users className="w-4 h-4" />
              <span>Generalisasi Demografis &amp; Klinis</span>
            </div>
            <h3 className="text-lg font-bold text-slate-950 mt-0.5 font-display">
              Cakupan Populasi: Kelompok Mana yang Tervalidasi &amp; Mana yang Masih Tertinggal?
            </h3>
          </div>
          <span className="text-xs font-label text-slate-500">5 Kelompok Populasi Utama</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-label font-bold text-slate-600">
                <th className="py-3 px-4">Kelompok Populasi</th>
                <th className="py-3 px-4">Akurasi Detak Jantung</th>
                <th className="py-3 px-4">Keandalan SpO₂</th>
                <th className="py-3 px-4">Celah Bukti Ilmiah</th>
                <th className="py-3 px-4">Status Validasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {POPULATION_COHORTS.map((row) => (
                <tr key={row.cohort} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 align-top">
                    <div className="font-semibold text-slate-950">{row.cohort}</div>
                    <div className="text-slate-500 mt-0.5 font-label text-xs">{row.ageOrTrait}</div>
                  </td>
                  <td className="py-3.5 px-4 align-top font-mono tabular-nums text-slate-700">
                    {row.hrAccuracy}
                  </td>
                  <td className="py-3.5 px-4 align-top text-slate-700">{row.spo2Accuracy}</td>
                  <td className="py-3.5 px-4 align-top text-slate-600 max-w-sm leading-relaxed">
                    {row.evidenceGap}
                  </td>
                  <td className="py-3.5 px-4 align-top whitespace-nowrap font-label">
                    {row.validationStatus === 'Tervalidasi' && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Tervalidasi
                      </span>
                    )}
                    {row.validationStatus === 'Bersyarat' && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Bersyarat
                      </span>
                    )}
                    {row.validationStatus === 'Kurang Terwakili' && (
                      <span className="inline-flex items-center gap-1.5 font-semibold text-rose-700">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Kurang Terwakili
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {accuracyCitations.map((cite) => (
          <div
            key={cite.id}
            className="bg-white/95 border border-slate-200/90 rounded-2xl p-4 space-y-1.5 shadow-xs"
          >
            <div className="text-xs font-label font-semibold text-teal-700">
              {cite.sourceType} · {cite.year}
            </div>
            <h4 className="text-xs font-bold text-slate-950 leading-snug">{cite.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{cite.keyFinding}</p>
            <div className="text-[11px] font-mono text-slate-400 pt-1">{cite.identifier}</div>
          </div>
        ))}
      </section>
    </div>
  );
};
