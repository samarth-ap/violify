import { useState, useEffect, useRef, useCallback } from 'react';
import { Music2, Mic, MicOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

// ── Types ─────────────────────────────────────────────────────────────────────
type Intonation = 'in_tune' | 'sharp' | 'flat';

interface SwaraFrame {
  type: 'swara';
  hz: number;
  swara: string;
  cents_off: number;
  intonation: Intonation;
  octave: string;
}
interface SilentFrame  { type: 'silent' }
interface NoPitchFrame { type: 'no_pitch' }
type Frame = SwaraFrame | SilentFrame | NoPitchFrame;

// ── Constants (mirrors swara_server.py) ───────────────────────────────────────
const SA_HZ         = 329.63;   // E4
const FMIN          = 196;      // G3
const FMAX          = 1319;     // E6
const RMS_THRESHOLD = 0.01;
const IN_TUNE_CENTS = 10;

const SWARAS: [number, string][] = [
  [0,    'S'],
  [100,  'R1'],
  [200,  'R2'],
  [300,  'G2'],
  [400,  'G3'],
  [500,  'M1'],
  [600,  'M2'],
  [700,  'P'],
  [800,  'D1'],
  [900,  'D2'],
  [1000, 'N2'],
  [1100, 'N3'],
  [1200, "S'"],
];

// ── DSP helpers ───────────────────────────────────────────────────────────────
function calcRms(buf: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
  return Math.sqrt(sum / buf.length);
}

/**
 * Autocorrelation pitch detection with parabolic interpolation.
 * Returns the fundamental frequency in Hz, or null if none found.
 */
function detectPitch(buf: Float32Array, sampleRate: number): number | null {
  const SIZE        = buf.length;
  const MAX_SAMPLES = Math.floor(SIZE / 2);

  // Build autocorrelation
  const ac = new Float32Array(MAX_SAMPLES);
  for (let lag = 0; lag < MAX_SAMPLES; lag++) {
    let s = 0;
    for (let j = 0; j < MAX_SAMPLES; j++) s += buf[j] * buf[j + lag];
    ac[lag] = s;
  }

  // Skip the initial peak (lag 0) — walk past first dip
  let d = 1;
  while (d < MAX_SAMPLES && ac[d] > ac[d - 1]) d++;

  // Find the highest peak after the dip — that's the fundamental period
  let maxVal = -1;
  let maxPos = -1;
  for (let i = d; i < MAX_SAMPLES; i++) {
    if (ac[i] > maxVal) { maxVal = ac[i]; maxPos = i; }
  }

  // Reject weak peaks (not clearly periodic)
  if (maxPos === -1 || maxVal < ac[0] * 0.5) return null;

  // Parabolic interpolation for sub-sample accuracy
  const prev   = ac[maxPos - 1] ?? ac[maxPos];
  const curr   = ac[maxPos];
  const next   = ac[maxPos + 1] ?? ac[maxPos];
  const offset = (next - prev) / (2 * (2 * curr - prev - next));
  const period = maxPos + offset;

  const freq = sampleRate / period;
  return freq >= FMIN && freq <= FMAX ? freq : null;
}

// ── Swara mapping ─────────────────────────────────────────────────────────────
function hzToCents(hz: number, refHz: number): number {
  return 1200 * Math.log2(hz / refHz);
}

function nearestSwara(hz: number): { swara: string; cents_off: number; octave: string } {
  const cents    = hzToCents(hz, SA_HZ);
  const centsMod = ((cents % 1200) + 1200) % 1200;

  let closest = SWARAS[0];
  let minDist = Math.abs(centsMod - SWARAS[0][0]);
  for (const s of SWARAS) {
    const d = Math.abs(centsMod - s[0]);
    if (d < minDist) { minDist = d; closest = s; }
  }

  const cents_off = Math.round((centsMod - closest[0]) * 10) / 10;
  const octaveNum = Math.floor(cents / 1200);
  const octave    = octaveNum < 0 ? 'lower' : octaveNum === 0 ? 'middle' : 'upper';

  return { swara: closest[1], cents_off, octave };
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function SwaraDetector() {
  const [active, setActive] = useState(false);
  const [frame,  setFrame]  = useState<Frame | null>(null);
  const [error,  setError]  = useState<string | null>(null);

  const audioCtxRef  = useRef<AudioContext | null>(null);
  const analyserRef  = useRef<AnalyserNode | null>(null);
  const streamRef    = useRef<MediaStream | null>(null);
  const rafRef       = useRef<number | null>(null);
  const bufRef       = useRef<Float32Array | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current)  cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    rafRef.current   = null;
    streamRef.current  = null;
    audioCtxRef.current  = null;
    analyserRef.current  = null;
    setActive(false);
  }, []);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;

      const ctx     = new AudioContext();
      audioCtxRef.current = ctx;

      const analyser  = ctx.createAnalyser();
      analyser.fftSize  = 4096;
      analyserRef.current = analyser;
      bufRef.current  = new Float32Array(analyser.fftSize);

      ctx.createMediaStreamSource(stream).connect(analyser);
      setActive(true);

      const tick = () => {
        analyser.getFloatTimeDomainData(bufRef.current! as Float32Array<ArrayBuffer>);
        const buf = bufRef.current!;

        if (calcRms(buf) < RMS_THRESHOLD) {
          setFrame({ type: 'silent' });
        } else {
          const hz = detectPitch(buf, ctx.sampleRate);
          if (hz === null) {
            setFrame({ type: 'no_pitch' });
          } else {
            const { swara, cents_off, octave } = nearestSwara(hz);
            const intonation: Intonation =
              Math.abs(cents_off) <= IN_TUNE_CENTS ? 'in_tune'
              : cents_off > 0 ? 'sharp' : 'flat';
            setFrame({
              type: 'swara',
              hz: Math.round(hz * 10) / 10,
              swara,
              cents_off,
              intonation,
              octave,
            });
          }
        }

        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setError('Microphone access denied. Allow mic permissions and try again.');
    }
  }, []);

  // Clean up on unmount
  useEffect(() => () => stop(), [stop]);

  // ── Derived display values ────────────────────────────────────────────────
  const isSwara    = frame?.type === 'swara';
  const swaraFrame = isSwara ? (frame as SwaraFrame) : null;

  const intonationMeta: Record<Intonation, { label: string; color: string; bar: string }> = {
    in_tune: { label: '✓ In Tune', color: 'text-green-500', bar: 'bg-green-500' },
    sharp:   { label: '↑ Sharp',   color: 'text-red-400',   bar: 'bg-red-400'   },
    flat:    { label: '↓ Flat',    color: 'text-blue-400',  bar: 'bg-blue-400'  },
  };

  const meta = swaraFrame ? intonationMeta[swaraFrame.intonation] : null;

  const gaugePercent = swaraFrame
    ? Math.min(100, Math.max(0, ((swaraFrame.cents_off + 50) / 100) * 100))
    : 50;

  const statusLine = !frame         ? null
    : frame.type === 'silent'       ? 'Silent'
    : frame.type === 'no_pitch'     ? 'No pitch detected'
    : `${swaraFrame!.hz} Hz · ${swaraFrame!.octave} octave`;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-black">
            <Music2 className="text-[#FF901F]" size={20} />
            <span className="font-bold">Live Swara Detector</span>
          </CardTitle>
          <Button
            size="sm"
            onClick={active ? stop : start}
            className={
              active
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[#FF901F] hover:bg-[#E67F0C] text-white'
            }
          >
            {active
              ? <><MicOff size={14} className="mr-1" />Stop</>
              : <><Mic    size={14} className="mr-1" />Start</>
            }
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {!active && !error && (
          <p className="text-gray-400 text-sm text-center">
            Click Start to detect swaras from your microphone.
          </p>
        )}

        {active && (
          <div className="space-y-4">
            {/* Large swara name */}
            <div className="text-center">
              <div className="text-7xl font-bold text-[#FF901F] tracking-wide leading-none">
                {isSwara ? swaraFrame!.swara : '—'}
              </div>
              <div className="text-sm text-gray-400 mt-2">
                {statusLine ?? '\u00a0'}
              </div>
            </div>

            {/* Intonation gauge */}
            {isSwara && meta && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400 px-1">
                  <span>Flat</span>
                  <span>In Tune</span>
                  <span>Sharp</span>
                </div>
                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-300" />
                  <div
                    className={`absolute top-1 bottom-1 w-2 rounded-full transition-all duration-150 ${meta.bar}`}
                    style={{ left: `calc(${gaugePercent}% - 4px)` }}
                  />
                </div>
                <div className="text-center text-sm">
                  <span className={`font-bold ${meta.color}`}>{meta.label}</span>
                  <span className="text-gray-400 ml-2">
                    ({swaraFrame!.cents_off > 0 ? '+' : ''}{swaraFrame!.cents_off} cents)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
