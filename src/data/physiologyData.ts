export type SubjectId = 'adult' | 'child' | 'senior';

export type WearableSuiteId = 'wrist_ppg' | 'chest_patch' | 'full_suite';

export type ActivityStateId =
  | 'resting'
  | 'running'
  | 'sleep'
  | 'fever'
  | 'hypoxemia'
  | 'dehydration'
  | 'arrhythmia';

export type SensorNodeId = 'wrist_ppg' | 'chest_ecg' | 'temple_pod' | 'heart' | 'lungs';

export interface SubjectProfile {
  id: SubjectId;
  label: string;
  ageLabel: string;
  physiologySummary: string;
  baselineHr: number;
  baselineSpo2: number;
  baselineTemp: number;
  baselineHrv: number;
  baselineResp: number;
  maxHr: number;
  scale: [number, number, number];
  headScale: number;
  vascularTint: string;
}

export interface WearableSuite {
  id: WearableSuiteId;
  label: string;
  shortLabel: string;
  sensorsActive: string[];
  samplingSummary: string;
  description: string;
}

export interface ActivityCondition {
  id: ActivityStateId;
  category: 'activity' | 'illness';
  label: string;
  shortLabel: string;
  currentActivityText: string;
  hrDelta: number;
  spo2Target: number;
  tempDelta: number;
  hrvMultiplier: number;
  respDelta: number;
  stepsBase: number;
  stepsPerSecond: number;
  stressScore: number;
  irregularRhythm: boolean;
  motionArtifactLevel: number;
  statusLevel: 'nominal' | 'elevated' | 'critical';
  statusText: string;
  mechanismTitle: string;
  mechanismSummary: string;
  parameterWhy: {
    parameter: string;
    direction: string;
    explanation: string;
  }[];
  quizPrompt: string;
  quizOptions: string[];
  quizCorrectIndex: number;
  quizFeedback: string;
  publicHealthNudge: string;
  hospitalTrigger: string | null;
  citationIds: string[];
}

export interface SensorInspectionInfo {
  id: SensorNodeId;
  title: string;
  systemTag: string;
  location: string;
  primaryMetrics: string;
  howItWorksShort: string;
  limitationsShort: string;
}

export const SUBJECT_PROFILES: Record<SubjectId, SubjectProfile> = {
  adult: {
    id: 'adult',
    label: 'Dewasa Sehat',
    ageLabel: '28 thn · Fisiologi Normal',
    physiologySummary:
      'Elastisitas pembuluh darah optimal, keseimbangan saraf otonom (simpatis-parasimpatis) stabil, dan perfusi kapiler perifer normal.',
    baselineHr: 70,
    baselineSpo2: 98,
    baselineTemp: 36.7,
    baselineHrv: 58,
    baselineResp: 14,
    maxHr: 192,
    scale: [1, 1, 1],
    headScale: 1,
    vascularTint: '#0D9488',
  },
  child: {
    id: 'child',
    label: 'Anak (Pediatrik)',
    ageLabel: '8 thn · Fisiologi Berkembang',
    physiologySummary:
      'Volume sekuncup (stroke volume) ventrikel lebih kecil sehingga anak membutuhkan denyut jantung dan frekuensi napas istirahat lebih tinggi untuk mencukupi suplai oksigen per kilogram berat badan.',
    baselineHr: 94,
    baselineSpo2: 99,
    baselineTemp: 36.8,
    baselineHrv: 72,
    baselineResp: 22,
    maxHr: 208,
    scale: [0.8, 0.78, 0.8],
    headScale: 1.12,
    vascularTint: '#06B6D4',
  },
  senior: {
    id: 'senior',
    label: 'Lansia (68+)',
    ageLabel: '68 thn · Penyesuaian Usia',
    physiologySummary:
      'Penurunan tonus vagal (HRV lebih rendah) dan kekakuan dinding arteri memengaruhi kecepatan gelombang nadi (pulse wave velocity) serta menurunkan batas denyut jantung maksimal.',
    baselineHr: 74,
    baselineSpo2: 96,
    baselineTemp: 36.4,
    baselineHrv: 32,
    baselineResp: 16,
    maxHr: 152,
    scale: [0.98, 0.98, 1.02],
    headScale: 1,
    vascularTint: '#0EA5E9',
  },
};

