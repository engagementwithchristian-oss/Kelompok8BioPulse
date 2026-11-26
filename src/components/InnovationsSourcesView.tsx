import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  AlertOctagon,
  BookOpen,
  CheckCircle2,
  Droplets,
  Hospital,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { INNOVATIONS_DATA, LITERATURE_SOURCES, LiteratureSource } from '../data/scientificContent';

type TopicFilter = 'Semua' | LiteratureSource['topic'];

export const InnovationsSourcesView: React.FC = () => {
  const [topicFilter, setTopicFilter] = useState<TopicFilter>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [simulatedAlertPreview, setSimulatedAlertPreview] = useState<'emergency' | 'hydration'>(
    'emergency'
  );

  const filteredSources = useMemo(() => {
    return LITERATURE_SOURCES.filter((src) => {
      const matchesTopic = topicFilter === 'Semua' || src.topic === topicFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        src.title.toLowerCase().includes(q) ||
        src.authors.toLowerCase().includes(q) ||
        src.keyFinding.toLowerCase().includes(q) ||
        src.venue.toLowerCase().includes(q);
      return matchesTopic && matchesQuery;
    });
  }, [topicFilter, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Expressive Header with Health Gradient */}
      <section className="rounded-2xl bg-gradient-to-br from-[#0B1219] via-[#0F1E2A] to-[#0D2B2E] text-white p-6 sm:p-7 border border-slate-800">
        <div className="max-w-3xl space-y-2">
          <div className="text-xs font-label font-semibold text-[#5EEAD4]">
            Inovasi Klinis, Promosi Kesehatan &amp; Pustaka 5 Tahun Terakhir (2021–2026)
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
            Integrasi Rumah Sakit, Alat Promosi Kesehatan, Keunggulan &amp; Keterbatasan
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Lihat bagaimana teknologi wearable menghubungkan pemantauan individu dengan respons
            darurat rumah sakit, mendorong perilaku hidup sehat masyarakat, sekaligus memahami batas
            teknis serta etika ilmiahnya.
          </p>
        </div>
      </section>

      {/* Hospital Integration & Public Health Promotion Innovations */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-label font-semibold text-rose-700">
              <Hospital className="w-4 h-4" />
              <span>Inovasi Klinis &amp; Tanggap Darurat</span>
            </div>
            <h3 className="text-xl font-bold text-slate-950 font-display">
              Integrasi Langsung ke Rekam Medis Rumah Sakit (EHR) &amp; UGD
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INNOVATIONS_DATA.hospitalIntegration.map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <h4 className="text-xs font-bold text-slate-950 font-display">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>
                  <p className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200/70 rounded-lg p-2.5 leading-relaxed">
                    {item.example}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-label font-semibold text-teal-700">
              <Droplets className="w-4 h-4" />
              <span>Kesehatan Preventif &amp; Komunitas</span>
            </div>
            <h3 className="text-xl font-bold text-slate-950 font-display">
              Wearable sebagai Alat Promosi Kesehatan Masyarakat
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {INNOVATIONS_DATA.publicHealthPromotion.map((item) => (
                <div
                  key={item.title}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <h4 className="text-xs font-bold text-slate-950 font-display">{item.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.summary}</p>
                  <p className="text-[11px] text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5 leading-relaxed">
                    {item.example}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive HL7 FHIR / Public Health Nudge Payload Preview */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0B1219] to-[#11222C] text-slate-100 rounded-2xl p-6 flex flex-col justify-between space-y-4 border border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-label font-semibold text-[#5EEAD4]">
                Pratinjau Paket Telemetri Nyata
              </span>
              <div className="flex items-center gap-1 p-0.5 bg-slate-800 rounded-lg">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSimulatedAlertPreview('emergency')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-label font-semibold transition-colors cursor-pointer ${
                    simulatedAlertPreview === 'emergency'
                      ? 'bg-[#FF6B35] text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Eskalasi UGD
                </motion.button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSimulatedAlertPreview('hydration')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-label font-semibold transition-colors cursor-pointer ${
                    simulatedAlertPreview === 'hydration'
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Saran Hidrasi
                </motion.button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={simulatedAlertPreview}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <h3 className="text-base font-bold text-white font-display">
                  {simulatedAlertPreview === 'emergency'
                    ? 'Paket HL7 FHIR Peringatan Darurat Hipoksemia'
                    : 'Pemicu Intervensi Promosi Kesehatan Publik'}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {simulatedAlertPreview === 'emergency'
                    ? 'Saat fusi multi-sensor mengonfirmasi SpO₂ < 90% disertai takikardia dan Indeks Kualitas Sinyal bersih (SQI > 0,85), sistem mengirim paket HL7 FHIR standar ke triase rumah sakit.'
                    : 'Saat suhu kulit naik +1,5 °C disertai lonjakan detak jantung saat bergerak, perangkat otomatis memunculkan pengingat minum air sebelum terjadi heat exhaustion.'}
                </p>

                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-[11px] font-mono text-teal-300 overflow-x-auto leading-relaxed">
                  {simulatedAlertPreview === 'emergency'
                    ? `{
  "resourceType": "Observation",
  "status": "final",
  "category": "vital-signs",
  "code": "NEWS2-Eskalasi-Kritis",
  "ringkasanNilai": {
    "spo2_persen": 88,
    "detak_jantung_bpm": 116,
    "laju_napas_menit": 28,
    "indeks_kualitas_sinyal": 0.91
  },
  "tindakan": "KIRIM_PERINGATAN_TIM_UGD"
}`
                    : `{
  "interventionType": "PROMOSI_KESEHATAN_PUBLIK",
  "aturanPemicu": "Cardiovascular_Drift_v2",
  "metrik": {
    "suhu_kulit_c": 38.2,
    "lonjakan_hr_bpm": "+38 di atas dasar",
    "langkah_45mnt_terakhir": 4850
  },
  "pesanPengguna": "Peringatan Hidrasi: Minum 500 mL air/oralit dan berteduh."
}`}
                </pre>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="text-xs font-label text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-800">
            <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              Validasi Signal Quality Index (SQI) mencegah artefak gerak memicu alarm rumah sakit
              palsu.
            </span>
          </div>
        </div>
      </section>

      {/* Advantages vs Limitations Balanced Comparison */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-label font-semibold text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
            <span>Nilai Tambah &amp; Keunggulan Utama</span>
          </div>
          <h3 className="text-lg font-bold text-slate-950 font-display">
            Keunggulan Pemantauan Kesehatan Wearable
          </h3>
          <div className="space-y-3">
            {INNOVATIONS_DATA.advantages.map((adv) => (
              <div
                key={adv.title}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80"
              >
                <div className="text-xs font-label font-bold text-slate-900">{adv.title}</div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{adv.summary}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-label font-semibold text-amber-700">
            <AlertOctagon className="w-4 h-4" />
            <span>Batas Teknis &amp; Tantangan Klinis</span>
          </div>
          <h3 className="text-lg font-bold text-slate-950 font-display">
            Keterbatasan &amp; Hal yang Wajib Diwaspadai
          </h3>
          <div className="space-y-3">
            {INNOVATIONS_DATA.limitations.map((lim) => (
              <div
                key={lim.title}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80"
              >
                <div className="text-xs font-label font-bold text-slate-900">{lim.title}</div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{lim.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credible Literature & E-Books (Last 5 Years: 2021–2026) */}
      <section className="bg-white/95 border border-slate-200/90 rounded-2xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-label font-semibold text-teal-700">
              <BookOpen className="w-4 h-4" />
              <span>Basis Bukti · Artikel Jurnal Bereputasi &amp; E-Book Akademik (2021–2026)</span>
            </div>
            <h3 className="text-xl font-bold text-slate-950 mt-1 font-display">
              Referensi Ilmiah &amp; E-Book Kredibel (5 Tahun Terakhir)
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul, penulis, topik..."
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 w-full sm:w-56"
              />
            </div>

            <div className="flex flex-wrap gap-1 p-1 bg-slate-100 rounded-xl">
              {(
                [
                  'Semua',
                  'Sensor & Perangkat Keras',
                  'Populasi & Akurasi',
                  'Klinis & Rumah Sakit',
                  'Kesehatan Masyarakat',
                ] as TopicFilter[]
              ).map((topic) => (
                <motion.button
                  key={topic}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setTopicFilter(topic)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-label font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    topicFilter === topic
                      ? 'bg-white text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {topic}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSources.map((src) => (
            <motion.article
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              key={src.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-2.5"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-xs font-label text-slate-500">
                  <span className="text-teal-700 font-semibold">
                    {src.sourceType} · {src.year}
                  </span>
                  <span>{src.topic}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-950 leading-snug">{src.title}</h4>
                <div className="text-xs text-slate-600">
                  {src.authors} — <span className="italic">{src.venue}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">{src.keyFinding}</p>
              </div>
              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>{src.identifier}</span>
                <Activity className="w-3.5 h-3.5 text-teal-600" />
              </div>
            </motion.article>
          ))}
        </motion.div>

        {filteredSources.length === 0 && (
          <div className="py-10 text-center text-xs text-slate-500">
            Tidak ada literatur yang cocok dengan "{searchQuery}". Coba hapus kata kunci pencarian.
          </div>
        )}
      </section>
    </div>
  );
};
