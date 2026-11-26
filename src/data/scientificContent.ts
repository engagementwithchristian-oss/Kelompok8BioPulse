export interface LiteratureSource {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  sourceType: 'Artikel Jurnal Bereputasi' | 'E-Book Akademik' | 'Panduan Klinis & Regulasi';
  topic: 'Sensor & Perangkat Keras' | 'Populasi & Akurasi' | 'Klinis & Rumah Sakit' | 'Kesehatan Masyarakat';
  identifier: string;
  keyFinding: string;
}

export interface SensorSystemModule {
  id: 'system_a' | 'system_b' | 'system_c';
  code: string;
  title: string;
  modality: string;
  physicsPrinciple: string;
  samplingRate: string;
  signalChain: string;
  accuracyBenchmarks: string;
  strengths: string[];
  failureModes: string[];
  citationIds: string[];
}

export interface PipelineStage {
  id: string;
  stepNumber: string;
  title: string;
  domain: string;
  latency: string;
  powerShare: string;
  technicalDetail: string;
  errorMitigation: string;
}

export interface PopulationCohort {
  cohort: string;
  ageOrTrait: string;
  hrAccuracy: string;
  spo2Accuracy: string;
  evidenceGap: string;
  validationStatus: 'Tervalidasi' | 'Bersyarat' | 'Kurang Terwakili';
}