export const WEARABLE_SUITES: Record<WearableSuiteId, WearableSuite> = {
  full_suite: {
    id: 'full_suite',
    label: 'Paket Multi-Sensor Lengkap',
    shortLabel: 'Multi-Sensor',
    sensorsActive: ['PPG Pergelangan + IMU', 'Patch ECG Dada', 'Pod Neural Pelipis'],
    samplingSummary: '250 Hz ECG · 100 Hz Multi-λ PPG · 50 Hz IMU',
    description:
      'Menggabungkan fotopletismografi pergelangan tangan, ECG sternum 1-lead, termometer kulit, dan telemetri perfusi kranial untuk sinkronisasi presisi tinggi.',
  },
  wrist_ppg: {
    id: 'wrist_ppg',
    label: 'Jam Pintar PPG + IMU',
    shortLabel: 'PPG Tangan',
    sensorsActive: ['PPG Optik (525/660/940 nm)', 'Akselerometer 3-Sumbu'],
    samplingSummary: '50–100 Hz PPG · 50 Hz IMU',
    description:
      'Arsitektur jam tangan pintar konsumen dengan LED hijau untuk denyut nadi dan LED merah/inframerah untuk SpO₂, dipadukan kompensasi gerak akselerometer.',
  },
  chest_patch: {
    id: 'chest_patch',
    label: 'Bio-Patch ECG Sternum',
    shortLabel: 'Patch Dada',
    sensorsActive: ['Biopotensial ECG 1-Lead', 'Termistor Kulit NTC'],
    samplingSummary: '250 Hz ECG · 1 Hz Termometri',
    description:
      'Patch klinis di dada tengah yang merekam langsung depolarisasi listrik jantung (kompleks QRS) dan suhu proksimal inti dengan gangguan gerak lengan minimal.',
  },
};

