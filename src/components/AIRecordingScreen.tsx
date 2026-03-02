import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface AIRecordingScreenProps {
  onNavigate: (screen: any) => void;
}

interface Mistake {
  startTime: number; // in seconds
  endTime: number;
  issue: string;
  suggestion: string;
}

export default function AIRecordingScreen({ onNavigate }: AIRecordingScreenProps) {
  // Generate demo waveform
  const generateDemoWaveform = (numBars: number = 200) => {
    return Array.from({ length: numBars }, () => Math.random() * 90 + 10);
  };

  const [step, setStep] = useState<'upload' | 'recording' | 'playback'>('upload');
  const [teacherAudioFile, setTeacherAudioFile] = useState<File | null>(null);
  const [teacherAudioUrl, setTeacherAudioUrl] = useState<string | null>(null);
  const [studentAudioUrl, setStudentAudioUrl] = useState<string | null>(null);

  // Waveform data - initialize with demo data for testing
  const [teacherWaveform, setTeacherWaveform] = useState<number[]>([]);
  const [studentWaveform, setStudentWaveform] = useState<number[]>([]);

  // Recording states
  const [isRecordingTeacher, setIsRecordingTeacher] = useState(false);
  const [isRecordingStudent, setIsRecordingStudent] = useState(false);
  const [hasStudentRecording, setHasStudentRecording] = useState(false);

  // Playback states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(20); // Demo duration
  const [showMistakePopup, setShowMistakePopup] = useState(false);
  const [currentMistake, setCurrentMistake] = useState<Mistake | null>(null);

  // Demo mistakes data
  const [mistakes] = useState<Mistake[]>([
    { startTime: 3, endTime: 5, issue: 'Pitch slightly flat', suggestion: 'Focus on bow pressure and finger placement' },
    { startTime: 9, endTime: 11, issue: 'Timing rushed', suggestion: 'Practice with metronome at slower tempo' },
    { startTime: 15, endTime: 17, issue: 'Vibrato inconsistent', suggestion: 'Maintain steady wrist motion' }
  ]);

  const teacherMediaRecorder = useRef<MediaRecorder | null>(null);
  const studentMediaRecorder = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackInterval = useRef<NodeJS.Timeout | null>(null);

  // Generate waveform from audio file
  const generateWaveform = async (audioFile: File): Promise<number[]> => {
    return new Promise((resolve) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const rawData = audioBuffer.getChannelData(0);
          const samples = 200;
          const blockSize = Math.floor(rawData.length / samples);
          const waveformData: number[] = [];

          for (let i = 0; i < samples; i++) {
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
              sum += Math.abs(rawData[i * blockSize + j]);
            }
            waveformData.push(sum / blockSize);
          }

          const max = Math.max(...waveformData);
          const normalized = waveformData.map(val => (val / max) * 100);
          resolve(normalized);
        } catch (err) {
          console.error('Error generating waveform:', err);
          resolve(generateDemoWaveform());
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

      const waveform = await generateWaveform(file);
      setTeacherWaveform(waveform);

      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      setStep('recording');
    }
  };

  // Toggle teacher recording
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

          const waveform = await generateWaveform(file);
          setTeacherWaveform(waveform);

          const audio = new Audio(url);
          audio.addEventListener('loadedmetadata', () => {
            setDuration(audio.duration);
          });

          stream.getTracks().forEach(track => track.stop());
          setStep('recording');
        };

        mediaRecorder.start();
        setIsRecordingTeacher(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please check permissions.');
      }
    }
  };

  // Toggle student recording
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
          setStudentAudioUrl(url);

          const waveform = await generateWaveform(file);
          setStudentWaveform(waveform);

          // Ensure both waveforms have the same length
          if (waveform.length !== teacherWaveform.length) {
            const targetLength = teacherWaveform.length;
            const adjustedWaveform = Array.from({ length: targetLength }, (_, i) => {
              const idx = Math.floor((i / targetLength) * waveform.length);
              return waveform[idx] || 0;
            });
            setStudentWaveform(adjustedWaveform);
          }

          setHasStudentRecording(true);
          stream.getTracks().forEach(track => track.stop());
          setStep('playback');
        };

        mediaRecorder.start();
        setIsRecordingStudent(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please check permissions.');
      }
    }
  };

  // Playback controls
  const togglePlayback = () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioRef.current?.pause();
      if (playbackInterval.current) {
        clearInterval(playbackInterval.current);
      }
    } else {
      setIsPlaying(true);
      if (!audioRef.current && teacherAudioUrl) {
        audioRef.current = new Audio(teacherAudioUrl);
      }
      audioRef.current?.play();

      playbackInterval.current = setInterval(() => {
        if (audioRef.current) {
          const time = audioRef.current.currentTime;
          setCurrentTime(time);

          // Check if we're in a mistake region
          const mistake = mistakes.find(m => time >= m.startTime && time <= m.endTime);
          if (mistake && !showMistakePopup) {
            setCurrentMistake(mistake);
            setShowMistakePopup(true);
            audioRef.current.pause();
            setIsPlaying(false);
            if (playbackInterval.current) {
              clearInterval(playbackInterval.current);
            }
          }

          if (time >= duration) {
            setIsPlaying(false);
            setCurrentTime(0);
            if (playbackInterval.current) {
              clearInterval(playbackInterval.current);
            }
          }
        }
      }, 100);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const closeMistakePopup = () => {
    setShowMistakePopup(false);
    setCurrentMistake(null);
  };

  const reRecordMistake = () => {
    setShowMistakePopup(false);
    setCurrentMistake(null);
    // In production, this would allow re-recording just that section
    toggleStudentRecording();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate timeline markers
  const getTimelineMarkers = () => {
    const markers = [];
    const interval = duration > 60 ? 10 : 5;
    for (let i = 0; i <= duration; i += interval) {
      markers.push(i);
    }
    return markers;
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 via-white to-orange-50 dark:from-purple-950/20 dark:via-background dark:to-orange-950/20 border-b border-border px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Recording Analyzer</h1>
          <p className="text-sm text-muted-foreground mt-1">Compare your playing with teacher recordings</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Step 1: Upload/Record Teacher Audio */}
        {step === 'upload' && (
          <Card className="border-2 border-dashed border-primary/30 bg-card">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="text-center mb-4">
                <h2 className="text-base sm:text-lg font-semibold text-foreground mb-2">Teacher's Reference Recording</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Upload or record your teacher's reference to begin
                </p>
              </div>

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
                  className="w-full h-20 sm:h-24 border-2 border-dashed hover:border-primary hover:bg-accent transition-colors"
                  onClick={() => document.getElementById('teacher-upload')?.click()}
                  type="button"
                >
                  <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                    <Upload size={20} className="text-primary sm:w-6 sm:h-6" />
                    <span className="text-sm sm:text-base">Upload Audio File</span>
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
                className={`w-full h-20 sm:h-24 ${
                  isRecordingTeacher
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-primary hover:bg-primary/90'
                }`}
              >
                <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                  {isRecordingTeacher ? (
                    <>
                      <Square size={20} className="fill-white sm:w-6 sm:h-6" />
                      <span className="text-sm sm:text-base">Stop Recording</span>
                      <span className="text-xs opacity-90 animate-pulse">Recording...</span>
                    </>
                  ) : (
                    <>
                      <Mic size={20} className="sm:w-6 sm:h-6" />
                      <span className="text-sm sm:text-base">Record Now</span>
                      <span className="text-xs opacity-90">Tap to start recording</span>
                    </>
                  )}
                </div>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Record Student Audio */}
        {step === 'recording' && !hasStudentRecording && (
          <Card className="bg-card">
            <CardContent className="p-4 sm:p-6 space-y-6">
              {/* Teacher Waveform Preview */}
              <div>
                <h3 className="text-xs sm:text-sm font-medium text-muted-foreground mb-3">Teacher's Recording</h3>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-24 flex items-end gap-0.5 overflow-x-auto">
                  {teacherWaveform.length > 0 ? (
                    teacherWaveform.map((height, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-[#FF901F]/60 to-orange-400/60 rounded-t flex-shrink-0"
                        style={{ height: `${Math.max(height, 10)}%` }}
                      />
                    ))
                  ) : (
                    <div className="w-full flex items-center justify-center h-full text-muted-foreground text-sm">
                      Generating waveform...
                    </div>
                  )}
                </div>
              </div>

              {/* Student Recording Section */}
              <div className="text-center py-6 sm:py-8">
                <h2 className="text-base sm:text-lg font-semibold text-foreground mb-2">Record Your Performance</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                  Now play the same piece and record yourself
                </p>
                <Button
                  onClick={toggleStudentRecording}
                  size="lg"
                  className={`${
                    isRecordingStudent
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-gradient-to-r from-purple-500 to-[#FF901F]'
                  } text-white px-6 sm:px-8 w-full sm:w-auto`}
                >
                  {isRecordingStudent ? (
                    <>
                      <Square size={18} className="mr-2 fill-white sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Stop Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic size={18} className="mr-2 sm:w-5 sm:h-5" />
                      <span className="text-sm sm:text-base">Start Recording</span>
                    </>
                  )}
                </Button>
                {isRecordingStudent && (
                  <p className="text-xs sm:text-sm text-red-500 mt-4 animate-pulse">Recording in progress...</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Playback with Overlapped Waveforms */}
        {step === 'playback' && hasStudentRecording && (
          <Card className="bg-card">
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4 gap-3">
                  <h2 className="text-base sm:text-lg font-semibold text-foreground">Recording Analysis</h2>
                  <div className="text-xs sm:text-sm">
                    <span className="text-red-500 font-medium whitespace-nowrap">{mistakes.length} mistakes</span>
                  </div>
                </div>

                {/* Overlapped Waveform Display */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-border overflow-hidden">
                  {/* Waveform Container */}
                  <div className="relative bg-gray-50 dark:bg-gray-800/50 p-3 sm:p-6 pb-3">
                    {/* Timeline at top */}
                    <div className="flex justify-between mb-2 px-1 text-[10px] sm:text-xs">
                      {getTimelineMarkers().map((time, i) => (
                        <span key={i} className="text-muted-foreground">
                          {formatTime(time)}
                        </span>
                      ))}
                    </div>

                    {/* Main Waveform - Overlapped */}
                    <div className="relative h-32 sm:h-48 mb-3 overflow-hidden">
                      <div className="absolute inset-0">
                        <div className="h-full flex items-center gap-px">
                          {teacherWaveform.length > 0 && studentWaveform.length > 0 ? (
                            teacherWaveform.map((height, i) => {
                              const studentHeight = studentWaveform[i] || 0;
                              const time = (i / teacherWaveform.length) * duration;
                              const isInMistake = mistakes.some(m => time >= m.startTime && time <= m.endTime);

                              return (
                                <div key={i} className="flex-1 flex flex-col items-center justify-center gap-px h-full min-w-[2px]">
                                  {/* Teacher waveform (orange, top) */}
                                  <div
                                    className={`w-full ${isInMistake ? 'bg-red-400' : 'bg-gradient-to-t from-[#FF901F] to-orange-400'} transition-all rounded-t-sm`}
                                    style={{ height: `${Math.max(height, 5)}%` }}
                                  />
                                  {/* Student waveform (purple, bottom) */}
                                  <div
                                    className={`w-full ${isInMistake ? 'bg-red-600' : 'bg-gradient-to-b from-purple-600 to-purple-400'} transition-all rounded-b-sm`}
                                    style={{ height: `${Math.max(studentHeight, 5)}%` }}
                                  />
                                </div>
                              );
                            })
                          ) : (
                            <div className="w-full flex items-center justify-center h-full text-muted-foreground text-sm">
                              Loading waveforms...
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Current time indicator */}
                      {teacherWaveform.length > 0 && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-foreground z-10 transition-all pointer-events-none"
                          style={{ left: `${(currentTime / duration) * 100}%` }}
                        >
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-foreground rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Scrubber bar */}
                    <div
                      className="h-10 sm:h-12 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer relative overflow-hidden touch-manipulation"
                      onClick={handleSeek}
                    >
                      {/* Mistake indicators on scrubber */}
                      {mistakes.map((mistake, i) => (
                        <div
                          key={i}
                          className="absolute top-0 bottom-0 bg-red-500/40"
                          style={{
                            left: `${(mistake.startTime / duration) * 100}%`,
                            width: `${((mistake.endTime - mistake.startTime) / duration) * 100}%`
                          }}
                        />
                      ))}

                      {/* Waveform preview on scrubber */}
                      {teacherWaveform.length > 0 && (
                        <div className="absolute inset-0 flex items-center gap-px px-1">
                          {teacherWaveform.map((height, i) => (
                            <div
                              key={i}
                              className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full min-w-[1px]"
                              style={{ height: `${Math.max(height * 0.3, 20)}%` }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Current position on scrubber */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 sm:w-1 bg-foreground pointer-events-none"
                        style={{ left: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>

                    {/* Time display */}
                    <div className="flex justify-between items-center mt-3 px-1">
                      <span className="text-sm font-mono text-foreground">{formatTime(currentTime)}</span>
                      <span className="text-sm font-mono text-muted-foreground">{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="p-3 sm:p-4 bg-card border-t border-border">
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={togglePlayback}
                        size="lg"
                        className="bg-gradient-to-r from-purple-500 to-[#FF901F] text-white px-6 sm:px-8 w-full sm:w-auto"
                      >
                        {isPlaying ? (
                          <>
                            <Pause size={18} className="mr-2 sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base">Pause</span>
                          </>
                        ) : (
                          <>
                            <Play size={18} className="mr-2 sm:w-5 sm:h-5" />
                            <span className="text-sm sm:text-base">Play</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-3 sm:gap-6 mt-4 flex-wrap">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-t from-[#FF901F] to-orange-400 rounded" />
                    <span className="text-xs text-muted-foreground">Teacher</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-t from-purple-600 to-purple-400 rounded" />
                    <span className="text-xs text-muted-foreground">You</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded" />
                    <span className="text-xs text-muted-foreground">Mistake</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => {
                    setStep('upload');
                    setTeacherAudioFile(null);
                    setTeacherAudioUrl(null);
                    setStudentAudioUrl(null);
                    setTeacherWaveform([]);
                    setStudentWaveform([]);
                    setHasStudentRecording(false);
                    setCurrentTime(0);
                  }}
                  variant="outline"
                  className="flex-1 w-full"
                >
                  New Analysis
                </Button>
                <Button
                  onClick={() => {
                    setStep('recording');
                    setHasStudentRecording(false);
                    setStudentAudioUrl(null);
                    setStudentWaveform([]);
                    setCurrentTime(0);
                  }}
                  className="flex-1 w-full bg-gradient-to-r from-purple-500 to-[#FF901F] text-white"
                >
                  Record Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Mistake Popup */}
      {showMistakePopup && currentMistake && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-card mx-4">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">Mistake Detected</h3>
                  </div>
                  <p className="text-sm text-foreground font-medium mb-2">{currentMistake.issue}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{currentMistake.suggestion}</p>
                </div>
                <button
                  onClick={closeMistakePopup}
                  className="text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={closeMistakePopup}
                  variant="outline"
                  className="flex-1 w-full"
                >
                  Continue
                </Button>
                <Button
                  onClick={reRecordMistake}
                  className="flex-1 w-full bg-red-500 hover:bg-red-600 text-white"
                >
                  <Mic size={16} className="mr-2" />
                  Re-record
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