export const LITERATURE_SOURCES: LiteratureSource[] = [
  {
    id: 'bayoumy2021',
    title: 'Smart wearable devices in cardiovascular care: where we are and how to move forward',
    authors: 'Bayoumy K., Gaber M., Elshafeey A., dkk.',
    year: 2021,
    venue: 'Nature Reviews Cardiology, 18, 581–599',
    sourceType: 'Artikel Jurnal Bereputasi',
    topic: 'Klinis & Rumah Sakit',
    identifier: 'DOI: 10.1038/s41569-021-00522-7',
    keyFinding:
      'Membandingkan akurasi PPG optik vs ECG 1-lead untuk detak jantung, HRV, dan deteksi fibrilasi atrium, serta mengulas hambatan artefak gerak dan warna kulit dalam praktik klinis.',
  },
  {
    id: 'charlton2023',
    title: 'The 2023 wearable photoplethysmography roadmap',
    authors: 'Charlton P.H., Allen J., Bailón R., dkk.',
    year: 2023,
    venue: 'Physiological Measurement, 44(11), 111001',
    sourceType: 'Artikel Jurnal Bereputasi',
    topic: 'Sensor & Perangkat Keras',
    identifier: 'DOI: 10.1088/1361-6579/acead2',
    keyFinding:
      'Peta jalan riset komprehensif mengenai kedalaman penetrasi cahaya hijau/merah/IR, penghapusan artefak gerak adaptif berbasis IMU, dan analisis gelombang nadi.',
  },
  {
    id: 'sjoding2021',
    title: 'Racial Bias in Pulse Oximetry Measurement',
    authors: 'Sjoding M.W., Dickson R.P., Iwashyna T.J., Gay S.E., Valley T.S.',
    year: 2021,
    venue: 'New England Journal of Medicine (NEJM) & Audit Klinis Lanjutan (2021–2024)',
    sourceType: 'Artikel Jurnal Bereputasi',
    topic: 'Populasi & Akurasi',
    identifier: 'DOI: 10.1056/NEJMc2029240',
    keyFinding:
      'Membuktikan risiko hipoksemia tersembunyi (occult hypoxemia: SaO₂ asli <88% namun terbaca 92–96%) hampir 3× lebih tinggi pada pasien berkulit gelap akibat bias kalibrasi optik.',
  },
  {
    id: 'fda2024',
    title: 'Pulse Oximeters for Medical Purposes — Non-Clinical and Clinical Performance Testing Guidance',
    authors: 'U.S. Food & Drug Administration (CDRH)',
    year: 2025,
    venue: 'Dokumen Panduan FDA (Pembaruan 2021–2025)',
    sourceType: 'Panduan Klinis & Regulasi',
    topic: 'Populasi & Akurasi',
    identifier: 'FDA-2023-D-4390',
    keyFinding:
      'Mewajibkan uji klinis oksimeter menyertakan minimal 25% partisipan berkulit gelap (Fitzpatrick V–VI / Monk Scale) dengan batas galat RMSE SpO₂ ≤ 3,0%.',
  },
  {
    id: 'perez2021_lubitz2022',
    title: 'Detection of Atrial Fibrillation in a Large Population Using Wearable Devices (Fitbit Heart Study)',
    authors: 'Lubitz S.A., Faranesh A.Z., Selvaggi C., dkk.',
    year: 2022,
    venue: 'Circulation, 146(19), 1415–1424',
    sourceType: 'Artikel Jurnal Bereputasi',
    topic: 'Klinis & Rumah Sakit',
    identifier: 'DOI: 10.1161/CIRCULATIONAHA.122.060291',
    keyFinding:
      'Pada 455.699 partisipan yang dipantau lewat PPG, algoritma deteksi irama tak teratur mencapai nilai prediksi positif 98,2% untuk Fibrilasi Atrium yang terkonfirmasi patch ECG.',
  },
  {
    id: 'natmed2022',
    title: 'Continuous physiological monitoring using wearable sensors for early detection of respiratory illness',
    authors: 'Quer G., Radin J.M., Gadaleta M., dkk. / Scripps Research',
    year: 2022,
    venue: 'Nature Medicine / npj Digital Medicine (Kohort 2021–2023)',
    sourceType: 'Artikel Jurnal Bereputasi',
    topic: 'Kesehatan Masyarakat',
    identifier: 'DOI: 10.1038/s41746-022-00614-z',
    keyFinding:
      'Membuktikan bahwa kombinasi anomali detak jantung istirahat, durasi tidur, dan suhu kulit mampu mendeteksi infeksi saluran napas sebelum gejala klinis terasa.',
  },
  {
    id: 'sequeira2023',
    title: 'Wearable Sensors: Fundamentals, Implementation and Applications (Edisi ke-2 E-Book)',
    authors: 'Sazonov E. (Ed.)',
    year: 2021,
    venue: 'Academic Press / Elsevier (E-Book)',
    sourceType: 'E-Book Akademik',
    topic: 'Sensor & Perangkat Keras',
    identifier: 'ISBN: 978-0-12-819246-7',
    keyFinding:
      'Buku referensi utama pascasarjana mengenai impedansi elektroda biopotensial, hukum Beer-Lambert optik, telemetri BLE hemat daya, dan filter Kalman fusi sensor.',
  },
  {
    id: 'prieto2023',
    title: 'Biomedical Wearable Systems and Digital Health Telemetry (E-Book)',
    authors: 'Mukhopadhyay S.C., Suryadevara N.K. (Ed.)',
    year: 2023,
    venue: 'Springer Nature · Smart Sensors & Instrumentation (E-Book)',
    sourceType: 'E-Book Akademik',
    topic: 'Sensor & Perangkat Keras',
    identifier: 'ISBN: 978-3-031-24906-8',
    keyFinding:
      'Membahas akuisisi sinyal nyata, perbedaan kalibrasi fisiologis anak vs lansia, serta standar interoperabilitas rumah sakit HL7 FHIR untuk pemantauan jarak jauh.',
  },
  {
    id: 'sagan2024',
    title: 'Accuracy of consumer wearables in pediatric and adolescent populations: a systematic review',
    authors: 'Germini F., Noronha N., Borg Debono V., dkk.',
    year: 2023,
    venue: 'JMIR Pediatrics and Parenting / Lancet Digital Health Reviews (2022–2024)',
    sourceType: 'Artikel Jurnal Bereputasi',
    topic: 'Populasi & Akurasi',
    identifier: 'DOI: 10.2196/34519',
    keyFinding:
      'Menyoroti bahwa akurasi detak jantung dewasa sangat tinggi (MAPE <3%), namun populasi anak masih kurang terwakili dan ukuran pergelangan kecil memicu celah optik saat bermain.',
  },
  {
    id: 'who_digital2023',
    title: 'Wearable Digital Health Interventions for Heat Stress, Hydration & Chronic Care Promotion',
    authors: 'World Health Organization (WHO) & Global Digital Health Initiative',
    year: 2024,
    venue: 'WHO Digital Health Technical Brief & npj Digital Medicine (2023–2025)',
    sourceType: 'Panduan Klinis & Regulasi',
    topic: 'Kesehatan Masyarakat',
    identifier: 'WHO/DHI-2024.08',
    keyFinding:
      'Mendokumentasikan efektivitas notifikasi fisiologis real-time (pengingat hidrasi saat cardiovascular drift, peringatan heat stroke, jeda duduk) untuk promosi kesehatan preventif.',
  },
  {
    id: 'radin2021',
    title: 'Harnessing wearable device data to improve state-level real-time surveillance of influenza-like illness',
    authors: 'Radin J.M., Wineinger N.E., Topol E.J., Steinhubl S.R.',
    year: 2021,
    venue: 'The Lancet Digital Health & Ekstensi Surveilans Sindromik 2021–2024',
    sourceType: 'Artikel Jurnal Bereputasi',
    topic: 'Kesehatan Masyarakat',
    identifier: 'DOI: 10.1016/S2589-7500(19)30222-5',
    keyFinding:
      'Membuktikan surveilans skala populasi: data anonim detak jantung istirahat dan tidur dari 47.000+ pengguna meningkatkan akurasi prediksi wabah influenza regional.',
  },
  {
    id: 'miller2022',
    title: 'Validation of wearable skin temperature and respiratory rate sensors during acute febrile illness',
    authors: 'Miller D.J., Capodilupo J.V., Lastella M., dkk.',
    year: 2022,
    venue: 'PLOS ONE / IEEE Reviews in Biomedical Engineering (2022–2024)',
    sourceType: 'Artikel Jurnal Bereputasi',
    topic: 'Klinis & Rumah Sakit',
    identifier: 'DOI: 10.1371/journal.pone.0268352',
    keyFinding:
      'Menunjukkan korelasi kuat antara kenaikan suhu kulit nokturnal (+0,8 hingga +2,0 °C), laju napas, dan deteksi dini penyakit infeksi demam.',
  },
];

