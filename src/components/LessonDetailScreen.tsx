import { useState, useEffect } from 'react';
import { ArrowLeft, Play, FileText, Calendar, Music, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';
import { useAuth } from './AuthContext';
import { getUserLessons, updateLesson } from '../services/firestore';
import { Lesson } from '../types/database';

interface LessonDetailScreenProps {
  onNavigate: (screen: string) => void;
  lessonId?: string;
}

export default function LessonDetailScreen({ onNavigate, lessonId }: LessonDetailScreenProps) {
  const { user } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [selfAssessedProgress, setSelfAssessedProgress] = useState(0);
  const [personalNotes, setPersonalNotes] = useState('');
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  useEffect(() => {
    if (!user || !lessonId) { setLoading(false); return; }
    getUserLessons(user.uid, 100).then(lessons => {
      const found = lessons.find(l => l.id === lessonId);
      if (found) {
        setLesson(found);
        setSelfAssessedProgress(found.progress ?? 0);
        setPersonalNotes(found.notes ?? '');
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, [user, lessonId]);

  const handleSaveProgress = async () => {
    if (!user || !lesson) return;
    setIsSavingProgress(true);
    try {
      const updates: any = { progress: selfAssessedProgress };
      if (selfAssessedProgress === 100) updates.isCompleted = true;
      if (personalNotes.trim()) updates.notes = personalNotes.trim();
      await updateLesson(user.uid, lesson.id, updates);
      setLesson({ ...lesson, progress: selfAssessedProgress, isCompleted: selfAssessedProgress === 100, notes: personalNotes });
    } catch (err) {
      console.error('Failed to save progress:', err);
    } finally {
      setIsSavingProgress(false);
    }
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      Varnam: 'bg-orange-100 text-orange-700 border-orange-200',
      Alapana: 'bg-blue-100 text-blue-700 border-blue-200',
      Kriti: 'bg-green-100 text-green-700 border-green-200',
      Technique: 'bg-[#FF901F] text-white border-[#FF901F]',
      Thillana: 'bg-pink-100 text-pink-700 border-pink-200',
      Scales: 'bg-teal-100 text-teal-700 border-teal-200',
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getDifficultyColor = (difficulty?: string) => {
    const colors: Record<string, string> = {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-red-100 text-red-700',
    };
    return colors[difficulty || ''] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF901F]" size={32} />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600">Lesson not found.</p>
        <Button onClick={() => onNavigate('lessons')} variant="outline">
          <ArrowLeft size={16} className="mr-2" /> Back to Lessons
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-50 to-white border-b border-gray-200 px-6 pt-8 pb-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => onNavigate('lessons')}
            className="flex items-center gap-2 text-gray-600 hover:text-black mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Lessons</span>
          </button>

          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {lesson.category && (
                  <Badge className={getCategoryColor(lesson.category)}>
                    {lesson.category}
                  </Badge>
                )}
                {lesson.difficulty && (
                  <Badge className={getDifficultyColor(lesson.difficulty)}>
                    {lesson.difficulty.charAt(0).toUpperCase() + lesson.difficulty.slice(1)}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-black mb-2">{lesson.title}</h1>
              {lesson.description && (
                <p className="text-gray-600 mb-4">{lesson.description}</p>
              )}

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {lesson.ragam && (
                  <span className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                    🎵 Ragam: {lesson.ragam}
                  </span>
                )}
                {lesson.thalam && (
                  <span className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                    🥁 Thalam: {lesson.thalam}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-[#FF901F] rounded-xl p-4 flex-shrink-0 ml-4">
              <Music className="text-white" size={32} />
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span>Created: {lesson.createdAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Self-Assessed Progress */}
        <Card className="border-2 border-[#FF901F] bg-gradient-to-br from-orange-50 to-white">
          <CardHeader>
            <CardTitle className="text-black font-bold">Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-5xl text-[#FF901F] mb-2 font-bold">
                {selfAssessedProgress}%
              </div>
              <p className="text-sm text-gray-600">Self-assessed mastery level</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Drag to update your progress</span>
                <span>{selfAssessedProgress}%</span>
              </div>
              <Slider
                value={[selfAssessedProgress]}
                onValueChange={(value) => setSelfAssessedProgress(value[0])}
                min={0}
                max={100}
                step={5}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Just started</span>
                <span>Mastered</span>
              </div>
            </div>

            <Button
              onClick={handleSaveProgress}
              disabled={isSavingProgress}
              className="w-full bg-[#FF901F] hover:bg-[#E67F0C] text-white disabled:opacity-50"
            >
              {isSavingProgress ? 'Saving...' : 'Save Progress'}
            </Button>
          </CardContent>
        </Card>

        {/* Notation File / Link Viewer */}
        {lesson.notationFileUrl && (() => {
          const url = lesson.notationFileUrl;
          // Convert Google Docs/Drive share link to embed URL
          const gdocsMatch = url.match(/docs\.google\.com\/document\/d\/([\w-]+)/);
          const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
          let embedSrc = '';
          if (gdocsMatch) {
            embedSrc = `https://docs.google.com/document/d/${gdocsMatch[1]}/preview`;
          } else if (gdriveMatch) {
            embedSrc = `https://drive.google.com/file/d/${gdriveMatch[1]}/preview`;
          } else {
            embedSrc = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
          }
          return (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black font-bold">
                  <FileText className="text-[#FF901F]" size={20} />
                  Notation File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <iframe
                  src={embedSrc}
                  className="w-full rounded-xl border border-gray-200"
                  style={{ height: '500px' }}
                  title="Notation"
                  allow="autoplay"
                />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm text-[#FF901F] hover:underline"
                >
                  <FileText size={14} /> Open in new tab
                </a>
              </CardContent>
            </Card>
          );
        })()}

        {/* Typed Notation */}
        {lesson.notation && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black font-bold">
                <FileText className="text-[#FF901F]" size={20} />
                Notation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <pre className="whitespace-pre-wrap text-black font-mono text-sm leading-relaxed">
                  {lesson.notation}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Class Recording */}
        {lesson.recordingUrl && (() => {
          const url = lesson.recordingUrl;
          const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
          const gdriveMatch = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
          if (ytMatch) {
            return (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-black font-bold">Class Recording</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full rounded-xl overflow-hidden border border-gray-200" style={{ paddingTop: '56.25%' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${ytMatch[1]}`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Class Recording"
                    />
                  </div>
                </CardContent>
              </Card>
            );
          }
          if (gdriveMatch) {
            return (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-black font-bold">Class Recording</CardTitle>
                </CardHeader>
                <CardContent>
                  <iframe
                    src={`https://drive.google.com/file/d/${gdriveMatch[1]}/preview`}
                    className="w-full rounded-xl border border-gray-200"
                    style={{ height: '80px' }}
                    allow="autoplay"
                    title="Class Recording"
                  />
                </CardContent>
              </Card>
            );
          }
          return (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-black font-bold">Class Recording</CardTitle>
              </CardHeader>
              <CardContent>
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#FF901F] hover:underline text-sm">
                  Open recording
                </a>
              </CardContent>
            </Card>
          );
        })()}

        {/* Personal Notes */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-black font-bold">Personal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="Add your personal notes about this lesson..."
              rows={4}
              className="mb-2"
            />
            <p className="text-xs text-gray-500">Click "Save Progress" above to save your notes too</p>
          </CardContent>
        </Card>

        {/* Start Practice */}
        <Button
          onClick={() => onNavigate('practice')}
          className="w-full bg-[#FF901F] hover:bg-[#E67F0C] text-white py-6"
        >
          <Play size={20} className="mr-2" />
          Start Practice Session with this Lesson
        </Button>
      </div>
    </div>
  );
}
