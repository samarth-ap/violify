import { useState, useEffect, useRef } from 'react';
import { StopCircle, AlertCircle, Activity, Music2, Play, Pause, Volume2, Minus, Plus, Check, Target, Edit2, BookOpen, Save, Clock, Calendar, TrendingUp } from 'lucide-react';
import { useAuth } from './AuthContext';
import { createPracticeSession, getUserLessons } from '../services/firestore';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import SwaraDetector from './SwaraDetector';

interface PracticeScreenProps {
  onNavigate: (screen: string) => void;
  selectedLessonId?: string;
}

interface Repetition {
  id: number;
  title: string;
  goal: number;
  current: number;
}


interface PracticeSession {
  id: string;
  title: string;
  lessonId?: string;
  lessonTitle?: string;
  startTime: Date;
  duration: number;
  repetitions: Repetition[];
  pitchAccuracy: number;
  rhythmAccuracy: number;
  bowStability: number;
}

export default function PracticeScreen({ onNavigate: _onNavigate, selectedLessonId }: PracticeScreenProps) {
  const { user } = useAuth();
  const [isPracticing, setIsPracticing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [pitchAccuracy, setPitchAccuracy] = useState(85);
  const [rhythmAccuracy, setRhythmAccuracy] = useState(92);
  const [bowStability, setBowStability] = useState(88);
  const [showAlert, setShowAlert] = useState(false);
  
  // Session state
  const [sessionTitle, setSessionTitle] = useState('Practice Session');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<string | undefined>(selectedLessonId);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  
  // Repetitions state
  const [repetitions, setRepetitions] = useState<Repetition[]>([]);
  const [showAddRepetition, setShowAddRepetition] = useState(false);
  const [newRepTitle, setNewRepTitle] = useState('');
  const [newRepGoal, setNewRepGoal] = useState(10);
  
  // Metronome state
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [currentBeat, setCurrentBeat] = useState(0);
  const metronomeAudioContextRef = useRef<AudioContext | null>(null);
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Shruti (Drone) state
  const [shrutiActive, setShrutiActive] = useState(false);
  const [shrutiPitch, setShrutiPitch] = useState('C');
  const shrutiAudioContextRef = useRef<AudioContext | null>(null);
  const shrutiOscillatorsRef = useRef<OscillatorNode[]>([]);
  const shrutiGainNodesRef = useRef<GainNode[]>([]);
  const shrutiIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shrutiIframeRef = useRef<HTMLIFrameElement | null>(null);

  // Hardcoded tanpura drone YouTube videos per pitch
  const SHRUTI_VIDEOS: Record<string, { id: string; start?: number }> = {
    'C':  { id: 'mKcAC1Mav_8', start: 314 },
    'C#': { id: 'AJAeFBgM_z0' },
    'D':  { id: 'jpaR2KdQ63I' },
    'D#': { id: 'zoTw4MELlt8' },
    'E':  { id: '0wAKomfxsl0', start: 440 },
    'F':  { id: 'x9O6UAVOOdE', start: 1701 },
    'F#': { id: 'v63I95EIics', start: 417 },
    'G':  { id: 'j1skTY6IdQg', start: 1904 },
    'G#': { id: 'JGq1HPfbcSo' },
    'A':  { id: 'ooiA2yx5Wsg' },
    'A#': { id: 'k0Aa0z_sRdk', start: 562 },
    'B':  { id: '3valEgYPsGw' },
  };

  const currentShrutiVideo = SHRUTI_VIDEOS[shrutiPitch];
  const currentShrutiYtId = currentShrutiVideo?.id ?? null;

  
  // Available lessons for selection
  const [lessons, setLessons] = useState<{ id: string; title: string; }[]>([]);

  useEffect(() => {
    if (!user) return;
    getUserLessons(user.uid, 50).then(fetchedLessons => {
      setLessons(fetchedLessons.map(l => ({ id: l.id, title: l.title })));
    }).catch(console.error);
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPracticing) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
        setPitchAccuracy(Math.min(100, Math.max(60, 85 + Math.random() * 10 - 5)));
        setRhythmAccuracy(Math.min(100, Math.max(70, 92 + Math.random() * 8 - 4)));
        setBowStability(Math.min(100, Math.max(60, 88 + Math.random() * 10 - 5)));
        
        if (Math.random() > 0.95) {
          setShowAlert(true);
          setTimeout(() => setShowAlert(false), 3000);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPracticing]);
  
  // Metronome beat cycle with sound
  useEffect(() => {
    const playMetronomeClick = (isFirstBeat: boolean) => {
      if (!metronomeAudioContextRef.current) {
        metronomeAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = metronomeAudioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // First beat: higher pitch (1200 Hz), other beats: lower pitch (800 Hz)
      oscillator.frequency.value = isFirstBeat ? 1200 : 800;
      oscillator.type = 'sine';

      // First beat: louder, other beats: softer
      gainNode.gain.value = isFirstBeat ? 0.3 : 0.15;

      const now = audioContext.currentTime;
      oscillator.start(now);

      // Quick decay for a sharp click sound
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      oscillator.stop(now + 0.05);
    };

    if (metronomeActive) {
      const beatsPerMeasure = parseInt(timeSignature.split('/')[0]);
      let beatCount = 0;

      // Play first beat immediately when starting
      playMetronomeClick(true);
      setCurrentBeat(0);

      const interval = setInterval(() => {
        beatCount = (beatCount + 1) % beatsPerMeasure;
        setCurrentBeat(beatCount);
        playMetronomeClick(beatCount === 0);
      }, (60 / bpm) * 1000);

      metronomeIntervalRef.current = interval;
      return () => {
        clearInterval(interval);
        metronomeIntervalRef.current = null;
      };
    } else {
      setCurrentBeat(0);
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
        metronomeIntervalRef.current = null;
      }
    }
  }, [metronomeActive, bpm, timeSignature]);

  // Shruti (Drone) - Tanpura-style plucked drone: Sa–Pa–Sa–Sa cycling pattern
  // Only runs synthesis when no YouTube URL is configured for this pitch
  useEffect(() => {
    if (currentShrutiYtId) return; // YouTube takes over — skip synth
    const noteFrequencies: { [key: string]: number } = {
      'C': 130.81, 'C#': 138.59, 'D': 146.83, 'D#': 155.56,
      'E': 164.81, 'F': 174.61, 'F#': 185.00, 'G': 196.00,
      'G#': 207.65, 'A': 220.00, 'A#': 233.08, 'B': 246.94,
    };

    const startShruti = () => {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      shrutiAudioContextRef.current = ctx;

      const saFreq = noteFrequencies[shrutiPitch] || 130.81;
      // Tanpura pattern: Sa (low), Pa (fifth), Sa (high), Sa (high)
      const pattern = [saFreq, saFreq * 1.5, saFreq * 2, saFreq * 2];
      // Harmonic series with jivari-style detuning on upper partials
      const harmonics = [
        { ratio: 1, gain: 0.50, detune: 0 },
        { ratio: 2, gain: 0.28, detune: -4 },
        { ratio: 3, gain: 0.16, detune: 3 },
        { ratio: 4, gain: 0.10, detune: -2 },
        { ratio: 5, gain: 0.06, detune: 5 },
        { ratio: 6, gain: 0.04, detune: -6 },
        { ratio: 7, gain: 0.02, detune: 8 },
      ];
      const noteDuration = 1.7; // seconds per pluck
      let noteIndex = 0;

      const pluck = (freq: number) => {
        if (!shrutiAudioContextRef.current) return;
        const now = ctx.currentTime;
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -18;
        compressor.connect(ctx.destination);

        harmonics.forEach(h => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq * h.ratio;
          osc.detune.value = h.detune;
          // Plucked string envelope: instant attack, slow exponential decay
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(h.gain * 0.35, now + 0.006);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + noteDuration * 2.8);
          osc.connect(gain);
          gain.connect(compressor);
          osc.start(now);
          osc.stop(now + noteDuration * 3);
          shrutiOscillatorsRef.current.push(osc);
        });
      };

      pluck(pattern[noteIndex % pattern.length]);
      noteIndex++;

      shrutiIntervalRef.current = setInterval(() => {
        if (shrutiAudioContextRef.current) {
          pluck(pattern[noteIndex % pattern.length]);
          noteIndex++;
        }
      }, noteDuration * 1000);
    };

    const stopShruti = () => {
      if (shrutiIntervalRef.current) {
        clearInterval(shrutiIntervalRef.current);
        shrutiIntervalRef.current = null;
      }
      shrutiOscillatorsRef.current.forEach(osc => { try { osc.stop(); } catch (_) {} });
      shrutiOscillatorsRef.current = [];
      shrutiGainNodesRef.current = [];
      if (shrutiAudioContextRef.current) {
        shrutiAudioContextRef.current.close();
        shrutiAudioContextRef.current = null;
      }
    };

    if (shrutiActive) {
      startShruti();
    } else {
      stopShruti();
    }
    return () => { stopShruti(); };
  }, [shrutiActive, shrutiPitch, currentShrutiYtId]);

  // Control YouTube iframe play/pause via postMessage (no src reload)
  useEffect(() => {
    if (!currentShrutiYtId) return;
    const iframe = shrutiIframeRef.current;
    if (!iframe?.contentWindow) return;
    const cmd = shrutiActive ? 'playVideo' : 'pauseVideo';
    iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: cmd, args: [] }), '*');
  }, [shrutiActive, currentShrutiYtId]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    setIsPracticing(false);
  };
  
  const handleSaveSession = async () => {
    const durationMinutes = Math.max(1, Math.round(timer / 60));

    if (user) {
      try {
        const sessionId = await createPracticeSession(user.uid, {
          lessonId: selectedLesson,
          date: new Date(),
          duration: durationMinutes,
          mistakesCount: 0,
          correctCount: 0,
          notes: sessionTitle !== 'Practice Session' ? sessionTitle : undefined,
        });
        const newSession: PracticeSession = {
          id: sessionId,
          title: sessionTitle,
          lessonId: selectedLesson,
          lessonTitle: lessons.find(l => l.id === selectedLesson)?.title,
          startTime: new Date(),
          duration: timer,
          repetitions: [...repetitions],
          pitchAccuracy: Math.round(pitchAccuracy),
          rhythmAccuracy: Math.round(rhythmAccuracy),
          bowStability: Math.round(bowStability),
        };
        setSessions([...sessions, newSession]);
      } catch (err) {
        console.error('Failed to save session to Firestore:', err);
      }
    }

    // Reset session
    setTimer(0);
    setRepetitions([]);
    setSessionTitle('Practice Session');
    setSelectedLesson(undefined);

    alert('Practice session saved successfully!');
  };
  
  const handleAddRepetition = () => {
    if (newRepTitle.trim()) {
      const newRep: Repetition = {
        id: repetitions.length + 1,
        title: newRepTitle,
        goal: newRepGoal,
        current: 0
      };
      setRepetitions([...repetitions, newRep]);
      setNewRepTitle('');
      setNewRepGoal(10);
      setShowAddRepetition(false);
    }
  };
  
  const handleRepetitionComplete = (repId: number) => {
    setRepetitions(repetitions.map(rep =>
      rep.id === repId ? { ...rep, current: Math.min(rep.current + 1, rep.goal) } : rep
    ));
  };
  

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-8 relative">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-50 to-white border-b border-gray-200 px-6 pt-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <div>
            <h1 className="text-3xl text-black font-bold">Practice</h1>
            <p className="text-gray-600 mt-2">Record your session, track repetitions, and get AI-powered feedback</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Session Info */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={sessionTitle}
                    onChange={(e) => setSessionTitle(e.target.value)}
                    className="max-w-md"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => setIsEditingTitle(false)}
                    className="bg-[#FF901F] hover:bg-[#E67F0C] text-white"
                  >
                    <Check size={16} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-lg text-black font-semibold">{sessionTitle}</h2>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Edit2 size={16} className="text-gray-600" />
                  </button>
                </div>
              )}
            </div>
            <div className="text-black bg-orange-50 border border-orange-200 px-4 py-2 rounded-full font-semibold">
              {formatTime(timer)}
            </div>
          </div>

          {/* Lesson Selection */}
          <div className="flex items-center gap-3">
            <BookOpen className="text-[#FF901F]" size={20} />
            <Select value={selectedLesson} onValueChange={(val: string) => setSelectedLesson(val)}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Select a lesson (optional)" />
              </SelectTrigger>
              <SelectContent>
                {lessons.length === 0 ? (
                  <SelectItem value="no-lessons" disabled>
                    No lessons yet - Create one in Lesson Library
                  </SelectItem>
                ) : (
                  lessons.map(lesson => (
                    <SelectItem key={lesson.id} value={lesson.id.toString()}>
                      {lesson.title}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="live" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Live Practice</span>
              <span className="sm:hidden">Live</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="text-xs sm:text-sm">Tools</TabsTrigger>
            <TabsTrigger value="history" className="text-xs sm:text-sm">History</TabsTrigger>
          </TabsList>
          
          {/* Live Practice Tab */}
          <TabsContent value="live" className="space-y-6">
            <div className="lg:grid lg:grid-cols-2 lg:gap-6">
              {/* Left Column - Metrics */}
              <div className="lg:col-span-1 space-y-6 mb-6 lg:mb-0">
                {/* Repetitions Management */}
                <Card className="border-2 border-[#FF901F] bg-gradient-to-br from-orange-50 to-white">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-black">
                        <Target className="text-[#FF901F]" size={20} />
                        <span className="font-bold">Line Repetitions</span>
                      </CardTitle>
                      <Dialog open={showAddRepetition} onOpenChange={setShowAddRepetition}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-[#FF901F] hover:bg-[#E67F0C] text-white">
                            + Add Line
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add New Repetition Line</DialogTitle>
                            <DialogDescription>
                              Create a repetition tracker for a specific line or phrase
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="rep-title">Line/Phrase Title</Label>
                              <Input
                                id="rep-title"
                                placeholder="e.g., Pallavi line 1, First Swaram"
                                value={newRepTitle}
                                onChange={(e) => setNewRepTitle(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="rep-goal">Repetition Goal</Label>
                              <Input
                                id="rep-goal"
                                type="number"
                                min="1"
                                value={newRepGoal}
                                onChange={(e) => setNewRepGoal(parseInt(e.target.value) || 10)}
                              />
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              onClick={() => setShowAddRepetition(false)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleAddRepetition}
                              className="flex-1 bg-[#FF901F] hover:bg-[#E67F0C] text-white"
                            >
                              Add Line
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {repetitions.length === 0 ? (
                      <div className="text-center py-6 text-gray-500">
                        <p className="mb-2">No repetition lines added yet</p>
                        <p className="text-sm">Click "+ Add Line" to start tracking</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {repetitions.map(rep => {
                          const progress = (rep.current / rep.goal) * 100;
                          return (
                            <div key={rep.id} className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-black font-bold">{rep.title}</span>
                                <span className="text-sm text-gray-600">
                                  {rep.current}/{rep.goal}
                                </span>
                              </div>
                              <Progress value={progress} className="h-2 mb-2" />
                              <Button
                                onClick={() => handleRepetitionComplete(rep.id)}
                                size="sm"
                                className="w-full bg-[#FF901F] hover:bg-[#E67F0C] text-white"
                                disabled={rep.current >= rep.goal}
                              >
                                <Check size={14} className="mr-1" />
                                Complete Repetition
                              </Button>
                              {rep.current >= rep.goal && (
                                <p className="text-xs text-green-600 text-center mt-1">
                                  ✓ Goal reached!
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Real-time Metrics - Only show when practicing or after practice */}
                {(isPracticing || timer > 0) && (
                  <div className="space-y-4">
                    <h3 className="text-black"><span className="font-bold">Real-Time Metrics</span></h3>
                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Activity className="text-[#FF901F]" size={20} />
                          <span className="text-black font-bold">Pitch Accuracy</span>
                        </div>
                        <span className={`text-lg ${pitchAccuracy >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {Math.round(pitchAccuracy)}%
                        </span>
                      </div>
                      <Progress value={pitchAccuracy} className="h-3" />
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Activity className="text-[#FF901F]" size={20} />
                          <span className="text-black font-bold">Rhythm Accuracy</span>
                        </div>
                        <span className={`text-lg ${rhythmAccuracy >= 85 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {Math.round(rhythmAccuracy)}%
                        </span>
                      </div>
                      <Progress value={rhythmAccuracy} className="h-3" />
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Activity className="text-[#FF901F]" size={20} />
                          <span className="text-black font-bold">Bow Stability</span>
                        </div>
                        <span className="text-lg text-green-600">{Math.round(bowStability)}%</span>
                      </div>
                      <Progress value={bowStability} className="h-3" />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Controls */}
              <div className="lg:col-span-1 space-y-6">
                {showAlert && (
                  <Alert className="bg-red-500/90 border-0 text-white">
                    <AlertCircle className="h-4 w-4 text-white" />
                    <AlertDescription>
                      Appaswaram detected! Check your intonation
                    </AlertDescription>
                  </Alert>
                )}

                {/* Control Buttons */}
                <div className="space-y-3">
                  {!isPracticing ? (
                    <Button
                      onClick={() => setIsPracticing(true)}
                      className="w-full bg-[#FF901F] hover:bg-[#E67F0C] text-white py-8 rounded-2xl shadow-lg shadow-[#FF901F]/20"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <Play size={24} />
                        <span className="text-lg font-bold">Start Practice Session</span>
                      </div>
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleStop}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-8 rounded-2xl"
                      >
                        <div className="flex items-center justify-center gap-3">
                          <StopCircle size={24} />
                          <span className="text-lg font-bold">Stop Session</span>
                        </div>
                      </Button>
                      <p className="text-center text-gray-600 text-sm">
                        Your session is being analyzed in real-time
                      </p>
                    </>
                  )}
                  
                  {timer > 0 && !isPracticing && (
                    <Button
                      onClick={handleSaveSession}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-2xl"
                    >
                      <Save size={20} className="mr-2" />
                      <span className="font-bold">Save Practice Session</span>
                    </Button>
                  )}
                </div>
                
                {/* Live Swara Detector */}
                <SwaraDetector />

                {/* Session Info */}
                {selectedLesson && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#FF901F] rounded-full p-2">
                        <Music2 className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Currently Practicing</p>
                        <h3 className="text-black font-bold">
                          {lessons.find(l => l.id === selectedLesson)?.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Metronome */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="text-[#FF901F]" size={20} />
                    <span className="font-bold">Metronome</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Circular Beat Visualization */}
                  <div className="relative w-64 h-64 mx-auto">
                    {/* Center Circle with BPM */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-black mb-1">{bpm}</div>
                        <p className="text-gray-500 text-sm">BPM</p>
                      </div>
                    </div>
                    
                    {/* Beat Circles */}
                    {Array.from({ length: parseInt(timeSignature.split('/')[0]) }).map((_, i) => {
                      const totalBeats = parseInt(timeSignature.split('/')[0]);
                      const angle = (i * 360) / totalBeats - 90; // Start from top
                      const radius = 100;
                      const x = Math.cos((angle * Math.PI) / 180) * radius;
                      const y = Math.sin((angle * Math.PI) / 180) * radius;
                      const isActive = metronomeActive && currentBeat === i;
                      const isPast = metronomeActive && ((currentBeat > i) || (currentBeat === 0 && i !== 0));
                      const isSam = i === 0; // First beat (Sam in tabla terminology)
                      
                      return (
                        <div
                          key={i}
                          className="absolute"
                          style={{
                            left: '50%',
                            top: '50%',
                            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                          }}
                        >
                          <div className="relative">
                            {/* Outer glow for active beat */}
                            {isActive && (
                              <div className={`absolute inset-0 rounded-full ${isSam ? 'bg-[#FF901F]' : 'bg-orange-300'} opacity-50 animate-ping`} 
                                   style={{ width: '48px', height: '48px', margin: '-8px' }} />
                            )}
                            
                            {/* Beat circle */}
                            <div
                              className={`w-8 h-8 rounded-full border-4 flex items-center justify-center transition-all duration-200 ${
                                isActive
                                  ? isSam
                                    ? 'bg-[#FF901F] border-[#FF901F] scale-150 shadow-lg shadow-[#FF901F]/50'
                                    : 'bg-orange-400 border-orange-400 scale-125 shadow-md'
                                  : isPast
                                  ? 'bg-orange-200 border-orange-300'
                                  : isSam
                                  ? 'bg-white border-[#FF901F]'
                                  : 'bg-white border-gray-300'
                              }`}
                            >
                              <span className={`text-xs font-bold ${
                                isActive ? 'text-white' : isSam && !isPast ? 'text-[#FF901F]' : 'text-gray-600'
                              }`}>
                                {i + 1}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Connecting circle line */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-52 h-52 rounded-full border-2 border-gray-200" />
                    </div>
                  </div>
                  
                  {/* BPM Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setBpm(Math.max(40, bpm - 5))}
                        className="h-12 w-12"
                      >
                        <Minus size={20} />
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setBpm(60)}
                          className="text-sm"
                        >
                          60
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setBpm(120)}
                          className="text-sm"
                        >
                          120
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setBpm(180)}
                          className="text-sm"
                        >
                          180
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setBpm(Math.min(240, bpm + 5))}
                        className="h-12 w-12"
                      >
                        <Plus size={20} />
                      </Button>
                    </div>
                    
                    <Slider
                      value={[bpm]}
                      onValueChange={(value: number[]) => setBpm(value[0])}
                      min={40}
                      max={240}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Time Signature Selector */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Time Signature (Tala)</Label>
                    <Select value={timeSignature} onValueChange={setTimeSignature}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3/4">3/4 - Tisra (3 beats)</SelectItem>
                        <SelectItem value="4/4">4/4 - Chatusra (4 beats)</SelectItem>
                        <SelectItem value="5/4">5/4 - Khanda (5 beats)</SelectItem>
                        <SelectItem value="6/8">6/8 - Rupaka (6 beats)</SelectItem>
                        <SelectItem value="7/4">7/4 - Misra (7 beats)</SelectItem>
                        <SelectItem value="8/4">8/4 - Adi Tala (8 beats)</SelectItem>
                        <SelectItem value="9/8">9/8 - Sankirna (9 beats)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Control Button */}
                  <Button
                    onClick={() => setMetronomeActive(!metronomeActive)}
                    className={`w-full ${metronomeActive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#FF901F] hover:bg-[#E67F0C]'} text-white py-6 rounded-xl`}
                  >
                    {metronomeActive ? (
                      <>
                        <Pause size={20} className="mr-2" />
                        <span className="font-bold">Stop Metronome</span>
                      </>
                    ) : (
                      <>
                        <Play size={20} className="mr-2" />
                        <span className="font-bold">Start Metronome</span>
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Shruti (Drone) */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="text-[#FF901F]" size={20} />
                    <span className="font-bold">Shruti (Drone)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Visual Indicator */}
                  <div className="flex items-center justify-center">
                    <div className="relative w-32 h-32">
                      {/* Pulsing circles when active */}
                      {shrutiActive && (
                        <>
                          <div className="absolute inset-0 rounded-full bg-[#FF901F] opacity-20 animate-ping"></div>
                          <div className="absolute inset-2 rounded-full bg-[#FF901F] opacity-30 animate-pulse"></div>
                        </>
                      )}

                      {/* Center pitch display */}
                      <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-full border-4 transition-all ${
                        shrutiActive
                          ? 'border-[#FF901F] bg-gradient-to-br from-orange-50 to-orange-100'
                          : 'border-gray-300 bg-white'
                      }`}>
                        <div className={`text-4xl font-bold ${shrutiActive ? 'text-[#FF901F]' : 'text-gray-400'}`}>
                          {shrutiPitch}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {shrutiActive ? 'Playing' : 'Idle'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pitch Selection */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Select Pitch (Swara)</Label>
                    <Select value={shrutiPitch} onValueChange={setShrutiPitch}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="C">C (Sa)</SelectItem>
                        <SelectItem value="C#">C# (Komal Re)</SelectItem>
                        <SelectItem value="D">D (Re)</SelectItem>
                        <SelectItem value="D#">D# (Komal Ga)</SelectItem>
                        <SelectItem value="E">E (Ga)</SelectItem>
                        <SelectItem value="F">F (Ma)</SelectItem>
                        <SelectItem value="F#">F# (Tivra Ma)</SelectItem>
                        <SelectItem value="G">G (Pa)</SelectItem>
                        <SelectItem value="G#">G# (Komal Dha)</SelectItem>
                        <SelectItem value="A">A (Dha)</SelectItem>
                        <SelectItem value="A#">A# (Komal Ni)</SelectItem>
                        <SelectItem value="B">B (Ni)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quick pitch buttons */}
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">Quick Select</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map((pitch) => (
                        <Button
                          key={pitch}
                          variant="outline"
                          size="sm"
                          onClick={() => setShrutiPitch(pitch)}
                          className={`${shrutiPitch === pitch ? 'bg-[#FF901F] text-white border-[#FF901F]' : ''}`}
                        >
                          {pitch}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Pre-loaded hidden YouTube audio player — mounted always so no load delay on Start */}
                  {currentShrutiYtId && (() => {
                    const { id, start } = currentShrutiVideo!;
                    const src = `https://www.youtube.com/embed/${id}?enablejsapi=1&autoplay=0&loop=1&playlist=${id}${start ? `&start=${start}` : ''}`;
                    return (
                      <iframe
                        key={src}
                        ref={shrutiIframeRef}
                        src={src}
                        allow="autoplay"
                        title={`Tanpura ${shrutiPitch}`}
                        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
                        onLoad={() => {
                          if (shrutiActive && shrutiIframeRef.current?.contentWindow) {
                            // Delay slightly to let YouTube player JS initialize before accepting commands
                            setTimeout(() => {
                              shrutiIframeRef.current?.contentWindow?.postMessage(
                                JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*'
                              );
                            }, 300);
                          }
                        }}
                      />
                    );
                  })()}

                  {/* Control Button */}
                  <Button
                    onClick={() => setShrutiActive(!shrutiActive)}
                    className={`w-full ${shrutiActive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#FF901F] hover:bg-[#E67F0C]'} text-white py-4 rounded-xl`}
                  >
                    {shrutiActive ? (
                      <>
                        <Pause size={18} className="mr-2" />
                        <span className="font-semibold">Stop Shruti</span>
                      </>
                    ) : (
                      <>
                        <Play size={18} className="mr-2" />
                        <span className="font-semibold">Start Shruti</span>
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="text-[#FF901F]" size={20} />
                  <span className="font-bold">Practice History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <Music2 className="mx-auto text-gray-300 mb-4" size={64} />
                    <p className="text-gray-600 mb-2">No practice sessions yet</p>
                    <p className="text-sm text-gray-500">Complete a practice session to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <Card key={session.id} className="border-2 border-gray-200 bg-gradient-to-br from-white to-orange-50">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-black mb-1 font-bold">{session.title}</h3>
                              {session.lessonTitle && (
                                <p className="text-sm text-gray-600 mb-2">
                                  📚 {session.lessonTitle}
                                </p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  <span>{session.startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock size={14} />
                                  <span>{formatTime(session.duration)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="bg-[#FF901F] rounded-xl p-3">
                              <Music2 className="text-white" size={24} />
                            </div>
                          </div>
                          
                          {/* Metrics */}
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Activity className="text-[#FF901F]" size={14} />
                                <span className="text-xs text-gray-600">Pitch</span>
                              </div>
                              <div className="text-lg text-black font-bold">{session.pitchAccuracy}%</div>
                            </div>
                            
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Activity className="text-[#FF901F]" size={14} />
                                <span className="text-xs text-gray-600">Rhythm</span>
                              </div>
                              <div className="text-lg text-black font-bold">{session.rhythmAccuracy}%</div>
                            </div>
                            
                            <div className="bg-white rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <Activity className="text-[#FF901F]" size={14} />
                                <span className="text-xs text-gray-600">Bow</span>
                              </div>
                              <div className="text-lg text-black font-bold">{session.bowStability}%</div>
                            </div>
                          </div>
                          
                          {/* Repetitions Completed */}
                          {session.repetitions.length > 0 && (
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <h4 className="text-sm text-black mb-3 font-bold">Repetitions Completed:</h4>
                              <div className="space-y-2">
                                {session.repetitions.map((rep) => (
                                  <div key={rep.id} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-700">{rep.title}</span>
                                    <span className="text-[#FF901F] font-bold">
                                      {rep.current}/{rep.goal}
                                      {rep.current >= rep.goal && ' ✓'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Summary Stats */}
            {sessions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-gray-200 bg-gradient-to-br from-orange-50 to-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#FF901F] rounded-full p-3">
                        <Clock className="text-white" size={20} />
                      </div>
                      <div>
                        <div className="text-2xl text-black font-bold">
                          {formatTime(sessions.reduce((total, s) => total + s.duration, 0))}
                        </div>
                        <div className="text-sm text-gray-600">Total Practice Time</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-gray-200 bg-gradient-to-br from-orange-50 to-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#FF901F] rounded-full p-3">
                        <Target className="text-white" size={20} />
                      </div>
                      <div>
                        <div className="text-2xl text-black font-bold">{sessions.length}</div>
                        <div className="text-sm text-gray-600">Sessions Completed</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-gray-200 bg-gradient-to-br from-orange-50 to-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#FF901F] rounded-full p-3">
                        <TrendingUp className="text-white" size={20} />
                      </div>
                      <div>
                        <div className="text-2xl text-black font-bold">
                          {Math.round(
                            sessions.reduce((total, s) => total + (s.pitchAccuracy + s.rhythmAccuracy + s.bowStability) / 3, 0) / sessions.length
                          )}%
                        </div>
                        <div className="text-sm text-gray-600">Avg Accuracy</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
