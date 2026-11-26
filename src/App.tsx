import { useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  ActivityStateId,
  SubjectId,
  WearableSuiteId,
} from './data/physiologyData';
import { SimulatorView } from './components/SimulatorView';
import { HowItWorksView } from './components/HowItWorksView';
import { AccuracyEquityView } from './components/AccuracyEquityView';
import { InnovationsSourcesView } from './components/InnovationsSourcesView';

type AppTab = 'simulator' | 'how-it-works' | 'accuracy' | 'innovations';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('simulator');
  const [subjectId, setSubjectId] = useState<SubjectId>('adult');
  const [wearableSuite, setWearableSuite] = useState<WearableSuiteId>('full_suite');
  const [activityId, setActivityId] = useState<ActivityStateId>('running');

  const handleResetBaseline = () => {
    setActiveTab('simulator');
    setSubjectId('adult');
    setWearableSuite('full_suite');
    setActivityId('resting');
  };

  const navItems: { id: AppTab; label: string }[] = [
    { id: 'simulator', label: 'Simulator 3D' },
    { id: 'how-it-works', label: 'Cara Kerja' },
    { id: 'accuracy', label: 'Akurasi & Populasi' },
    { id: 'innovations', label: 'Inovasi & Pustaka' },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-biopulse-canvas text-[#0B1219] relative overflow-x-clip">
        {/* Subtle Decorative Health & Biomedical Background SVG Elements */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 overflow-hidden z-0 opacity-45"
        >
          <svg
            className="absolute -top-20 -right-24 w-[520px] h-[520px] text-teal-600/10"
            viewBox="0 0 400 400"
            fill="none"
          >
            <circle cx="200" cy="200" r="170" stroke="currentColor" strokeWidth="1" strokeDasharray="6 6" />
            <circle cx="200" cy="200" r="125" stroke="currentColor" strokeWidth="1" />
            <circle cx="200" cy="200" r="80" stroke="currentColor" strokeWidth="0.75" />
          </svg>
          <svg
            className="absolute bottom-12 -left-24 w-[460px] h-[220px] text-cyan-700/10"
            viewBox="0 0 460 180"
            fill="none"
          >
            <path
              d="M0 95 L90 95 L112 42 L134 148 L156 24 L178 130 L198 95 L290 95 L312 68 L334 120 L352 95 L460 95"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Strict 3-Zone Top Bar Contract */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
            {/* Zone 1: Single-line Brand Wordmark */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab('simulator')}
              className="text-xl font-extrabold tracking-tight text-slate-950 font-display whitespace-nowrap shrink-0 cursor-pointer"
            >
              BioPulse Lab
            </motion.button>

            {/* Zone 2: Clean Single-Line Navigation Links with Animated Sliding Underline */}
            <nav
              className="hidden md:flex items-center gap-7"
              aria-label="Navigasi utama"
            >
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`relative py-2 text-sm font-label font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive ? 'text-slate-950' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-bar"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute left-0 right-0 -bottom-[1px] h-0.5 bg-[#FF6B35] rounded-full"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Zone 3: Single Primary Action */}
            <div className="flex items-center shrink-0">
              <motion.button
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleResetBaseline}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-label font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
              >
                Reset Kondisi Dasar
              </motion.button>
            </div>
          </div>

          {/* Mobile Tab Strip */}
          <div className="md:hidden border-t border-slate-200 px-3 py-2 flex items-center gap-1.5 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-label font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Main Content Container with Smooth Animated Tab Switching */}
        <main className="relative z-10 flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'simulator' && (
                <SimulatorView
                  subjectId={subjectId}
                  onChangeSubject={setSubjectId}
                  wearableSuite={wearableSuite}
                  onChangeWearable={setWearableSuite}
                  activityId={activityId}
                  onChangeActivity={setActivityId}
                  onOpenSourcesTab={() => setActiveTab('innovations')}
                  onOpenHowItWorksTab={() => setActiveTab('how-it-works')}
                />
              )}

              {activeTab === 'how-it-works' && <HowItWorksView />}

              {activeTab === 'accuracy' && <AccuracyEquityView />}

              {activeTab === 'innovations' && <InnovationsSourcesView />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Quiet Academic Footer */}
        <footer className="relative z-10 border-t border-slate-200/80 bg-white/85 py-4 px-4 sm:px-6">
          <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-label text-slate-600">
            <span>
              BioPulse Lab · Simulator Edukasi Pemantauan Kesehatan Wearable 3D Interaktif
            </span>
            <span>
              Berbasis artikel jurnal bereputasi &amp; e-book akademik (2021–2026)
            </span>
          </div>
        </footer>
      </div>
    </MotionConfig>
  );
}