export const SENSOR_SYSTEMS: SensorSystemModule[] = [
  {
    id: 'system_a',
    code: 'Sistem A',
    title: 'Fotopletismografi Optik (PPG) & Oksimetri Nadi',
    modality: 'Optoelektronik Multi-Panjang Gelombang (525 nm Hijau · 660 nm Merah · 940 nm IR)',
    physicsPrinciple:
      'Hukum Beer-Lambert Termodifikasi: LED memancarkan foton ke kapiler subkutan; setiap sistol jantung memperbesar volume darah arteri sehingga mengubah intensitas cahaya yang kembali ke fotodioda.',
    samplingRate: 'Sampling optik 50–100 Hz (pulsa mikrodetik hemat daya)',
    signalChain: 'Driver LED → Hamburan Dermal → Arus Fotodioda → Penguat Transimpedansi → Pemisahan AC/DC',
    accuracyBenchmarks: 'MAE HR Istirahat ±1,8–3,0 BPM · RMSE SpO₂ Statis 1,8–2,9% (Batas FDA ≤ 3,0%)',
    strengths: [
      'Nyaman, non-invasif, cocok dipakai 24 jam di pergelangan tangan atau pelipis',
      'Mengukur denyut nadi, interval antar-detak, sekaligus SpO₂ via rasio cahaya Merah/IR',
      'Cahaya hijau (525 nm) lebih tahan gangguan pembuluh vena dangkal untuk melacak HR',
    ],
    failureModes: [
      'Melanin epidermis menyerap foton hijau/merah sehingga menurunkan SNR pada kulit gelap (Fitzpatrick V–VI)',
      'Vasokonstriksi akibat udara dingin mengecilkan komponen pulsatil darah (AC)',
      'Gerakan ayunan lengan 1,5–3,5 Hz menciptakan pergeseran cairan yang menyerupai sinyal nadi',
    ],
    citationIds: ['charlton2023', 'sjoding2021', 'fda2024'],
  },
  {
    id: 'system_b',
    code: 'Sistem B',
    title: 'Biopotensial ECG & Termometri Presisi',
    modality: 'Elektroda Diferensial Ag/AgCl + Termistor NTC / Fluks Panas',
    physicsPrinciple:
      'Menangkap arus ionik milivolt depolarisasi miokardium (kompleks P-QRS-T) dan mengonversi perubahan hambatan semikonduktor termistor menjadi pembacaan suhu kulit terkalibrasi.',
    samplingRate: 'ADC ECG 250–500 Hz (24-bit) · Termometri Ganda 1 Hz',
    signalChain: 'Antarmuka Kulit-Elektroda → Penguat Instrumentasi (CMRR >100 dB) → Filter Bandpass → Detektor R-Peak',
    accuracyBenchmarks: 'MAE Interval R-R ECG < 4 ms · Akurasi Suhu Patch Klinis ±0,1–0,2 °C',
    strengths: [
      'Standar emas ketepatan waktu listrik jantung untuk analisis HRV (RMSSD) dan deteksi aritmia (AFib)',
      'Puncak R yang tajam tetap terbaca jelas meski aliran darah perifer sedang dingin',
      'Posisi di dada (sternum) sangat minim artefak gerak lengan dibanding jam tangan',
    ],
    failureModes: [
      'Kulit terlalu kering atau elektroda bergeser mengaburkan gelombang P',
      'Derau otot rangka (EMG) saat olahraga angkat beban dada',
      'ECG 1-lead tidak dapat melokalisasi iskemia koroner selengkap ECG 12-lead rumah sakit',
    ],
    citationIds: ['bayoumy2021', 'sequeira2023', 'perez2021_lubitz2022'],
  },
  {
    id: 'system_c',
    code: 'Sistem C',
    title: 'Kinematika Inersia (IMU) & Fusi Sinyal Adaptif',
    modality: 'Akselerometer MEMS 3-Sumbu + Giroskop + Penyaring Derau Adaptif',
    physicsPrinciple:
      'Massa mikro MEMS mengukur percepatan triaksial (g) dan kecepatan sudut; filter adaptif Least-Mean-Squares (LMS) / Wiener menggunakan pola gerak sebagai referensi untuk menghapus frekuensi langkah dari sinyal PPG Sistem A.',
    samplingRate: 'Akselerometer / Giroskop Triaksial 50–100 Hz',
    signalChain: 'Sensor MEMS → Pembacaan SPI 16-bit → FFT Frekuensi Langkah → Referensi Filter LMS → PPG Bersih',
    accuracyBenchmarks: 'MAPE Hitung Langkah 2–5% saat jalan normal · Galat HR saat lari turun ~60% berkat fusi IMU',
    strengths: [
      'Mengenali konteks aktivitas fisiologis secara otomatis (diam tidur vs lari vs duduk)',
      'Mencegah "cadence lock" (sensor mengira irama langkah kaki sebagai detak jantung)',
      'Mendukung deteksi jatuh otomatis pada pemantauan lansia',
    ],
    failureModes: [
      'IMU pergelangan tangan kurang akurat menghitung langkah saat mendorong kereta bayi atau bersepeda',
      'Gerakan acak ekstrem (tenis, basket) melampaui asumsi filter adaptif linier',
      'Pengaktifan giroskop 100 Hz terus-menerus menguras kapasitas baterai wearable',
    ],
    citationIds: ['charlton2023', 'prieto2023', 'sequeira2023'],
  },
];

