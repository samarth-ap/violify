import { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, Upload, Music, Clock, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

// ── Types ──────────────────────────────────────────────────

interface AIRecordingScreenProps {
  onNavigate: (screen: any) => void;
}

interface PitchError {
  start_s: number;
  end_s: number;
  duration_s: number;
  cents_error: number;
  direction: 'sharp' | 'flat';
  teacher_swara: string;
}

interface OnsetError {
  teacher_onset: number;
  student_onset: number;
  diff_ms: number;
  direction: 'LATE' | 'EARLY';
}

// ── Dummy data ─────────────────────────────────────────────

const DUMMY_DURATION = 20;
const CENTS_THRESHOLD = 30;

const DUMMY_PITCH_ERRORS: PitchError[] = [
  { start_s: 2.1,  end_s: 2.8,  duration_s: 0.7, cents_error: -45, direction: 'flat',  teacher_swara: 'S'  },
  { start_s: 5.4,  end_s: 6.1,  duration_s: 0.7, cents_error:  62, direction: 'sharp', teacher_swara: 'G3' },
  { start_s: 9.2,  end_s: 9.9,  duration_s: 0.7, cents_error: -38, direction: 'flat',  teacher_swara: 'M1' },
  { start_s: 13.5, end_s: 14.2, duration_s: 0.7, cents_error:  80, direction: 'sharp', teacher_swara: 'P'  },
  { start_s: 17.8, end_s: 18.5, duration_s: 0.7, cents_error: -55, direction: 'flat',  teacher_swara: 'N3' },
];

const DUMMY_ONSET_ERRORS: OnsetError[] = [
  { teacher_onset: 3.5,  student_onset: 3.62,  diff_ms:  120, direction: 'LATE'  },
  { teacher_onset: 7.8,  student_onset: 7.72,  diff_ms:  -80, direction: 'EARLY' },
  { teacher_onset: 12.1, student_onset: 12.35, diff_ms:  250, direction: 'LATE'  },
];

const TEACHER_ONSETS = [1.0, 2.5, 3.5, 4.8, 6.2, 7.8, 9.0, 10.5, 12.1, 13.8, 15.2, 16.7, 18.0];
const STUDENT_ONSETS  = [1.0, 2.5, 3.62, 4.8, 6.2, 7.72, 9.0, 10.5, 12.35, 13.8, 15.2, 16.7, 18.0];

function generateDummyCentsCurve(numPoints: number): number[] {
  const curve: number[] = [];
  for (let i = 0; i < numPoints; i++) {
    const t = (i / numPoints) * DUMMY_DURATION;
    const err = DUMMY_PITCH_ERRORS.find(e => t >= e.start_s && t <= e.end_s);
    curve.push(err ? err.cents_error + (Math.random() - 0.5) * 18 : (Math.random() - 0.5) * 22);
  }
  return curve;
}

const DUMMY_CENTS_CURVE = generateDummyCentsCurve(300);

// ── Cents deviation chart ─────────────────────────────────

function CentsCurveChart({ data, duration, pitchErrors }: { data: number[]; duration: number; pitchErrors: PitchError[] }) {
  const W = 800; const H = 120;
  const mid = H / 2;
  const scale = (mid - 8) / 200;
  const threshYPos = mid - CENTS_THRESHOLD * scale;
  const threshYNeg = mid + CENTS_THRESHOLD * scale;

  const linePath = data.map((c, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = mid - Math.max(-200, Math.min(200, c)) * scale;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 px-1">
        <span>Playing too flat (below teacher)</span>
        <span>Playing too sharp (above teacher)</span>
      </div>
      <div className="relative flex gap-3">
        <div className="flex flex-col justify-between text-[10px] text-gray-600 dark:text-gray-400 py-1 flex-shrink-0 w-10 text-right">
          <span>+200¢</span>
          <span>0</span>
          <span>-200¢</span>
        </div>
        <div className="flex-1">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800/50" style={{ height: 120 }} preserveAspectRatio="none">
            {/* Threshold fill bands */}
            <rect x={0} y={0} width={W} height={threshYPos} fill="rgba(239,68,68,0.05)" />
            <rect x={0} y={threshYNeg} width={W} height={H - threshYNeg} fill="rgba(59,130,246,0.05)" />
            {/* Error columns */}
            {pitchErrors.map((e, i) => (
              <rect key={i}
                x={(e.start_s / duration) * W}
                width={((e.end_s - e.start_s) / duration) * W}
                y={0} height={H}
                fill={e.direction === 'sharp' ? 'rgba(239,68,68,0.18)' : 'rgba(59,130,246,0.18)'}
              />
            ))}
            {/* Centre line */}
            <line x1={0} y1={mid} x2={W} y2={mid} stroke="#9ca3af" strokeWidth={1} />
            {/* Threshold lines */}
            <line x1={0} y1={threshYPos} x2={W} y2={threshYPos} stroke="#ef4444" strokeWidth={1.2} strokeDasharray="6,4" opacity={0.7} />
            <line x1={0} y1={threshYNeg} x2={W} y2={threshYNeg} stroke="#3b82f6" strokeWidth={1.2} strokeDasharray="6,4" opacity={0.7} />
            {/* Curve */}
            <path d={linePath} fill="none" stroke="#6b7280" strokeWidth={1.8} />
          </svg>
          <div className="flex justify-between text-[10px] text-gray-600 dark:text-gray-400 mt-1.5 px-0.5">
            <span>0s</span>
            <span>{(duration * 0.25).toFixed(0)}s</span>
            <span>{(duration * 0.5).toFixed(0)}s</span>
            <span>{(duration * 0.75).toFixed(0)}s</span>
            <span>{duration}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Onset / timing chart ──────────────────────────────────

function OnsetChart({ teacherOnsets, studentOnsets, errors, duration }: {
  teacherOnsets: number[]; studentOnsets: number[]; errors: OnsetError[]; duration: number;
}) {
  const W = 800; const H = 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 px-1">
        <span>Each tick = one note being played</span>
        <span>Red zones = you were off-time</span>
      </div>
      <div className="relative flex gap-3">
        <div className="flex flex-col justify-around text-[10px] font-semibold flex-shrink-0 w-10 text-right">
          <span className="text-blue-500">Teacher</span>
          <span className="text-[#FF901F]">You</span>
        </div>
        <div className="flex-1">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg bg-gray-50 dark:bg-gray-800/50" style={{ height: 80 }} preserveAspectRatio="none">
            {/* Error regions */}
            {errors.map((e, i) => {
              const x1 = (Math.min(e.teacher_onset, e.student_onset) / duration) * W - 4;
              const x2 = (Math.max(e.teacher_onset, e.student_onset) / duration) * W + 4;
              return <rect key={i} x={x1} y={0} width={Math.max(x2 - x1, 8)} height={H} fill="rgba(239,68,68,0.15)" />;
            })}
            {/* Divider */}
            <line x1={0} y1={H / 2} x2={W} y2={H / 2} stroke="#e5e7eb" strokeWidth={1} />
            {/* Teacher onsets */}
            {teacherOnsets.map((t, i) => (
              <line key={i} x1={(t / duration) * W} y1={8} x2={(t / duration) * W} y2={H / 2 - 8} stroke="#3b82f6" strokeWidth={2.5} strokeLinecap="round" />
            ))}
            {/* Student onsets */}
            {studentOnsets.map((t, i) => (
              <line key={i} x1={(t / duration) * W} y1={H / 2 + 8} x2={(t / duration) * W} y2={H - 8} stroke="#FF901F" strokeWidth={2.5} strokeLinecap="round" />
            ))}
          </svg>
          <div className="flex justify-between text-[10px] text-gray-600 dark:text-gray-400 mt-1.5 px-0.5">
            <span>0s</span>
            <span>{(duration * 0.25).toFixed(0)}s</span>
            <span>{(duration * 0.5).toFixed(0)}s</span>
            <span>{(duration * 0.75).toFixed(0)}s</span>
            <span>{duration}s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Score ring ────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const r = 36; const circ = 2 * Math.PI * r;
  const fill = (score / 100) * circ;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={90} height={90} className="rotate-[-90deg]">
      <circle cx={45} cy={45} r={r} fill="none" stroke="#e5e7eb" strokeWidth={8} />
      <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round" />
      <text x={45} y={45} textAnchor="middle" dominantBaseline="middle"
        fill="currentColor" fontSize={16} fontWeight={700}
        className="rotate-[90deg] origin-center fill-foreground"
        style={{ transform: 'rotate(90deg)', transformOrigin: '45px 45px' }}>
        {score}
      </text>
    </svg>
  );
}

// ── Main component ─────────────────────────────────────────

export default function AIRecordingScreen({ onNavigate }: AIRecordingScreenProps) {
  const generateDemoWaveform = (n = 200) => Array.from({ length: n }, () => Math.random() * 90 + 10);

  const [step, setStep] = useState<'upload' | 'recording' | 'playback'>('upload');
  const [teacherAudioUrl, setTeacherAudioUrl] = useState<string | null>(null);
  const [teacherWaveform, setTeacherWaveform] = useState<number[]>([]);
  const [studentWaveform, setStudentWaveform] = useState<number[]>([]);
  const [isRecordingTeacher, setIsRecordingTeacher] = useState(false);
  const [isRecordingStudent, setIsRecordingStudent] = useState(false);
  const [hasStudentRecording, setHasStudentRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(DUMMY_DURATION);
  const [activeTab, setActiveTab] = useState<'pitch' | 'timing'>('pitch');

  const teacherMediaRecorder = useRef<MediaRecorder | null>(null);
  const studentMediaRecorder = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackInterval = useRef<NodeJS.Timeout | null>(null);

  const generateWaveform = async (file: File): Promise<number[]> =>
    new Promise((resolve) => {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buf = await ctx.decodeAudioData(e.target?.result as ArrayBuffer);
          const raw = buf.getChannelData(0);
          const samples = 200;
          const block = Math.floor(raw.length / samples);
          const data = Array.from({ length: samples }, (_, i) => {
            let s = 0;
            for (let j = 0; j < block; j++) s += Math.abs(raw[i * block + j]);
            return s / block;
          });
          const max = Math.max(...data);
          resolve(data.map(v => (v / max) * 100));
        } catch { resolve(generateDemoWaveform()); }
      };
      reader.readAsArrayBuffer(file);
    });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setTeacherAudioUrl(url);
    setTeacherWaveform(await generateWaveform(file));
    const audio = new Audio(url);
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
    setStep('recording');
  };

  const toggleTeacherRecording = async () => {
    if (isRecordingTeacher) { teacherMediaRecorder.current?.stop(); setIsRecordingTeacher(false); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      teacherMediaRecorder.current = mr;
      const chunks: BlobPart[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setTeacherAudioUrl(url);
        setTeacherWaveform(await generateWaveform(new File([blob], 'teacher.webm', { type: 'audio/webm' })));
        const audio = new Audio(url);
        audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
        stream.getTracks().forEach(t => t.stop());
        setStep('recording');
      };
      mr.start(); setIsRecordingTeacher(true);
    } catch { alert('Could not access microphone.'); }
  };

  const toggleStudentRecording = async () => {
    if (isRecordingStudent) { studentMediaRecorder.current?.stop(); setIsRecordingStudent(false); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      studentMediaRecorder.current = mr;
      const chunks: BlobPart[] = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const waveform = await generateWaveform(new File([blob], 'student.webm', { type: 'audio/webm' }));
        const tLen = teacherWaveform.length;
        setStudentWaveform(Array.from({ length: tLen }, (_, i) => waveform[Math.floor((i / tLen) * waveform.length)] || 0));
        setHasStudentRecording(true);
        stream.getTracks().forEach(t => t.stop());
        setStep('playback');
      };
      mr.start(); setIsRecordingStudent(true);
    } catch { alert('Could not access microphone.'); }
  };

  const loadDemoPlayback = () => {
    setTeacherWaveform(generateDemoWaveform());
    setStudentWaveform(generateDemoWaveform());
    setHasStudentRecording(true);
    setDuration(DUMMY_DURATION);
    setStep('playback');
  };

  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current?.pause();
      if (playbackInterval.current) clearInterval(playbackInterval.current);
      return;
    }
    setIsPlaying(true);
    if (!audioRef.current && teacherAudioUrl) audioRef.current = new Audio(teacherAudioUrl);
    audioRef.current?.play();
    playbackInterval.current = setInterval(() => {
      if (audioRef.current) {
        const t = audioRef.current.currentTime;
        setCurrentTime(t);
        if (t >= duration) { setIsPlaying(false); setCurrentTime(0); clearInterval(playbackInterval.current!); }
      } else {
        setCurrentTime(prev => {
          if (prev >= duration) { setIsPlaying(false); clearInterval(playbackInterval.current!); return 0; }
          return prev + 0.1;
        });
      }
    }, 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const t = ((e.clientX - rect.left) / rect.width) * duration;
    setCurrentTime(t);
    if (audioRef.current) audioRef.current.currentTime = t;
  };

  const resetAll = () => {
    setStep('upload');
    setTeacherAudioUrl(null);
    setTeacherWaveform([]); setStudentWaveform([]);
    setHasStudentRecording(false);
    setCurrentTime(0); setIsPlaying(false);
    if (playbackInterval.current) clearInterval(playbackInterval.current);
    audioRef.current = null;
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;

  const totalErrors = DUMMY_PITCH_ERRORS.length + DUMMY_ONSET_ERRORS.length;
  const score = Math.max(0, Math.round(100 - totalErrors * 7 - DUMMY_PITCH_ERRORS.reduce((a, e) => a + Math.abs(e.cents_error) * 0.05, 0)));

  // ── RENDER ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-24 lg:pb-8">

      {/* Header */}
      <div className="bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-950 border-b border-gray-200 dark:border-gray-800 px-6 pt-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl text-black dark:text-white font-bold">Practice Coach</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Record yourself, compare with your teacher, and see exactly what to fix.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* ── STEP 1: Load teacher reference ── */}
        {step === 'upload' && (
          <div className="max-w-lg mx-auto space-y-6">
            {/* How it works */}
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { n: '1', label: 'Load teacher\'s recording' },
                { n: '2', label: 'Record yourself playing' },
                { n: '3', label: 'See your mistakes' },
              ].map(item => (
                <div key={item.n} className="flex flex-col items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-orange-50 dark:bg-orange-950/20 text-[#FF901F] font-bold text-sm flex items-center justify-center">{item.n}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{item.label}</p>
                </div>
              ))}
            </div>

            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-black dark:text-white">Step 1 — Load your teacher's recording</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">This is the reference you'll be compared against. You can upload a saved file or record directly.</p>
                </div>

                <label className="block">
                  <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" id="teacher-upload" />
                  <div
                    onClick={() => document.getElementById('teacher-upload')?.click()}
                    className="flex flex-col items-center justify-center gap-3 h-28 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-[#FF901F]/50 hover:bg-orange-50 dark:hover:bg-gray-800 cursor-pointer transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Upload size={18} className="text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-black dark:text-white">Upload a recording</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">MP3, WAV, or M4A</p>
                    </div>
                  </div>
                </label>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide">or record now</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <Button
                  onClick={toggleTeacherRecording}
                  className={`w-full h-14 text-base font-medium ${isRecordingTeacher ? 'bg-red-500 hover:bg-red-600' : 'bg-[#FF901F] hover:bg-[#E67F0C]'}`}
                >
                  {isRecordingTeacher ? (
                    <><Square size={18} className="mr-2 fill-white" />Stop recording</>
                  ) : (
                    <><Mic size={18} className="mr-2" />Record teacher</>
                  )}
                </Button>
                {isRecordingTeacher && (
                  <p className="text-center text-sm text-red-500 animate-pulse">Recording in progress…</p>
                )}
              </CardContent>
            </Card>

            <button onClick={loadDemoPlayback} className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors underline underline-offset-4">
              Skip to demo — see what the analysis looks like
            </button>
          </div>
        )}

        {/* ── STEP 2: Record yourself ── */}
        {step === 'recording' && !hasStudentRecording && (
          <div className="max-w-lg mx-auto space-y-6">
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">Teacher recording loaded</span>
                  </div>
                  <h2 className="text-base font-semibold text-black dark:text-white">Step 2 — Now record yourself</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Play the same piece from the beginning. Try to match the tempo and notes as closely as you can.</p>
                </div>

                {/* Teacher waveform preview */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Teacher's recording</p>
                  <div className="h-16 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-end gap-px px-2 pb-2 overflow-hidden">
                    {teacherWaveform.map((h, i) => (
                      <div key={i} className="flex-1 bg-orange-400/60 rounded-t-sm min-w-[1px]" style={{ height: `${Math.max(h, 8)}%` }} />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={toggleStudentRecording}
                  size="lg"
                  className={`w-full h-14 text-base font-medium ${isRecordingStudent ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-purple-500 to-[#FF901F]'} text-white`}
                >
                  {isRecordingStudent ? (
                    <><Square size={18} className="mr-2 fill-white" />Stop recording</>
                  ) : (
                    <><Mic size={18} className="mr-2" />Start recording yourself</>
                  )}
                </Button>
                {isRecordingStudent && (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-sm text-red-500">Recording in progress…</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── STEP 3: Analysis ── */}
        {step === 'playback' && hasStudentRecording && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">

            {/* ── LEFT COLUMN: score + player + actions ── */}
            <div className="space-y-6">

            {/* Score summary */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  <ScoreRing score={score} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Your score</p>
                    <h2 className="text-xl font-bold text-black dark:text-white">
                      {score >= 80 ? 'Great playing!' : score >= 60 ? 'Good effort!' : 'Keep practicing!'}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {score >= 80
                        ? 'Only minor issues — you\'re close to matching your teacher.'
                        : score >= 60
                        ? 'A few areas to focus on. Check the errors below.'
                        : 'Several spots need work. Review each error below.'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <div className="flex-1 flex items-center gap-2.5 bg-red-50 dark:bg-red-950/30 rounded-xl px-4 py-3">
                    <Music size={16} className="text-red-500 flex-shrink-0" />
                    <div>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400 leading-none">{DUMMY_PITCH_ERRORS.length}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Pitch errors</p>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2.5 bg-amber-50 dark:bg-amber-950/30 rounded-xl px-4 py-3">
                    <Clock size={16} className="text-amber-500 flex-shrink-0" />
                    <div>
                      <p className="text-lg font-bold text-amber-600 dark:text-amber-400 leading-none">{DUMMY_ONSET_ERRORS.length}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Timing errors</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Waveform player */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-black dark:text-white">Recording comparison</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Orange = teacher &nbsp;·&nbsp; Purple = you &nbsp;·&nbsp; Red zones = pitch errors &nbsp;·&nbsp; Yellow zones = timing errors</p>
                </div>

                {/* Waveform — SVG-based for reliable rendering */}
                {(() => {
                  const W = 800; const H = 120; const mid = H / 2;
                  const n = teacherWaveform.length;
                  return (
                    <div className="relative rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }} preserveAspectRatio="none">
                        {/* Error zone overlays */}
                        {DUMMY_PITCH_ERRORS.map((e, i) => (
                          <rect key={`pe-${i}`} x={(e.start_s / duration) * W} width={((e.end_s - e.start_s) / duration) * W} y={0} height={H} fill="rgba(239,68,68,0.15)" />
                        ))}
                        {DUMMY_ONSET_ERRORS.map((e, i) => (
                          <rect key={`oe-${i}`}
                            x={(Math.min(e.teacher_onset, e.student_onset) / duration) * W - 2}
                            width={Math.abs(e.student_onset - e.teacher_onset) / duration * W + 4}
                            y={0} height={H} fill="rgba(245,158,11,0.15)"
                          />
                        ))}
                        {/* Centre divider */}
                        <line x1={0} y1={mid} x2={W} y2={mid} stroke="#d1d5db" strokeWidth={1} />
                        {/* Teacher waveform — top half, orange */}
                        {teacherWaveform.map((h, i) => {
                          const x = (i / n) * W;
                          const barH = Math.max((h / 100) * (mid - 4), 2);
                          const t = (i / n) * duration;
                          const isPitch = DUMMY_PITCH_ERRORS.some(e => t >= e.start_s && t <= e.end_s);
                          const isTiming = DUMMY_ONSET_ERRORS.some(e => t >= Math.min(e.teacher_onset, e.student_onset) - 0.1 && t <= Math.max(e.teacher_onset, e.student_onset) + 0.1);
                          return <rect key={`t-${i}`} x={x} y={mid - barH} width={Math.max(W / n - 0.5, 1)} height={barH} fill={isPitch ? '#f87171' : isTiming ? '#fbbf24' : '#fb923c'} opacity={0.85} />;
                        })}
                        {/* Student waveform — bottom half, purple */}
                        {studentWaveform.map((h, i) => {
                          const x = (i / n) * W;
                          const barH = Math.max((h / 100) * (mid - 4), 2);
                          const t = (i / n) * duration;
                          const isPitch = DUMMY_PITCH_ERRORS.some(e => t >= e.start_s && t <= e.end_s);
                          const isTiming = DUMMY_ONSET_ERRORS.some(e => t >= Math.min(e.teacher_onset, e.student_onset) - 0.1 && t <= Math.max(e.teacher_onset, e.student_onset) + 0.1);
                          return <rect key={`s-${i}`} x={x} y={mid} width={Math.max(W / n - 0.5, 1)} height={barH} fill={isPitch ? '#dc2626' : isTiming ? '#d97706' : '#7c3aed'} opacity={0.75} />;
                        })}
                        {/* Playhead */}
                        <line x1={(currentTime / duration) * W} y1={0} x2={(currentTime / duration) * W} y2={H} stroke="#111827" strokeWidth={1.5} />
                        <circle cx={(currentTime / duration) * W} cy={4} r={4} fill="#111827" />
                      </svg>
                    </div>
                  );
                })()}

                {/* Scrubber */}
                <div className="h-8 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer relative overflow-hidden" onClick={handleSeek}>
                  {DUMMY_PITCH_ERRORS.map((e, i) => (
                    <div key={i} className="absolute top-0 bottom-0 bg-red-400/50" style={{ left: `${(e.start_s / duration) * 100}%`, width: `${((e.end_s - e.start_s) / duration) * 100}%` }} />
                  ))}
                  {DUMMY_ONSET_ERRORS.map((e, i) => (
                    <div key={i} className="absolute top-0 bottom-0 bg-amber-400/50" style={{
                      left: `${(Math.min(e.teacher_onset, e.student_onset) / duration) * 100}%`,
                      width: `${(Math.abs(e.student_onset - e.teacher_onset) / duration) * 100 + 0.5}%`,
                    }} />
                  ))}
                  <div className="absolute top-0 bottom-0 w-1 bg-gray-800 dark:bg-gray-200 pointer-events-none" style={{ left: `${(currentTime / duration) * 100}%` }} />
                </div>

                {/* Time + Play button */}
                <div className="flex justify-between text-xs font-mono text-gray-500 dark:text-gray-400 px-0.5">
                  <span>{fmt(currentTime)}</span>
                  <span>{fmt(duration)}</span>
                </div>
                <Button onClick={togglePlayback} className="w-full h-12 bg-gradient-to-r from-purple-500 to-[#FF901F] text-white text-sm font-medium">
                  {isPlaying ? <><Pause size={16} className="mr-2" />Pause</> : <><Play size={16} className="mr-2" />Play recording</>}
                </Button>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={resetAll} variant="outline" className="flex-1 h-11">New analysis</Button>
              <Button
                onClick={() => {
                  setStep('recording');
                  setHasStudentRecording(false);
                  setStudentWaveform([]);
                  setCurrentTime(0); setIsPlaying(false);
                  if (playbackInterval.current) clearInterval(playbackInterval.current);
                  audioRef.current = null;
                }}
                className="flex-1 h-11 bg-gradient-to-r from-purple-500 to-[#FF901F] text-white"
              >
                Try again
              </Button>
            </div>

            </div>{/* end left column */}

            {/* ── RIGHT COLUMN: error breakdown ── */}
            <div className="lg:sticky lg:top-6">
            {/* Error breakdown */}
            <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-black dark:text-white">Error breakdown</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Tap any error to jump to that moment in the recording.</p>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                  <button
                    onClick={() => setActiveTab('pitch')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'pitch' ? 'bg-white dark:bg-gray-900 text-black dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                  >
                    <Music size={14} />Pitch
                  </button>
                  <button
                    onClick={() => setActiveTab('timing')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'timing' ? 'bg-white dark:bg-gray-900 text-black dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'}`}
                  >
                    <Clock size={14} />Timing
                  </button>
                </div>

                {/* PITCH TAB */}
                {activeTab === 'pitch' && (
                  <div className="space-y-5">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-1">
                      <p className="text-xs font-semibold text-black dark:text-white">What am I looking at?</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        This chart shows how far in tune you were versus your teacher at each moment.
                        The grey line is your pitch — when it drifts past the <span className="text-red-500 font-medium">red dashed line</span> you're playing sharp (too high),
                        and past the <span className="text-blue-500 font-medium">blue dashed line</span> you're playing flat (too low).
                      </p>
                    </div>

                    <CentsCurveChart data={DUMMY_CENTS_CURVE} duration={duration} pitchErrors={DUMMY_PITCH_ERRORS} />

                    <div className="flex flex-wrap gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-dashed border-red-400 inline-block" /> Sharp — too high</span>
                      <span className="flex items-center gap-1.5"><span className="w-6 border-t-2 border-dashed border-blue-400 inline-block" /> Flat — too low</span>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-black dark:text-white">Individual errors</p>
                      {DUMMY_PITCH_ERRORS.map((e, i) => (
                        <button key={i} onClick={() => setCurrentTime(e.start_s)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${e.direction === 'sharp' ? 'bg-red-100 dark:bg-red-950/50' : 'bg-blue-100 dark:bg-blue-950/50'}`}>
                            {e.direction === 'sharp' ? <TrendingUp size={16} className="text-red-500" /> : <TrendingDown size={16} className="text-blue-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-black dark:text-white">{e.direction === 'sharp' ? 'Too sharp' : 'Too flat'} on {e.teacher_swara}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${e.direction === 'sharp' ? 'bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'}`}>
                                {e.cents_error > 0 ? '+' : ''}{e.cents_error}¢
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{fmt(e.start_s)} – {fmt(e.end_s)} · {e.duration_s.toFixed(1)}s</p>
                          </div>
                          <ChevronRight size={14} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* TIMING TAB */}
                {activeTab === 'timing' && (
                  <div className="space-y-5">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-1">
                      <p className="text-xs font-semibold text-black dark:text-white">What am I looking at?</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        Each vertical tick is a note being played.
                        <span className="text-blue-500 font-medium"> Blue ticks</span> are the teacher's notes,
                        <span className="text-[#FF901F] font-medium"> orange ticks</span> are yours.
                        When they don't line up (red zones), you were rushing or falling behind.
                      </p>
                    </div>

                    <OnsetChart teacherOnsets={TEACHER_ONSETS} studentOnsets={STUDENT_ONSETS} errors={DUMMY_ONSET_ERRORS} duration={duration} />

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-black dark:text-white">Individual errors</p>
                      {DUMMY_ONSET_ERRORS.map((e, i) => (
                        <button key={i} onClick={() => setCurrentTime(e.teacher_onset)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-amber-100 dark:bg-amber-950/50">
                            {e.direction === 'LATE' ? <TrendingDown size={16} className="text-amber-500" /> : <TrendingUp size={16} className="text-amber-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-black dark:text-white">{e.direction === 'LATE' ? 'Came in late' : 'Came in early'}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                                {Math.abs(e.diff_ms)}ms off
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Note at {e.teacher_onset.toFixed(2)}s · you played at {e.student_onset.toFixed(2)}s</p>
                          </div>
                          <ChevronRight size={14} className="text-gray-600 dark:text-gray-400 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            </div>{/* end right column */}

          </div>
        )}
      </div>
    </div>
  );
}
