import React, { useEffect, useRef } from 'react';

interface LiveWaveformCanvasProps {
  bpm: number;
  irregularRhythm: boolean;
  motionArtifactLevel: number;
  mode: 'ecg' | 'ppg';
  accentColor?: string;
  height?: number;
}

/**
 * Generates realistic P-QRS-T cardiac depolarization or optical PPG pulse morphology
 */
function samplePhysioWave(phase: number, mode: 'ecg' | 'ppg', irregular: boolean): number {
  if (mode === 'ecg') {
    // P wave (0.10 - 0.22)
    let v = 0;
    if (!irregular && phase > 0.08 && phase < 0.22) {
      const t = (phase - 0.15) / 0.035;
      v += 0.14 * Math.exp(-t * t);
    } else if (irregular) {
      // Atrial fibrillatory f-waves replacing organized P-wave
      v += 0.035 * Math.sin(phase * Math.PI * 18) + 0.02 * Math.cos(phase * Math.PI * 27);
    }
    // Q dip (0.28 - 0.32)
    if (phase > 0.26 && phase < 0.33) {
      const t = (phase - 0.295) / 0.014;
      v -= 0.18 * Math.exp(-t * t);
    }
    // R spike (0.32 - 0.38)
    if (phase > 0.30 && phase < 0.40) {
      const t = (phase - 0.35) / 0.015;
      v += 1.0 * Math.exp(-t * t);
    }
    // S dip (0.37 - 0.43)
    if (phase > 0.36 && phase < 0.45) {
      const t = (phase - 0.40) / 0.016;
      v -= 0.28 * Math.exp(-t * t);
    }
    // T wave (0.54 - 0.76)
    if (phase > 0.52 && phase < 0.78) {
      const t = (phase - 0.64) / 0.055;
      v += 0.28 * Math.exp(-t * t);
    }
    return v;
  }

  // Optical PPG (systolic peak + dicrotic notch + diastolic runoff)
  // Delayed slightly after R-peak (Pulse Transit Time)
  const shifted = (phase + 0.82) % 1;
  const sys = 0.92 * Math.exp(-Math.pow((shifted - 0.22) / 0.08, 2));
  const dic = 0.38 * Math.exp(-Math.pow((shifted - 0.46) / 0.12, 2));
  return (sys + dic) * 1.05 - 0.25;
}

export const LiveWaveformCanvas: React.FC<LiveWaveformCanvasProps> = ({
  bpm,
  irregularRhythm,
  motionArtifactLevel,
  mode,
  accentColor = '#0D9488',
  height = 68,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    bpm,
    irregularRhythm,
    motionArtifactLevel,
    mode,
    accentColor,
  });

  stateRef.current = { bpm, irregularRhythm, motionArtifactLevel, mode, accentColor };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafId = 0;
    let lastTime = performance.now();
    let phase = 0;
    let currentIntervalFactor = 1;
    const bufferLength = 220;
    const samples = new Float32Array(bufferLength).fill(0);

    // Pre-seed waveform so it renders immediately without waiting
    for (let i = 0; i < bufferLength; i++) {
      const p = (i / 65) % 1;
      samples[i] = samplePhysioWave(p, stateRef.current.mode, stateRef.current.irregularRhythm);
    }

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const {
        bpm: curBpm,
        irregularRhythm: curIrregular,
        motionArtifactLevel: curMotion,
        mode: curMode,
        accentColor: curColor,
      } = stateRef.current;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const targetW = Math.round(rect.width * dpr);
        const targetH = Math.round(rect.height * dpr);
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }
      }

      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) {
        rafId = requestAnimationFrame(draw);
        return;
      }

      if (!prefersReducedMotion) {
        const beatsPerSec = (curBpm / 60) * currentIntervalFactor;
        phase += dt * beatsPerSec;
        if (phase >= 1) {
          phase -= 1;
          currentIntervalFactor = curIrregular ? 0.68 + Math.random() * 0.72 : 1;
        }

        // Shift buffer left by 1–2 samples depending on dt
        const shiftCount = Math.max(1, Math.round(dt * 75));
        for (let s = 0; s < shiftCount; s++) {
          samples.copyWithin(0, 1);
          const subPhase = (phase + (s / shiftCount) * 0.015) % 1;
          let val = samplePhysioWave(subPhase, curMode, curIrregular);
          if (curMotion > 0.15 && curMode === 'ppg') {
            val += Math.sin(now * 0.019) * curMotion * 0.22;
          }
          samples[bufferLength - 1] = val;
        }
      }

      ctx.clearRect(0, 0, w, h);

      // Subtle clinical grid lines
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const midY = h * 0.62;
      ctx.moveTo(0, midY);
      ctx.lineTo(w, midY);
      for (let gx = 0; gx < w; gx += 32 * dpr) {
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, h);
      }
      ctx.stroke();

      // Waveform path
      ctx.strokeStyle = curColor;
      ctx.lineWidth = 2 * dpr;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();

      const amplitude = h * 0.44;
      for (let i = 0; i < bufferLength; i++) {
        const x = (i / (bufferLength - 1)) * w;
        const y = midY - samples[i] * amplitude;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Leading live dot
      const endX = w - 2 * dpr;
      const endY = midY - samples[bufferLength - 1] * amplitude;
      ctx.fillStyle = curColor;
      ctx.beginPath();
      ctx.arc(endX, endY, 3 * dpr, 0, Math.PI * 2);
      ctx.fill();

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ height: `${height}px` }}
      className="w-full block rounded-md"
      aria-label={`Live ${mode.toUpperCase()} physiological waveform at ${bpm} BPM`}
    />
  );
};
