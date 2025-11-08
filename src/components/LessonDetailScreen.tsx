import { useState } from 'react';
import { ArrowLeft, Play, Pause, FileText, Calendar, Music } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Slider } from './ui/slider';
import { Textarea } from './ui/textarea';

interface LessonDetailScreenProps {
  onNavigate: (screen: string) => void;
  lessonId?: number;
}

export default function LessonDetailScreen({ onNavigate, lessonId }: LessonDetailScreenProps) {
  // Mock lesson data - in real app, this would be fetched based on lessonId
  const lesson = {
    id: lessonId || 1,
    title: 'Varnam in Kalyani',
    description: 'Master the fundamental varnam with focus on gamakas',
    category: 'Varnam',
    ragam: 'Kalyani',
    thalam: 'Adi',
    difficulty: 'Intermediate',
    createdDate: '2025-10-15',
    notation: 'S R G M P D N S\nS N D P M G R S\n\nPallavi:\nS R G M P M G R S\nG M P D N D P M\n\nAnupallavi:\nP M G R S N D P\nM P D N S R G M',
    studentRecording: 'student_varnam_kalyani.mp3',
    teacherRecording: 'teacher_varnam_kalyani.mp3',
    note: 'Focus on the higher octave transitions'
  };
  
  const [selfAssessedProgress, setSelfAssessedProgress] = useState(75);
  const [isPlayingTeacher, setIsPlayingTeacher] = useState(false);
  const [personalNotes, setPersonalNotes] = useState(lesson.note);
  
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Varnam: 'bg-orange-100 text-orange-700 border-orange-200',
      Alapana: 'bg-blue-100 text-blue-700 border-blue-200',
      Kriti: 'bg-green-100 text-green-700 border-green-200',
      Technique: 'bg-[#FF901F] text-white border-[#FF901F]',
      Thillana: 'bg-pink-100 text-pink-700 border-pink-200',
      Scales: 'bg-teal-100 text-teal-700 border-teal-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };
  
  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      Beginner: 'bg-green-100 text-green-700',
      Intermediate: 'bg-yellow-100 text-yellow-700',
      Advanced: 'bg-red-100 text-red-700',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-700';
  };

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
                <Badge className={getCategoryColor(lesson.category)}>
                  {lesson.category}
                </Badge>
                <Badge className={getDifficultyColor(lesson.difficulty)}>
                  {lesson.difficulty}
                </Badge>
              </div>
              <h1 className="text-black mb-2">{lesson.title}</h1>
              <p className="text-gray-600 mb-4">{lesson.description}</p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {lesson.ragam && lesson.ragam !== 'N/A' && (
                  <span className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                    🎵 Ragam: {lesson.ragam}
                  </span>
                )}
                {lesson.thalam && lesson.thalam !== 'N/A' && (
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
            <span>Created: {new Date(lesson.createdDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* Self-Assessed Progress */}
        <Card className="border-2 border-[#FF901F] bg-gradient-to-br from-orange-50 to-white">
          <CardHeader>
            <CardTitle className="text-black">
              <span className="font-bold">Your Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-5xl text-[#FF901F] mb-2">
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
            
            <Progress value={selfAssessedProgress} className="h-3" />
          </CardContent>
        </Card>

        {/* Recording */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">
              <span className="font-bold">Class Recording</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl p-6 mb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-[#FF901F] rounded-full p-4">
                  <Music className="text-white" size={32} />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">{lesson.teacherRecording}</p>
                <div className="bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-[#FF901F] h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-xs text-gray-500">0:00 / 3:45</p>
              </div>
            </div>
            <Button
              onClick={() => setIsPlayingTeacher(!isPlayingTeacher)}
              className="w-full bg-[#FF901F] hover:bg-[#E67F0C] text-white"
            >
              {isPlayingTeacher ? (
                <>
                  <Pause size={20} className="mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play size={20} className="mr-2" />
                  Play Recording
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Notation */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <FileText className="text-[#FF901F]" size={20} />
              <span className="font-bold">Notation</span>
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

        {/* Personal Notes */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">
              <span className="font-bold">Personal Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              placeholder="Add your personal notes about this lesson..."
              rows={4}
              className="mb-2"
            />
            <p className="text-xs text-gray-500">Your notes are saved automatically</p>
          </CardContent>
        </Card>

        {/* Action Button */}
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