export const ACTIVITY_CONDITIONS: Record<ActivityStateId, ActivityCondition> = {
  resting: {
    id: 'resting',
    category: 'activity',
    label: 'Istirahat Normal',
    shortLabel: 'Istirahat',
    currentActivityText: 'Subjek duduk tenang dalam keseimbangan homeostasis normal.',
    hrDelta: 0,
    spo2Target: 98,
    tempDelta: 0,
    hrvMultiplier: 1.0,
    respDelta: 0,
    stepsBase: 3420,
    stepsPerSecond: 0,
    stressScore: 24,
    irregularRhythm: false,
    motionArtifactLevel: 0.04,
    statusLevel: 'nominal',
    statusText: 'Homeostasis Normal',
    mechanismTitle: 'Keseimbangan Otonom & Metabolisme Basal',
    mechanismSummary:
      'Saat istirahat, saraf parasimpatis (vagus) mendominasi nodus sinoatrial (SA), menjaga denyut jantung tetap rendah dengan variabilitas antar-detak (HRV) yang sehat. Aliran darah kapiler stabil sehingga sinyal optik PPG sangat bersih.',
    parameterWhy: [
      {
        parameter: 'Denyut Jantung & HRV',
        direction: 'Stabil di nilai dasar',
        explanation:
          'Pelepasan asetilkolin vagal memperlambat pacu nodus SA; aritmia sinus pernapasan menghasilkan variasi interval R-R yang sehat.',
      },
      {
        parameter: 'Saturasi SpO₂',
        direction: '96–99% normal',
        explanation:
          'Ventilasi alveoli dan perfusi paru seimbang sempurna sehingga hemoglobin arteri hampir jenuh oksigen.',
      },
      {
        parameter: 'Suhu Kulit',
        direction: '36,4–36,8 °C',
        explanation:
          'Produksi panas basal setara dengan pelepasan panas tubuh tanpa memicu keringat berlebih.',
      },
    ],
    quizPrompt: 'Mengapa HRV cenderung tinggi saat seseorang beristirahat tenang?',
    quizOptions: [
      'Karena jantung mengalami gangguan irama',
      'Karena dominasi saraf parasimpatis (vagus) memodulasi detak sesuai napas',
      'Karena sensor optik kehilangan sinyal',
    ],
    quizCorrectIndex: 1,
    quizFeedback:
      'Benar! HRV yang tinggi saat istirahat menandakan fleksibilitas saraf vagus yang sehat dalam mengatur interval antar-detak.',
    publicHealthNudge:
      'Kondisi dasar terkalibrasi. Pengingat peregangan ringan dijadwalkan bila duduk > 50 menit.',
    hospitalTrigger: null,
    citationIds: ['bayoumy2021', 'sequeira2023'],
  },
  running: {
    id: 'running',
    category: 'activity',
    label: 'Berlari / Aktivitas Fisik Intens',
    shortLabel: 'Berlari',
    currentActivityText: 'Pengguna sedang melakukan aktivitas fisik intens (berlari).',
    hrDelta: 75,
    spo2Target: 97,
    tempDelta: 0.5,
    hrvMultiplier: 0.35,
    respDelta: 16,
    stepsBase: 8250,
    stepsPerSecond: 2.8,
    stressScore: 64,
    irregularRhythm: false,
    motionArtifactLevel: 0.65,
    statusLevel: 'elevated',
    statusText: 'Beban Metabolik Tinggi',
    mechanismTitle: 'Aktivasi Simpatis, Lonjakan Curah Jantung & Termoregulasi',
    mechanismSummary:
      'Otot rangka membutuhkan oksigen hingga 15× lipat saat berlari. Lonjakan saraf simpatis (norepinefrin) menaikkan detak jantung (~145 BPM pada dewasa), menurunkan HRV, memacu langkah kaki, dan menaikkan suhu ~0,5 °C.',
    parameterWhy: [
      {
        parameter: 'Denyut Jantung',
        direction: 'Naik tajam (~145 BPM)',
        explanation:
          'Aktivasi simpatis mempercepat pacu nodus SA untuk melipatgandakan curah jantung (CO = HR × Stroke Volume) ke otot.',
      },
      {
        parameter: 'Saturasi SpO₂',
        direction: '96–97% (turun tipis)',
        explanation:
          'Waktu transit darah di kapiler paru lebih cepat dan efek Bohr mempercepat pelepasan O₂ ke otot aktif.',
      },
      {
        parameter: 'Suhu & Langkah',
        direction: '+0,5 °C · Langkah bertambah',
        explanation:
          'Hidrolisis ATP melepaskan panas otot (+0,5 °C); IMU 3-sumbu merekam hentakan langkah ritmik 2,8 langkah/detik.',
      },
    ],
    quizPrompt:
      'Tantangan apa yang dihadapi sensor optik PPG di pergelangan tangan saat subjek berlari cepat?',
    quizOptions: [
      'Ayunan lengan menciptakan artefak gerak yang mirip frekuensi detak nadi',
      'Suhu 37,2 °C mematikan LED hijau',
      'Oksigen darah naik menjadi 105%',
    ],
    quizCorrectIndex: 0,
    quizFeedback:
      'Tepat! Frekuensi ayunan lengan (~2–3 Hz) mirip dengan frekuensi detak jantung saat lari, sehingga IMU (Sistem C) wajib menyaring artefak gerak.',
    publicHealthNudge:
      'Aktivitas intens terdeteksi: minum ~250 mL air/elektrolit setiap 20 menit untuk menjaga volume plasma.',
    hospitalTrigger: null,
    citationIds: ['prieto2023', 'charlton2023'],
  },
  sleep: {
    id: 'sleep',
    category: 'activity',
    label: 'Tidur Nyenyak (NREM)',
    shortLabel: 'Tidur',
    currentActivityText: 'Subjek berada dalam fase tidur gelombang lambat (NREM) restoratif.',
    hrDelta: -16,
    spo2Target: 97,
    tempDelta: -0.5,
    hrvMultiplier: 1.38,
    respDelta: -3,
    stepsBase: 8250,
    stepsPerSecond: 0,
    stressScore: 14,
    irregularRhythm: false,
    motionArtifactLevel: 0.01,
    statusLevel: 'nominal',
    statusText: 'Pemulihan Parasimpatis',
    mechanismTitle: 'Dominasi Vagal & Penurunan Suhu Sirkadian Nokturnal',
    mechanismSummary:
      'Saat tidur nyenyak, aktivitas simpatis menurun drastis dan tonus parasimpatis memuncak. Denyut jantung turun 15–20% di bawah nilai dasar siang hari, HRV meningkat tinggi, dan suhu tubuh turun ~0,5 °C akibat sinyal melatonin.',
    parameterWhy: [
      {
        parameter: 'Denyut Jantung & HRV',
        direction: 'HR turun · HRV naik',
        explanation:
          'Dominasi vagal memperlambat pacu jantung dan memaksimalkan variabilitas antar-detak—indikator utama pemulihan tubuh.',
      },
      {
        parameter: 'Suhu Tubuh',
        direction: 'Turun ~0,5 °C',
        explanation:
          'Vasodilatasi perifer yang dimediasi melatonin melepaskan panas inti agar arsitektur tidur NREM berlangsung optimal.',
      },
      {
        parameter: 'Sensor Gerak IMU',
        direction: 'Hampir nol gerakan',
        explanation:
          'Akselerometer membaca kondisi diam (<0,02 g), menjadikan waktu tidur sebagai jendela paling akurat untuk kalibrasi SpO₂ & RHR.',
      },
    ],
    quizPrompt: 'Mengapa data tidur malam dipakai ilmuwan untuk mendeteksi infeksi lebih awal?',
    quizOptions: [
      'Karena sinyal malam hari bebas artefak gerak olahraga sehingga lonjakan kecil RHR dan suhu langsung terlihat',
      'Karena jantung berhenti berdetak sebentar saat tidur',
      'Karena Bluetooth bekerja lebih cepat di malam hari',
    ],
    quizCorrectIndex: 0,
    quizFeedback:
      'Benar! Studi Nature Medicine menunjukkan deviasi kecil pada detak jantung & suhu saat tidur menjadi penanda dini infeksi sebelum gejala muncul.',
    publicHealthNudge:
      'Fase pemulihan optimal. Data dasar nokturnal tersimpan sebagai pembanding tren kesehatan harian.',
    hospitalTrigger: null,
    citationIds: ['natmed2022', 'sagan2024'],
  },
  fever: {
    id: 'fever',
    category: 'illness',
    label: 'Sakit: Demam Infeksi Virus',
    shortLabel: 'Demam Virus',
    currentActivityText: 'Simulasi penyakit: Infeksi virus akut (influenza) dengan respons imun pirogenik.',
    hrDelta: 34,
    spo2Target: 95,
    tempDelta: 2.2,
    hrvMultiplier: 0.45,
    respDelta: 6,
    stepsBase: 1180,
    stepsPerSecond: 0,
    stressScore: 78,
    irregularRhythm: false,
    motionArtifactLevel: 0.08,
    statusLevel: 'elevated',
    statusText: 'Respons Imun Pirogenik',
    mechanismTitle: 'Pergeseran Set-Point Hipotalamus & Hukum Liebermeister',
    mechanismSummary:
      'Sitokin pro-inflamasi (IL-1, IL-6, TNF-α) menaikkan titik patokan suhu hipotalamus. Menurut Hukum Liebermeister, setiap kenaikan 1 °C suhu tubuh menaikkan denyut jantung istirahat sekitar 8–10 BPM walau subjek tidak melangkah, disertai penurunan HRV tajam.',
    parameterWhy: [
      {
        parameter: 'Suhu Tubuh',
        direction: '38,6–39,0 °C (Demam)',
        explanation:
          'Termistor NTC + sensor fluks panas mendeteksi peningkatan suhu kulit berkelanjutan akibat sinyal imun pirogenik.',
      },
      {
        parameter: 'Denyut Jantung Istirahat',
        direction: '+30–36 BPM saat diam',
        explanation:
          'Laju metabolisme sel meningkat (+13% per °C) dan sensitivitas termal nodus SA memicu takikardia saat berbaring.',
      },
      {
        parameter: 'HRV & Indeks Stres',
        direction: 'HRV anjlok (−55%)',
        explanation:
          'Stres inflamasi menekan tonus parasimpatis—sering terdeteksi wearable 24–48 jam sebelum puncak gejala demam.',
      },
    ],
    quizPrompt:
      'Bagaimana wearable membedakan detak jantung tinggi karena demam vs karena sedang berlari?',
    quizOptions: [
      'Dengan mengecek apakah langkah IMU nol sementara suhu kulit naik dan HRV anjlok',
      'Dengan melihat warna baju pengguna',
      'Wearable tidak bisa membedakannya sama sekali',
    ],
    quizCorrectIndex: 0,
    quizFeedback:
      'Tepat! Gabungan multi-sensor (HR tinggi + langkah IMU mendekati nol + kenaikan suhu + HRV turun) menjadi ciri khas respons infeksi/demam.',
    publicHealthNudge:
      'Pola infeksi dini terdeteksi (RHR & suhu naik saat diam). Istirahat cukup, perbanyak cairan, dan pertimbangkan isolasi mandiri.',
    hospitalTrigger:
      'Notifikasi Triase Telehealth: Demam persisten >38,5 °C + takikardia istirahat dikirim ke portal dokter keluarga.',
    citationIds: ['radin2021', 'miller2022', 'natmed2022'],
  },
  hypoxemia: {
    id: 'hypoxemia',
    category: 'illness',
    label: 'Sakit: Hipoksemia Pernapasan',
    shortLabel: 'Hipoksemia',
    currentActivityText: 'Simulasi penyakit: Gangguan pertukaran gas alveoli (serangan asma akut / pneumonia).',
    hrDelta: 46,
    spo2Target: 88,
    tempDelta: 0.8,
    hrvMultiplier: 0.42,
    respDelta: 14,
    stepsBase: 920,
    stepsPerSecond: 0,
    stressScore: 86,
    irregularRhythm: false,
    motionArtifactLevel: 0.12,
    statusLevel: 'critical',
    statusText: 'Peringatan Hipoksemia Kritis',
    mechanismTitle: 'Defisit Difusi Alveolar & Refleks Kemoreseptor Hipoksia',
    mechanismSummary:
      'Penyempitan bronkus atau cairan alveoli menghambat difusi O₂ ke kapiler paru sehingga SpO₂ arteri turun di bawah 90%. Kemoreseptor badan karotis langsung memicu kompensasi berupa napas cepat (takipnea) dan detak jantung cepat (takikardia).',
    parameterWhy: [
      {
        parameter: 'Saturasi SpO₂',
        direction: 'Anjlok ke 87–89%',
        explanation:
          'Peningkatan deoksihemoglobin (Hb) menyerap lebih banyak cahaya merah 660 nm dibanding inframerah 940 nm, menurunkan rasio oksimetri.',
      },
      {
        parameter: 'Detak Jantung & Napas',
        direction: 'Lonjakan kompensasi',
        explanation:
          'Refleks hipoksia mempercepat sirkulasi darah yang miskin oksigen agar jaringan vital tidak kekurangan suplai.',
      },
      {
        parameter: 'Suhu Kulit',
        direction: 'Naik ringan (+0,8 °C)',
        explanation:
          'Inflamasi saluran napas bawah menyumbang kenaikan suhu basal ringan.',
      },
    ],
    quizPrompt: 'Mengapa warna organ paru dan pembuluh di model 3D berubah saat SpO₂ turun ke 88%?',
    quizOptions: [
      'Menandakan kadar deoksihemoglobin (Hb) meningkat akibat kegagalan saturasi O₂ alveoli',
      'Karena sensor suhu mengalami korsleting',
      'Karena tubuh terlalu banyak minum air',
    ],
    quizCorrectIndex: 0,
    quizFeedback:
      'Benar! Penurunan SpO₂ di bawah 90% berarti lebih banyak hemoglobin tidak mengikat oksigen, memicu kondisi darurat hipoksemia.',
    publicHealthNudge:
      'Desaturasi oksigen kritis (<90% SpO₂). Hentikan seluruh aktivitas fisik, duduk tegak, dan segera cari pertolongan medis.',
    hospitalTrigger:
      'ESKALASI DARURAT HL7 FHIR: SpO₂ < 90% >120 detik + Takipnea. Skor peringatan dini NEWS2 otomatis dikirim ke UGD / Ambulans.',
    citationIds: ['fda2024', 'sjoding2021', 'prieto2023'],
  },
  dehydration: {
    id: 'dehydration',
    category: 'illness',
    label: 'Sakit: Dehidrasi & Stres Panas',
    shortLabel: 'Dehidrasi',
    currentActivityText: 'Simulasi kondisi: Defisit cairan hipovolemik akibat paparan panas.',
    hrDelta: 38,
    spo2Target: 97,
    tempDelta: 1.5,
    hrvMultiplier: 0.5,
    respDelta: 5,
    stepsBase: 6410,
    stepsPerSecond: 0.3,
    stressScore: 76,
    irregularRhythm: false,
    motionArtifactLevel: 0.18,
    statusLevel: 'elevated',
    statusText: 'Peringatan Pergeseran Kardiovaskular',
    mechanismTitle: 'Hipovolemia, Penurunan Stroke Volume & Cardiovascular Drift',
    mechanismSummary:
      'Kehilangan cairan lewat keringat menurunkan volume plasma darah dan aliran balik vena. Untuk mempertahankan tekanan darah dan pendinginan kulit, jantung berdetak jauh lebih cepat dari beban gerak ("cardiovascular drift") sementara suhu kulit naik.',
    parameterWhy: [
      {
        parameter: 'Denyut Jantung',
        direction: 'Naik +35–42 BPM',
        explanation:
          'Volume sekuncup turun akibat darah lebih kental; baroreseptor menaikkan HR agar tekanan darah tetap terjaga.',
      },
      {
        parameter: 'Suhu Kulit',
        direction: '38,0–38,3 °C',
        explanation:
          'Berkurangnya keringat efektif menyebabkan retensi panas dan risiko heat exhaustion.',
      },
      {
        parameter: 'Saturasi SpO₂',
        direction: 'Tetap normal (96–98%)',
        explanation:
          'Pertukaran oksigen di paru tidak terganggu, membantu membedakan dehidrasi dari penyakit paru.',
      },
    ],
    quizPrompt:
      'Bagaimana wearable berperan sebagai alat promosi kesehatan masyarakat pada kasus ini?',
    quizOptions: [
      'Memberikan pengingat otomatis untuk segera minum air/elektrolit dan berteduh sebelum heat stroke terjadi',
      'Mengubah suhu udara ruangan',
      'Menyuntikkan cairan infus lewat jam tangan',
    ],
    quizCorrectIndex: 0,
    quizFeedback:
      'Tepat! Intervensi mikro berbasis sensor (hydration nudge) membantu pekerja luar ruangan & atlet mencegah cedera panas berat.',
    publicHealthNudge:
      'PROMOSI KESEHATAN: Terdeteksi dehidrasi/stres panas — segera minum 500 mL air atau oralit dan beristirahat di tempat sejuk.',
    hospitalTrigger: null,
    citationIds: ['charlton2023', 'who_digital2023'],
  },
  arrhythmia: {
    id: 'arrhythmia',
    category: 'illness',
    label: 'Sakit: Aritmia (Fibrilasi Atrium)',
    shortLabel: 'Aritmia (AFib)',
    currentActivityText: 'Simulasi penyakit: Aktivitas listrik atrium kacau menghasilkan detak ventrikel tak teratur.',
    hrDelta: 42,
    spo2Target: 95,
    tempDelta: 0.1,
    hrvMultiplier: 1.85,
    respDelta: 4,
    stepsBase: 2150,
    stepsPerSecond: 0,
    stressScore: 74,
    irregularRhythm: true,
    motionArtifactLevel: 0.06,
    statusLevel: 'critical',
    statusText: 'Irama Jantung Tidak Teratur',
    mechanismTitle: 'Depolarisasi Atrium Kacau & Interval R-R Sangat Acak',
    mechanismSummary:
      'Sinyal listrik cepat dan tidak terorganisir di serambi jantung menghilangkan gelombang P pada ECG dan membuat jarak antar-detak (R-R) menjadi sangat acak ("irregularly irregular"). Algoritma wearable mendeteksi pola ini lewat patch ECG dan PPG.',
    parameterWhy: [
      {
        parameter: 'Grafik ECG & PPG',
        direction: 'Interval R-R kacau',
        explanation:
          'Hilangnya gelombang P pada ECG dada dan jarak puncak-ke-puncak yang berubah acak tiap detik.',
      },
      {
        parameter: 'Denyut & HRV Semu',
        direction: 'Acak 100–135 BPM',
        explanation:
          'Penting bagi mahasiswa: angka HRV tampak melonjak tinggi di sini BUKAN karena relaksasi sehat, melainkan akibat konduksi listrik yang kacau!',
      },
      {
        parameter: 'SpO₂ & Suhu',
        direction: 'SpO₂ 94–96% · Suhu normal',
        explanation:
          'Hilangnya kontraksi atrium menurunkan efisiensi pengisian ventrikel tanpa memicu demam.',
      },
    ],
    quizPrompt:
      'Mengapa angka HRV tinggi pada pasien Fibrilasi Atrium tidak boleh dianggap sebagai tanda tubuh bugar?',
    quizOptions: [
      'Karena variabilitas berasal dari impuls listrik atrium yang kacau, bukan modulasi vagal yang ritmis',
      'Karena suhu tubuh sedang tinggi',
      'Karena pasien sedang berlari maraton',
    ],
    quizCorrectIndex: 0,
    quizFeedback:
      'Cerdas! Inilah alasan wearable modern memadukan grafik Poincaré & ECG 1-lead untuk membedakan HRV sehat vs aritmia.',
    publicHealthNudge:
      'Deteksi irama tidak teratur: rekam strip ECG 30 detik pada bio-patch dan konsultasikan ke dokter untuk konfirmasi ECG 12-lead.',
    hospitalTrigger:
      'Telemetri Kardiologi: Sebaran R-R acak terkonfirmasi; lampiran strip ECG 1-lead 30 detik dikirim ke klinik kardiologi.',
    citationIds: ['perez2021_lubitz2022', 'bayoumy2021'],
  },
};

