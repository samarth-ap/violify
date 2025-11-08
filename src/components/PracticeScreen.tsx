import { useState, useEffect } from 'react';
import { StopCircle, AlertCircle, Activity, Music2, ArrowLeft, Upload, Play, Pause, Volume2, Minus, Plus, Check, X, Sparkles, Target, Edit2, BookOpen, Save, Clock, Calendar, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface PracticeScreenProps {
  onNavigate: (screen: string) => void;
  selectedLessonId?: number;
}

interface Repetition {
  id: number;
  title: string;
  goal: number;
  current: number;
}

interface Mistake {
  id: number;
  time: string;
  type: 'pitch' | 'rhythm' | 'bow' | 'appaswaram';
  description: string;
  howToFix: string;
  status: 'detected' | 'corrected';
}

interface PracticeSession {
  id: number;
  title: string;
  lessonId?: number;
  lessonTitle?: string;
  startTime: Date;
  duration: number;
  repetitions: Repetition[];
  pitchAccuracy: number;
  rhythmAccuracy: number;
  bowStability: number;
}

export default function PracticeScreen({ onNavigate, selectedLessonId }: PracticeScreenProps) {
  const [isPracticing, setIsPracticing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [pitchAccuracy, setPitchAccuracy] = useState(85);
  const [rhythmAccuracy, setRhythmAccuracy] = useState(92);
  const [bowStability, setBowStability] = useState(88);
  const [showAlert, setShowAlert] = useState(false);
  
  // Session state
  const [sessionTitle, setSessionTitle] = useState('Practice Session');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<number | undefined>(selectedLessonId);
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
  
  // Tuner state
  const [tunerActive, setTunerActive] = useState(false);
  const [currentNote, setCurrentNote] = useState('C');
  const [tuning, setTuning] = useState(0); // -50 to 50 cents
  
  // Recording state
  const [studentRecording, setStudentRecording] = useState<string | null>(null);
  const [teacherRecording, setTeacherRecording] = useState<string | null>(null);
  const [correctedRecording, setCorrectedRecording] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  
  // Mistakes detected
  const [mistakes, setMistakes] = useState<Mistake[]>([
    {
      id: 1,
      time: '0:15',
      type: 'pitch',
      description: 'Pitch slightly flat on Sa',
      howToFix: 'Press finger closer to the bridge and maintain steady bow pressure',
      status: 'detected'
    },
    {
      id: 2,
      time: '0:32',
      type: 'rhythm',
      description: 'Rhythm slightly rushed',
      howToFix: 'Practice with metronome at slower tempo, focus on counting',
      status: 'detected'
    },
    {
      id: 3,
      time: '0:48',
      type: 'bow',
      description: 'Bow pressure uneven',
      howToFix: 'Maintain consistent bow pressure throughout the stroke',
      status: 'detected'
    }
  ]);
  
  // Available lessons for selection
  const lessons = [
    { id: 1, title: 'Varnam in Kalyani' },
    { id: 2, title: 'Alapana Practice' },
    { id: 3, title: 'Kritis - Vatapi Ganapatim' },
    { id: 4, title: 'Bow Technique Exercises' },
    { id: 5, title: 'Thillana in Desh' },
    { id: 6, title: 'Raga Mohanam Scales' },
  ];

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
  
  // Simulate tuner detection
  useEffect(() => {
    if (tunerActive) {
      const interval = setInterval(() => {
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        setCurrentNote(notes[Math.floor(Math.random() * notes.length)]);
        setTuning(Math.floor(Math.random() * 100) - 50);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [tunerActive]);
  
  // Metronome beat cycle
  useEffect(() => {
    if (metronomeActive) {
      const beatsPerMeasure = parseInt(timeSignature.split('/')[0]);
      const interval = setInterval(() => {
        setCurrentBeat((prev) => (prev + 1) % beatsPerMeasure);
        // Play sound (would be implemented with Web Audio API in production)
      }, (60 / bpm) * 1000);
      return () => clearInterval(interval);
    } else {
      setCurrentBeat(0);
    }
  }, [metronomeActive, bpm, timeSignature]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    setIsPracticing(false);
  };
  
  const handleSaveSession = () => {
    const newSession: PracticeSession = {
      id: sessions.length + 1,
      title: sessionTitle,
      lessonId: selectedLesson,
      lessonTitle: lessons.find(l => l.id === selectedLesson)?.title,
      startTime: new Date(),
      duration: timer,
      repetitions: [...repetitions],
      pitchAccuracy: Math.round(pitchAccuracy),
      rhythmAccuracy: Math.round(rhythmAccuracy),
      bowStability: Math.round(bowStability)
    };
    
    setSessions([...sessions, newSession]);
    
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
  
  const handleStudentRecordingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setStudentRecording(e.target.files[0].name);
      if (teacherRecording) {
        setTimeout(() => setAnalysisComplete(true), 2000);
      }
    }
  };
  
  const handleTeacherRecordingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTeacherRecording(e.target.files[0].name);
      if (studentRecording) {
        setTimeout(() => setAnalysisComplete(true), 2000);
      }
    }
  };
  
  const handleCorrectedRecordingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCorrectedRecording(e.target.files[0].name);
    }
  };
  
  const checkCorrectedRecording = () => {
    const isWithinMargin = Math.random() > 0.3;
    
    if (isWithinMargin) {
      setMistakes(mistakes.map(m => m.status === 'detected' ? { ...m, status: 'corrected' as const } : m));
      alert('Great job! All mistakes corrected within acceptable margin.');
    } else {
      alert('Keep practicing! Some aspects need more work.');
    }
  };
  
  const getMistakeIcon = (type: string) => {
    switch (type) {
      case 'pitch': return '🎵';
      case 'rhythm': return '⏱️';
      case 'bow': return '🎻';
      case 'appaswaram': return '⚠️';
      default: return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-8 relative">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-50 to-white border-b border-gray-200 px-6 pt-8 pb-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => onNavigate('home')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors lg:hidden"
            >
              <ArrowLeft size={24} className="text-black" />
            </button>
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
                  <h1 className="text-black font-bold">{sessionTitle}</h1>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors hidden lg:block"
                  >
                    <Edit2 size={16} className="text-gray-600" />
                  </button>
                </div>
              )}
            </div>
            <div className="text-black bg-white border border-gray-200 px-4 py-2 rounded-full">
              {formatTime(timer)}
            </div>
          </div>
          
          {/* Lesson Selection */}
          <div className="flex items-center gap-3">
            <BookOpen className="text-[#FF901F]" size={20} />
            <Select value={selectedLesson?.toString()} onValueChange={(val) => setSelectedLesson(parseInt(val))}>
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Select a lesson (optional)" />
              </SelectTrigger>
              <SelectContent>
                {lessons.map(lesson => (
                  <SelectItem key={lesson.id} value={lesson.id.toString()}>
                    {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="live" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Live Practice</span>
              <span className="sm:hidden">Live</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">AI Comparison</span>
              <span className="sm:hidden">AI</span>
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

                {/* Real-time Metrics */}
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
          
          {/* AI Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-[#FF901F]" size={20} />
                  <span className="font-bold">Violify AI Mistake Detection</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Upload Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#FF901F] transition-colors">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleStudentRecordingUpload}
                      className="hidden"
                      id="student-upload"
                    />
                    <label htmlFor="student-upload" className="cursor-pointer">
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-black mb-1 font-bold">Upload Student Recording</p>
                      {studentRecording ? (
                        <p className="text-sm text-green-600">✓ {studentRecording}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Click to upload</p>
                      )}
                    </label>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#FF901F] transition-colors">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleTeacherRecordingUpload}
                      className="hidden"
                      id="teacher-upload"
                    />
                    <label htmlFor="teacher-upload" className="cursor-pointer">
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-black mb-1 font-bold">Upload Teacher Recording</p>
                      {teacherRecording ? (
                        <p className="text-sm text-green-600">✓ {teacherRecording}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Click to upload</p>
                      )}
                    </label>
                  </div>
                </div>
                
                {/* Analysis Results */}
                {analysisComplete && (
                  <div className="space-y-4 mt-6">
                    <div className="bg-gradient-to-br from-orange-50 to-white p-4 rounded-xl border border-orange-200">
                      <h4 className="text-black font-bold mb-2">Analysis Complete</h4>
                      <p className="text-sm text-gray-600">Found {mistakes.filter(m => m.status === 'detected').length} areas for improvement</p>
                    </div>
                    
                    {/* Mistake List */}
                    {mistakes.map((mistake) => (
                      <Card key={mistake.id} className={`border-2 ${mistake.status === 'corrected' ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">{getMistakeIcon(mistake.type)}</span>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="capitalize">
                                    {mistake.type}
                                  </Badge>
                                  <span className="text-sm text-gray-500">{mistake.time}</span>
                                </div>
                                <p className="text-black mb-2 font-bold">{mistake.description}</p>
                              </div>
                            </div>
                            {mistake.status === 'corrected' ? (
                              <Check className="text-green-600" size={24} />
                            ) : (
                              <X className="text-red-500" size={24} />
                            )}
                          </div>
                          
                          <div className="bg-white rounded-lg p-3 mb-3">
                            <p className="text-sm text-gray-700">
                              <span className="text-[#FF901F] font-bold">💡 How to Fix:</span> {mistake.howToFix}
                            </p>
                          </div>
                          
                          {mistake.status === 'detected' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="w-full bg-[#FF901F] hover:bg-[#E67F0C] text-white">
                                  <Sparkles size={16} className="mr-2" />
                                  View 3D Violin Demo (Violify+)
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="font-bold">3D Violin Demonstration</DialogTitle>
                                  <DialogDescription>
                                    Watch the correct technique in 3D
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl aspect-video flex items-center justify-center">
                                  <div className="text-center">
                                    <div className="text-6xl mb-4">🎻</div>
                                    <p className="text-gray-600">3D Violin demonstration for {mistake.type} correction</p>
                                    <p className="text-sm text-gray-500 mt-2">Interactive 3D model showing proper technique</p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Upload Corrected Recording */}
                    <Card className="border-2 border-[#FF901F] bg-orange-50">
                      <CardContent className="pt-6">
                        <h4 className="text-black mb-3 font-bold">Upload Your Corrected Recording</h4>
                        <div className="border-2 border-dashed border-[#FF901F] rounded-xl p-6 text-center mb-3 bg-white">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={handleCorrectedRecordingUpload}
                            className="hidden"
                            id="corrected-upload"
                          />
                          <label htmlFor="corrected-upload" className="cursor-pointer">
                            <Upload className="mx-auto text-[#FF901F] mb-2" size={32} />
                            <p className="text-black mb-1 font-bold">Upload Corrected Recording</p>
                            {correctedRecording ? (
                              <p className="text-sm text-green-600">✓ {correctedRecording}</p>
                            ) : (
                              <p className="text-sm text-gray-500">Click to upload</p>
                            )}
                          </label>
                        </div>
                        {correctedRecording && (
                          <Button
                            onClick={checkCorrectedRecording}
                            className="w-full bg-[#FF901F] hover:bg-[#E67F0C] text-white"
                          >
                            Check Corrected Recording
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
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
                      onValueChange={(value) => setBpm(value[0])}
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
              
              {/* Tuner */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music2 className="text-[#FF901F]" size={20} />
                    <span className="font-bold">Tuner</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-6xl mb-2 font-bold">{currentNote}</div>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${Math.abs(tuning) < 10 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {tuning > 0 ? '+' : ''}{tuning} cents
                      </div>
                    </div>
                  </div>
                  
                  {/* Tuning Indicator */}
                  <div className="relative h-12 bg-gray-200 rounded-full overflow-hidden">
                    <div className="absolute inset-y-0 left-1/2 w-1 bg-black"></div>
                    <div 
                      className={`absolute inset-y-0 w-2 rounded-full transition-all ${Math.abs(tuning) < 10 ? 'bg-green-500' : 'bg-[#FF901F]'}`}
                      style={{ left: `calc(50% + ${tuning}px)` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 font-bold">
                    <span>Flat</span>
                    <span>Sharp</span>
                  </div>
                  
                  <Button
                    onClick={() => setTunerActive(!tunerActive)}
                    className={`w-full ${tunerActive ? 'bg-red-500 hover:bg-red-600' : 'bg-[#FF901F] hover:bg-[#E67F0C]'} text-white py-6`}
                  >
                    {tunerActive ? (
                      <>
                        <Pause size={20} className="mr-2" />
                        <span className="font-bold">Stop Tuner</span>
                      </>
                    ) : (
                      <>
                        <Play size={20} className="mr-2" />
                        <span className="font-bold">Start Tuner</span>
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
