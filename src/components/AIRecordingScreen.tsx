import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mic, Square, Play, Pause, Upload, FileAudio, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface AIRecordingScreenProps {
  onNavigate: (screen: any) => void;
}

export default function AIRecordingScreen({ onNavigate }: AIRecordingScreenProps) {
  const [step, setStep] = useState<'upload' | 'editor' | 'analysis'>('analysis');
  const [teacherAudioFile, setTeacherAudioFile] = useState<File | null>(null);
  const [teacherAudioUrl, setTeacherAudioUrl] = useState<string | null>(null);

  // Generate demo waveform data for testing
  const generateDemoWaveform = () => {
    return Array.from({ length: 60 }, () => Math.random() * 90 + 10);
  };

  const [teacherWaveform, setTeacherWaveform] = useState<number[]>(generateDemoWaveform());
  const [studentWaveform, setStudentWaveform] = useState<number[]>(generateDemoWaveform());
  const [isRecordingTeacher, setIsRecordingTeacher] = useState(false);
  const [isRecordingStudent, setIsRecordingStudent] = useState(false);
  const [hasStudentRecording, setHasStudentRecording] = useState(false);
  const [isPlayingTeacher, setIsPlayingTeacher] = useState(false);
  const [isPlayingStudent, setIsPlayingStudent] = useState(false);
  const [teacherDuration, setTeacherDuration] = useState(0);
  const [studentDuration, setStudentDuration] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<any>({
    overallScore: 78,
    differences: [
      {
        timestamp: '0:12',
        issue: 'Pitch slightly flat',
        suggestion: 'Focus on bow pressure and finger placement on the D string',
        severity: 'medium'
      },
      {
        timestamp: '0:24',
        issue: 'Timing rushed',
        suggestion: 'Practice with metronome at slower tempo, then gradually increase',
        severity: 'low'
      },
      {
        timestamp: '0:38',
        issue: 'Vibrato inconsistent',
        suggestion: 'Work on maintaining steady wrist motion throughout the phrase',
        severity: 'high'
      }
    ]
  });

  const teacherMediaRecorder = useRef<MediaRecorder | null>(null);
  const studentMediaRecorder = useRef<MediaRecorder | null>(null);
  const teacherAudioRef = useRef<HTMLAudioElement | null>(null);
  const studentAudioRef = useRef<HTMLAudioElement | null>(null);
  const teacherAudioContext = useRef<AudioContext | null>(null);
  const studentAudioContext = useRef<AudioContext | null>(null);

  // Generate mock waveform from audio
  const generateWaveform = async (audioFile: File): Promise<number[]> => {
    return new Promise((resolve) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const rawData = audioBuffer.getChannelData(0);
          const samples = 60; // Number of bars in waveform (reduced for visibility)
          const blockSize = Math.floor(rawData.length / samples);
          const waveformData: number[] = [];

          for (let i = 0; i < samples; i++) {
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
              sum += Math.abs(rawData[i * blockSize + j]);
            }
            waveformData.push(sum / blockSize);
          }

          // Normalize
          const max = Math.max(...waveformData);
          const normalized = waveformData.map(val => (val / max) * 100);
          resolve(normalized);
        } catch (err) {
          console.error('Error generating waveform:', err);
          // Generate mock data on error
          resolve(Array.from({ length: 60 }, () => Math.random() * 100));
        }
      };

      reader.readAsArrayBuffer(audioFile);
    });
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTeacherAudioFile(file);
      const url = URL.createObjectURL(file);
      setTeacherAudioUrl(url);

      // Generate waveform
      const waveform = await generateWaveform(file);
      setTeacherWaveform(waveform);

      // Get duration
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        setTeacherDuration(audio.duration);
      });

      setStep('editor');
    }
  };

  // Start/stop teacher recording
  const toggleTeacherRecording = async () => {
    if (isRecordingTeacher) {
      teacherMediaRecorder.current?.stop();
      setIsRecordingTeacher(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        teacherMediaRecorder.current = mediaRecorder;
        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const file = new File([blob], 'teacher-recording.webm', { type: 'audio/webm' });
          setTeacherAudioFile(file);
          const url = URL.createObjectURL(blob);
          setTeacherAudioUrl(url);

          // Generate waveform
          const waveform = await generateWaveform(file);
          setTeacherWaveform(waveform);

          // Get duration
          const audio = new Audio(url);
          audio.addEventListener('loadedmetadata', () => {
            setTeacherDuration(audio.duration);
          });

          stream.getTracks().forEach(track => track.stop());
          setStep('editor');
        };

        mediaRecorder.start();
        setIsRecordingTeacher(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please check permissions.');
      }
    }
  };

  // Start/stop student recording
  const toggleStudentRecording = async () => {
    if (isRecordingStudent) {
      studentMediaRecorder.current?.stop();
      setIsRecordingStudent(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        studentMediaRecorder.current = mediaRecorder;
        const chunks: BlobPart[] = [];

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const file = new File([blob], 'student-recording.webm', { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);

          // Generate waveform
          const waveform = await generateWaveform(file);
          setStudentWaveform(waveform);

          // Get duration
          const audio = new Audio(url);
          audio.addEventListener('loadedmetadata', () => {
            setStudentDuration(audio.duration);
          });

          studentAudioRef.current = audio;
          setHasStudentRecording(true);
          stream.getTracks().forEach(track => track.stop());

          // Trigger AI analysis
          analyzeRecordings();
        };

        mediaRecorder.start();
        setIsRecordingStudent(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please check permissions.');
      }
    }
  };

  // Analyze recordings
  const analyzeRecordings = () => {
    // Mock AI analysis - in production, this would call an AI API
    setTimeout(() => {
      setAiAnalysis({
        overallScore: 78,
        differences: [
          {
            timestamp: '0:12',
            issue: 'Pitch slightly flat',
            suggestion: 'Focus on bow pressure and finger placement on the D string',
            severity: 'medium'
          },
          {
            timestamp: '0:24',
            issue: 'Timing rushed',
            suggestion: 'Practice with metronome at slower tempo, then gradually increase',
            severity: 'low'
          },
          {
            timestamp: '0:38',
            issue: 'Vibrato inconsistent',
            suggestion: 'Work on maintaining steady wrist motion throughout the phrase',
            severity: 'high'
          }
        ]
      });
      setStep('analysis');
    }, 1500);
  };

  // Toggle playback
  const togglePlayTeacher = () => {
    if (teacherAudioUrl) {
      if (isPlayingTeacher) {
        teacherAudioRef.current?.pause();
        setIsPlayingTeacher(false);
      } else {
        if (!teacherAudioRef.current) {
          teacherAudioRef.current = new Audio(teacherAudioUrl);
        }
        teacherAudioRef.current.play();
        setIsPlayingTeacher(true);
        teacherAudioRef.current.onended = () => setIsPlayingTeacher(false);
      }
    }
  };

  const togglePlayStudent = () => {
    if (studentAudioRef.current) {
      if (isPlayingStudent) {
        studentAudioRef.current.pause();
        setIsPlayingStudent(false);
      } else {
        studentAudioRef.current.play();
        setIsPlayingStudent(true);
        studentAudioRef.current.onended = () => setIsPlayingStudent(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-orange-50 dark:from-purple-950/20 dark:via-background dark:to-orange-950/20 border-b border-border px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => onNavigate('lessons')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-purple-500 to-[#FF901F] rounded-xl p-2.5">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">AI Recording Analyzer</h1>
              <p className="text-sm text-muted-foreground">Compare your playing with teacher recordings</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Step 1: Upload/Record Teacher Audio */}
        {step === 'upload' && (
          <Card className="border-2 border-dashed border-primary/30 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileAudio className="text-primary" size={20} />
                Teacher Recording
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Upload or record your teacher's reference recording to begin analysis
              </p>

              {/* Upload Button */}
              <label className="block">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="teacher-upload"
                />
                <Button
                  variant="outline"
                  className="w-full h-24 border-2 border-dashed hover:border-primary hover:bg-accent transition-colors"
                  onClick={() => document.getElementById('teacher-upload')?.click()}
                  type="button"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload size={24} className="text-primary" />
                    <span>Upload Audio File</span>
                    <span className="text-xs text-muted-foreground">MP3, WAV, or M4A</span>
                  </div>
                </Button>
              </label>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Record Button */}
              <Button
                onClick={toggleTeacherRecording}
                className={`w-full h-24 ${
                  isRecordingTeacher
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  {isRecordingTeacher ? (
                    <>
                      <Square size={24} className="fill-white" />
                      <span>Stop Recording</span>
                      <span className="text-xs opacity-90 animate-pulse">Recording...</span>
                    </>
                  ) : (
                    <>
                      <Mic size={24} />
                      <span>Record Now</span>
                      <span className="text-xs opacity-90">Tap to start recording</span>
                    </>
                  )}
                </div>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Editor with Waveforms */}
        {step === 'editor' && (
          <>
            {/* Teacher Waveform */}
            <Card className="border-primary/30 bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">Teacher Recording</CardTitle>
                  <span className="text-sm text-muted-foreground">{formatTime(teacherDuration)}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Waveform Visualization */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-32 flex items-end gap-1 overflow-x-auto">
                  {teacherWaveform.length > 0 ? (
                    teacherWaveform.map((height, i) => (
                      <div
                        key={i}
                        className="w-3 bg-gradient-to-t from-[#FF901F] to-orange-400 rounded-t transition-all flex-shrink-0"
                        style={{ height: `${Math.max(height, 15)}%` }}
                      />
                    ))
                  ) : (
                    <div className="w-full flex items-center justify-center h-full text-muted-foreground text-sm">
                      Loading waveform...
                    </div>
                  )}
                </div>

                {/* Play Controls */}
                <Button
                  onClick={togglePlayTeacher}
                  variant="outline"
                  className="w-full"
                >
                  {isPlayingTeacher ? (
                    <>
                      <Pause size={18} className="mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play size={18} className="mr-2" />
                      Play Teacher Recording
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Student Recording Section */}
            <Card className="border-purple-500/30 bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Your Recording</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!hasStudentRecording ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-6">
                      Now record yourself playing the same piece
                    </p>
                    <Button
                      onClick={toggleStudentRecording}
                      size="lg"
                      className={`${
                        isRecordingStudent
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-gradient-to-r from-purple-500 to-[#FF901F]'
                      } text-white px-8`}
                    >
                      {isRecordingStudent ? (
                        <>
                          <Square size={20} className="mr-2 fill-white" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic size={20} className="mr-2" />
                          Start Recording
                        </>
                      )}
                    </Button>
                    {isRecordingStudent && (
                      <p className="text-sm text-red-500 mt-4 animate-pulse">Recording in progress...</p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Student Waveform */}
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-32 flex items-end gap-1 overflow-x-auto">
                      {studentWaveform.length > 0 ? (
                        studentWaveform.map((height, i) => (
                          <div
                            key={i}
                            className="w-3 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all flex-shrink-0"
                            style={{ height: `${Math.max(height, 15)}%` }}
                          />
                        ))
                      ) : (
                        <div className="w-full flex items-center justify-center h-full text-muted-foreground text-sm">
                          Loading waveform...
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatTime(studentDuration)}</span>
                      <Button
                        onClick={togglePlayStudent}
                        variant="outline"
                        size="sm"
                      >
                        {isPlayingStudent ? (
                          <>
                            <Pause size={16} className="mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play size={16} className="mr-2" />
                            Play
                          </>
                        )}
                      </Button>
                    </div>

                    <Button
                      onClick={toggleStudentRecording}
                      variant="outline"
                      className="w-full"
                    >
                      <Mic size={18} className="mr-2" />
                      Record Again
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Step 3: AI Analysis Results */}
        {step === 'analysis' && aiAnalysis && (
          <>
            {/* Overall Score */}
            <Card className="border-2 border-primary bg-gradient-to-br from-purple-50 to-orange-50 dark:from-purple-950/20 dark:to-orange-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Sparkles className="text-primary" size={20} />
                  Analysis Complete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {aiAnalysis.overallScore}%
                  </div>
                  <p className="text-muted-foreground">Overall Match Score</p>
                </div>
              </CardContent>
            </Card>

            {/* Waveform Comparison */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Waveform Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Teacher Waveform */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Teacher (Orange)</p>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 h-24 flex items-end gap-1 overflow-x-auto">
                      {teacherWaveform.map((height, i) => (
                        <div
                          key={i}
                          className="w-3 bg-gradient-to-t from-[#FF901F] to-orange-400 rounded-t flex-shrink-0"
                          style={{ height: `${Math.max(height, 15)}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Student Waveform */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Your Recording (Purple)</p>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 h-24 flex items-end gap-1 overflow-x-auto">
                      {studentWaveform.map((height, i) => (
                        <div
                          key={i}
                          className="w-3 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t flex-shrink-0"
                          style={{ height: `${Math.max(height, 15)}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Feedback */}
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Detailed Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiAnalysis.differences.map((diff: any, i: number) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border-l-4 ${
                        diff.severity === 'high'
                          ? 'bg-red-50 dark:bg-red-950/20 border-red-500'
                          : diff.severity === 'medium'
                          ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500'
                          : 'bg-blue-50 dark:bg-blue-950/20 border-blue-500'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded">
                          {diff.timestamp}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            diff.severity === 'high'
                              ? 'bg-red-500 text-white'
                              : diff.severity === 'medium'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          {diff.severity}
                        </span>
                      </div>
                      <p className="font-medium text-foreground mb-2">{diff.issue}</p>
                      <p className="text-sm text-muted-foreground">{diff.suggestion}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setStep('editor');
                  setHasStudentRecording(false);
                  setAiAnalysis(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Try Again
              </Button>
              <Button
                onClick={() => {
                  setStep('upload');
                  setTeacherAudioFile(null);
                  setTeacherAudioUrl(null);
                  setTeacherWaveform([]);
                  setStudentWaveform([]);
                  setHasStudentRecording(false);
                  setAiAnalysis(null);
                }}
                className="flex-1 bg-gradient-to-r from-purple-500 to-[#FF901F] text-white"
              >
                New Analysis
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