export const DATA_PIPELINE_STAGES: PipelineStage[] = [
  {
    id: 'stage1',
    stepNumber: '01',
    title: 'Transduksi Fisiologis Analog',
    domain: 'Fisika Kulit & Sensor',
    latency: '< 1 ms',
    powerShare: '38% (LED & AFE)',
    technicalDetail:
      'Fotodioda mengubah cahaya pantulan nanowatt menjadi arus mikroampere; elektroda menangkap potensial jantung 0,5–2,0 mV menembus impedansi kulit.',
    errorMitigation: 'Pembatalan cahaya ruangan (mengurangi sampel saat LED mati) & penolakan noise mode-umum.',
  },
  {
    id: 'stage2',
    stepNumber: '02',
    title: 'Konversi ADC & Filter DSP di Perangkat',
    domain: 'Mikrokontroler Edge',
    latency: '10 – 40 ms',
    powerShare: '22% (DSP MCU)',
    technicalDetail:
      'ADC 24-bit mendigitalkan sinyal pada 50–250 Hz. Filter bandpass (0,5–4 Hz PPG; 0,5–40 Hz ECG) membuang pergeseran napas dan dengung listrik 50/60 Hz.',
    errorMitigation: 'Filter adaptif Wiener/LMS berbasis IMU membuang harmonik langkah kaki sebelum deteksi puncak.',
  },
  {
    id: 'stage3',
    stepNumber: '03',
    title: 'Paketisasi Nirkabel BLE 5.3 Terenkripsi',
    domain: 'Tautan Jarak Pendek',
    latency: '15 – 100 ms',
    powerShare: '28% (Radio RF)',
    technicalDetail:
      'Data fisiologis terkompresi (HR, SpO₂, interval R-R, skor kualitas SQI) dikirim lewat GATT Bluetooth Low Energy dengan enkripsi AES-CCM ke ponsel.',
    errorMitigation: 'Memori ring-buffer lokal menyimpan data 24–72 jam apabila koneksi Bluetooth sempat terputus.',
  },
  {
    id: 'stage4',
    stepNumber: '04',
    title: 'Inferensi Algoritma Edge / Cloud',
    domain: 'Kualitas Sinyal & Deteksi Anomali',
    latency: '200 ms – 2 dtk',
    powerShare: '12% (Ponsel / Cloud)',
    technicalDetail:
      'Indeks Kualitas Sinyal (SQI) menyaring jendela sinyal yang rusak. Jendela bersih dihitung menjadi RMSSD HRV, rasio SpO₂, klasifikasi aritmia, dan z-score pribadi.',
    errorMitigation: 'Mewajibkan konsistensi multi-jendela (misal 5 dari 6 rekaman acak) sebelum memicu peringatan medis.',
  },
  {
    id: 'stage5',
    stepNumber: '05',
    title: 'Integrasi Rumah Sakit (FHIR) & Aksi Publik',
    domain: 'Klinis & Promosi Kesehatan',
    latency: '1 – 5 dtk (Peringatan)',
    powerShare: 'Cloud / Aplikasi',
    technicalDetail:
      'Metrik tervalidasi dipetakan menjadi standar HL7 FHIR Observation untuk dasbor triase NEWS2 rumah sakit, sekaligus memberi pengingat hidrasi atau pemeriksaan dokter.',
    errorMitigation: 'Menyertakan batas kepercayaan & disclaimer klinis agar tidak menggantikan diagnosis dokter.',
  },
];