export const SENSOR_INSPECTIONS: Record<SensorNodeId, SensorInspectionInfo> = {
  wrist_ppg: {
    id: 'wrist_ppg',
    title: 'Jam Pintar PPG Optik + IMU',
    systemTag: 'Sistem A & C · Arteri Radialis Pergelangan',
    location: 'Pergelangan Tangan Kiri',
    primaryMetrics: 'Denyut Jantung (BPM), SpO₂ (%), Langkah, Referensi Gerak IMU',
    howItWorksShort:
      'Memancarkan cahaya LED hijau (525 nm) dan merah/IR (660/940 nm) ke kapiler dermis. Fotodioda membaca perubahan pantulan cahaya seiring gelombang tekanan nadi, sementara akselerometer 3-sumbu menghapus noise ayunan tangan.',
    limitationsShort:
      'Rentan terhadap artefak gerak ekstrem, tali jam longgar, vasokonstriksi dingin, serta bias serapan melanin pada kulit gelap (Fitzpatrick V–VI).',
  },
  chest_ecg: {
    id: 'chest_ecg',
    title: 'Bio-Patch ECG Sternum & Termistor',
    systemTag: 'Sistem B · Area Prekordial Dada Tengah',
    location: 'Sternum / Dada Tengah',
    primaryMetrics: 'ECG 1-Lead (mV), HRV R-R (ms), Suhu Kulit (°C), Laju Napas',
    howItWorksShort:
      'Elektroda Ag/AgCl menangkap potensial listrik jantung (mV) pada 250 Hz untuk memisahkan puncak R yang tajam, sedangkan termistor NTC + sensor fluks panas memantau suhu inti proksimal.',
    limitationsShort:
      'Membutuhkan perekat langsung di kulit (berisiko iritasi jangka panjang) dan hanya 1-lead sehingga tidak dapat mendeteksi lokasi sumbatan koroner spesifik seperti ECG 12-lead.',
  },
  temple_pod: {
    id: 'temple_pod',
    title: 'Pod Biosensor Neural & Perfusi Kranial',
    systemTag: 'Hibrida Sistem A+B · Area Temporal / Prefrontal',
    location: 'Pelipis Kanan / Dahi Lateral',
    primaryMetrics: 'Transisi Nadi Serebral, Indeks Stres Simpatis, Sinkronisasi Mikro-EEG',
    howItWorksShort:
      'Menggabungkan kontak biopotensial kering dan spektroskopi inframerah-dekat (fNIRS) untuk melacak respons otonom prefrontal, beban stres kognitif, dan stabilitas nadi kepala.',
    limitationsShort:
      'Sensitif terhadap artefak otot wajah (mengunyah/berkedip) dan gangguan rambut; umumnya digunakan pada perangkat riset dan klinis khusus.',
  },
  heart: {
    id: 'heart',
    title: 'Pompa Miokardium & Pacu Sinoatrial',
    systemTag: 'Sumber Fisiologis · Pusat Kardiovaskular',
    location: 'Rongga Toraks (Mediastinum)',
    primaryMetrics: 'Curah Jantung (L/mnt), Volume Sekuncup, Laju Nodus SA',
    howItWorksShort:
      'Depolarisasi listrik dimulai di nodus SA (gelombang P), menyapu ventrikel (kompleks QRS), lalu memompa bolus darah bertekanan menyusuri arteri menuju pergelangan tangan.',
    limitationsShort:
      'Wearable hanya mengukur sinyal turunan di permukaan (nadi optik / voltase kulit), bukan tekanan intrakardiak langsung.',
  },
  lungs: {
    id: 'lungs',
    title: 'Pertukaran Gas Alveolar Paru',
    systemTag: 'Sumber Fisiologis · Sistem Respirasi',
    location: 'Rongga Pleura Kanan & Kiri',
    primaryMetrics: 'Frekuensi Napas (napas/mnt), Saturasi Oksigen Arteri (SpO₂)',
    howItWorksShort:
      'Ekspansi diafragma menarik O₂ melintasi membran alveoli untuk berikatan dengan hemoglobin (Hb → HbO₂). Impedansi dada dan modulasi napas pada HRV memungkinkan wearable memperkirakan laju napas.',
    limitationsShort:
      'SpO₂ optik hanya mengukur persentase hemoglobin yang mengikat O₂, bukan volume udara atau penumpukan CO₂ (hiperkapnia).',
  },
};

export function computeSimulatedVitals(
  subject: SubjectProfile,
  condition: ActivityCondition
) {
  const rawHr = Math.min(subject.maxHr, Math.max(42, subject.baselineHr + condition.hrDelta));
  const respRate = Math.max(9, Math.round(subject.baselineResp + condition.respDelta));
  const temp = Number(
    (
      subject.baselineTemp +
      (subject.id === 'senior' && condition.tempDelta > 1
        ? condition.tempDelta * 0.85
        : condition.tempDelta)
    ).toFixed(1)
  );
  const spo2 = Math.min(
    100,
    Math.max(82, Math.round(condition.spo2Target - (subject.id === 'senior' ? 1 : 0)))
  );
  const hrv = Math.max(12, Math.round(subject.baselineHrv * condition.hrvMultiplier));

  return {
    hr: Math.round(rawHr),
    spo2,
    temp,
    hrv,
    respRate,
    stressScore: condition.stressScore,
    stepsBase: condition.stepsBase,
    stepsPerSecond: condition.stepsPerSecond,
  };
}