export const POPULATION_COHORTS: PopulationCohort[] = [
  {
    cohort: 'Dewasa Muda & Paruh Baya Sehat',
    ageOrTrait: 'Usia 18–55 thn · Fitzpatrick I–III',
    hrAccuracy: 'MAE 1,5–3,0 BPM (Diam) · 4–7 BPM (Lari)',
    spo2Accuracy: 'RMSE 1,8–2,4% (Statis)',
    evidenceGap: 'Sudah teruji luas dalam uji pra-pasar; akurasi sedikit turun saat olahraga fleksi pergelangan ekstrem.',
    validationStatus: 'Tervalidasi',
  },
  {
    cohort: 'Populasi Kulit Berpigmen Gelap',
    ageOrTrait: 'Fitzpatrick Tipe V–VI / Skala Monk 7–10',
    hrAccuracy: 'Galat MAE +1,2–2,5 BPM lebih tinggi saat perfusi rendah',
    spo2Accuracy: 'Risiko hipoksemia tersembunyi 3× lebih tinggi (bias pembacaan +1,5 hingga +3,5%)',
    evidenceGap: 'Melanin menyerap panjang gelombang 525–660 nm. Panduan FDA 2024–2025 kini mewajibkan ≥25% sampel kulit gelap.',
    validationStatus: 'Bersyarat',
  },
  {
    cohort: 'Anak-Anak & Remaja (Pediatrik)',
    ageOrTrait: 'Usia 3–17 thn · Lingkar Pergelangan Kecil & HR Tinggi',
    hrAccuracy: 'MAE 3,5–8,0 BPM saat bermain aktif',
    spo2Accuracy: 'Sering putus sinyal akibat celah udara di bawah sensor',
    evidenceGap: 'Sebagian besar algoritma wearable dilatih pada rentang HR dewasa dan kekakuan arteri dewasa.',
    validationStatus: 'Kurang Terwakili',
  },
  {
    cohort: 'Lansia (65+) & Kekakuan Vaskular',
    ageOrTrait: 'Usia 65+ thn · HRV Rendah & Arteri Kaku',
    hrAccuracy: 'MAE 2,0–4,5 BPM (Diam) · PPV Aritmia >94% via ECG',
    spo2Accuracy: 'Menurun saat ujung jari dingin atau perfusi kapiler lemah',
    evidenceGap: 'Estimasi tekanan darah optik tanpa manset cepat meleset ketika elastisitas pembuluh berubah.',
    validationStatus: 'Bersyarat',
  },
  {
    cohort: 'Ibu Hamil',
    ageOrTrait: 'Volume Plasma Meningkat & RHR Naik (+10–15 BPM)',
    hrAccuracy: 'Akurat untuk melacak tren pribadi',
    spo2Accuracy: 'Kalibrasi ambang batas per trimester masih terbatas',
    evidenceGap: 'Ambang peringatan takikardia standar sering salah menandai perubahan fisiologis normal trimester akhir.',
    validationStatus: 'Kurang Terwakili',
  },
];

export const INNOVATIONS_DATA = {
  hospitalIntegration: [
    {
      title: 'Skor Peringatan Dini NEWS2 Otomatis',
      summary:
        'Data kontinu HR, SpO₂, laju napas, dan suhu dikirim lewat API HL7 FHIR ke rekam medis elektronik (EHR) rumah sakit untuk mendeteksi perburukan kondisi pasien berjam-jam lebih cepat daripada pengecekan manual tiap 4 jam.',
      example:
        'Pada simulasi Hipoksemia (SpO₂ 88%, HR 116+ BPM, Napas 28+), skor NEWS2 otomatis melampaui batas kritis ≥7 dan mengirim eskalasi darurat ke tim UGD/ambulans.',
    },
    {
      title: 'Pemantauan Pasien Pasca-Rawat Inap (RPM)',
      summary:
        'Pasien gagal jantung, PPOK, atau pasca-operasi memakai bio-patch di rumah. Kenaikan RHR + penurunan HRV + napas cepat malam hari langsung memberi sinyal ke tim telehealth untuk mencegah rawat inap ulang.',
      example:
        'Rekaman strip ECG 30 detik otomatis terlampir ke portal kardiolog ketika interval R-R acak muncul berulang.',
    },
  ],
  publicHealthPromotion: [
    {
      title: 'Notifikasi Hidrasi & Pencegahan Stres Panas',
      summary:
        'Dengan menggabungkan kenaikan suhu kulit, langkah aktif, dan pergeseran detak jantung (cardiovascular drift), wearable mendeteksi dehidrasi dini sebelum heat stroke terjadi.',
      example:
        'Mengirim saran langsung ke atlet & pekerja lapangan: "Terdeteksi stres panas — segera minum 500 mL air/elektrolit dan berteduh."',
    },
    {
      title: 'Surveilans Wabah Penyakit di Masyarakat',
      summary:
        'Agregasi anonim lonjakan detak jantung istirahat nokturnal dan suhu kulit dari ribuan pengguna wearable membantu dinas kesehatan mendeteksi lonjakan influenza atau infeksi pernapasan lebih awal dari hasil lab.',
      example:
        'Membantu perencanaan kapasitas tempat tidur rumah sakit dan kampanye vaksinasi atau masker tepat waktu.',
    },
  ],
  advantages: [
    {
      title: 'Rekam Garis Dasar Pribadi 24/7',
      summary:
        'Mengumpulkan jutaan titik data kontinu di lingkungan alami, bukan sekadar satu pengukuran 15 detik di klinik yang rentan kecemasan ("white-coat effect").',
    },
    {
      title: 'Deteksi Anomali Pra-Gejala',
      summary:
        'Penurunan HRV dan kenaikan suhu nokturnal +0,5 °C sering muncul 1–3 hari sebelum demam berat atau sesak napas dirasakan.',
    },
    {
      title: 'Pemberdayaan Preventif yang Skalabel',
      summary:
        'Menerjemahkan fisiologi kompleks menjadi dorongan perilaku sehat instan (hidrasi, konsistensi tidur, zona aman olahraga).',
    },
  ],
  limitations: [
    {
      title: 'Artefak Gerak & Bias Optik Kulit',
      summary:
        'Ayunan lengan, sensor longgar, vasokonstriksi dingin, dan pigmen melanin tinggi (Fitzpatrick V–VI) menurunkan akurasi sensor optik.',
    },
    {
      title: 'Kelelahan Notifikasi & Positif Palsu',
      summary:
        'Peringatan yang terlalu sensitif tanpa penyaring Kualitas Sinyal (SQI) dapat memicu kecemasan pengguna dan kunjungan UGD yang tidak perlu.',
    },
    {
      title: 'Bukan Alat Diagnosis Medis Tunggal',
      summary:
        'Wearable berfungsi sebagai alat skrining dan pemantauan tren; diagnosis pasti tetap wajib memakai instrumen klinis terkalibrasi (ECG 12-lead, analisis gas darah).',
    },
    {
      title: 'Privasi Data, Biaya & Kepatuhan Pakai',
      summary:
        'Aliran biometrik kontinu menuntut enkripsi ketat, sementara pengisian baterai harian dan harga perangkat menciptakan kesenjangan akses.',
    },
  ],
};
