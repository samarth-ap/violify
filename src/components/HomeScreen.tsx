import { useState, useEffect } from 'react';
import { Play, Flame, Clock, Music, ChevronRight, Plus, Minus, Target, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { useAuth } from './AuthContext';
import { getUserLessons, getRecentPracticeSessions } from '../services/firestore';
import { Lesson, PracticeSession } from '../types/database';
import logoImage from '../assets/violify-logo.jpeg';

interface HomeScreenProps {
  onNavigate: (screen: string, lessonId?: string) => void;
  isGuestMode?: boolean;
  isNewUser?: boolean;
  userName?: string;
}

export default function HomeScreen({ onNavigate, isGuestMode = false, isNewUser = false, userName = 'there' }: HomeScreenProps) {
  const { user } = useAuth();
  const [dailyGoal, setDailyGoal] = useState(() => parseInt(localStorage.getItem('dailyGoal') || '30'));
  const [goalSet, setGoalSet] = useState(() => localStorage.getItem('dailyGoalSet') === 'true');

  const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [avgProgress, setAvgProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || isGuestMode) { setLoading(false); return; }

    Promise.all([
      getUserLessons(user.uid, 50),
      getRecentPracticeSessions(user.uid, 30),
    ]).then(([lessons, sessions]) => {
      // Recent lessons (last 4)
      setRecentLessons(lessons.slice(0, 4));
      setTotalLessons(lessons.length);

      // Avg progress across all lessons
      if (lessons.length > 0) {
        const avg = Math.round(lessons.reduce((sum, l) => sum + (l.progress ?? 0), 0) / lessons.length);
        setAvgProgress(avg);
      }

      // Today's practice minutes
      const today = new Date();
      const todaySessions = sessions.filter(s => {
        const d = s.date instanceof Date ? s.date : new Date(s.date);
        return d.toDateString() === today.toDateString();
      });
      setTodayMinutes(todaySessions.reduce((sum, s) => sum + s.duration, 0));

      // Streak: count consecutive days with at least one session ending today
      const practicedDays = new Set(
        sessions.map(s => {
          const d = s.date instanceof Date ? s.date : new Date(s.date);
          return d.toDateString();
        })
      );
      let currentStreak = 0;
      const check = new Date();
      // If nothing practiced today, streak only counts if yesterday was practiced
      while (practicedDays.has(check.toDateString())) {
        currentStreak++;
        check.setDate(check.getDate() - 1);
      }
      setStreak(currentStreak);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user, isGuestMode]);

  const handleSetGoal = () => {
    localStorage.setItem('dailyGoal', dailyGoal.toString());
    localStorage.setItem('dailyGoalSet', 'true');
    setGoalSet(true);
  };

  const getWelcomeMessage = () => {
    if (isGuestMode) return { title: "Welcome, Guest!", subtitle: "Explore Violify and start your musical journey" };
    if (isNewUser) return { title: `Welcome to Violify, ${userName}!`, subtitle: "Let's begin your journey to mastering Carnatic violin" };
    return { title: `Welcome back, ${userName}!`, subtitle: "Let's make today count with great practice!" };
  };

  const { title, subtitle } = getWelcomeMessage();
  const showRealData = !isGuestMode && !loading;
  const todayProgress = dailyGoal > 0 ? Math.min(100, Math.round((todayMinutes / dailyGoal) * 100)) : 0;

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      Varnam: 'bg-orange-100 text-orange-700',
      Alapana: 'bg-blue-100 text-blue-700',
      Kriti: 'bg-green-100 text-green-700',
      Technique: 'bg-[#FF901F] text-white',
      Thillana: 'bg-pink-100 text-pink-700',
      Scales: 'bg-teal-100 text-teal-700',
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-white pb-24 lg:pb-8">
      {/* Header */}
      <div id="home-header" className="bg-gradient-to-br from-orange-50 to-white px-6 pt-8 pb-16 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <img src={logoImage} alt="Violify" className="h-14 lg:hidden object-contain" />
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold">
                <Flame size={16} />
                {streak} day streak
              </div>
            )}
          </div>
          <h1 className="text-4xl lg:text-5xl mb-2 text-black font-bold">{title}</h1>
          <p className="text-xl text-gray-600">{subtitle}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 space-y-6">
        {/* Start Practice Button */}
        <Button
          id="practice-button"
          onClick={() => onNavigate('practice')}
          className="w-full bg-[#FF901F] hover:bg-[#E67F0C] text-white py-8 rounded-2xl shadow-xl shadow-[#FF901F]/20 group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-3">
                <Play size={24} fill="white" />
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold">Start Practice</div>
                {showRealData && todayMinutes > 0 && (
                  <div className="text-sm text-white/80">{todayMinutes} min practiced today</div>
                )}
              </div>
            </div>
            <div className="bg-white/20 rounded-full p-2 group-hover:translate-x-1 transition-transform">
              <Play size={16} />
            </div>
          </div>
        </Button>

        {/* Daily Goal Setup for New Users */}
        {(isNewUser || isGuestMode) && !goalSet && (
          <Card className="border-gray-200 bg-gradient-to-br from-orange-50 to-white shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-black">
                <Target className="text-[#FF901F]" size={24} />
                <span className="font-bold">Set Your Daily Practice Goal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">Start your journey by setting a realistic daily practice goal. Consistency is key!</p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  onClick={() => setDailyGoal(Math.max(5, dailyGoal - 5))}
                  className="h-12 w-12 rounded-full bg-white hover:bg-gray-50 text-[#FF901F] border-2 border-gray-200 hover:border-[#FF901F] p-0 flex items-center justify-center shrink-0"
                >
                  <Minus size={20} />
                </Button>
                <div className="flex items-center bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-[#FF901F] rounded-2xl px-6 py-4 justify-center">
                  <input
                    type="number"
                    value={dailyGoal}
                    onChange={(e) => setDailyGoal(Math.max(5, Math.min(180, parseInt(e.target.value) || 0)))}
                    className="text-5xl font-bold text-[#FF901F] bg-transparent border-none outline-none text-center w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    min="5" max="180"
                  />
                  <span className="text-lg font-medium text-gray-700">min</span>
                </div>
                <Button
                  onClick={() => setDailyGoal(Math.min(180, dailyGoal + 5))}
                  className="h-12 w-12 rounded-full bg-white hover:bg-gray-50 text-[#FF901F] border-2 border-gray-200 hover:border-[#FF901F] p-0 flex items-center justify-center shrink-0"
                >
                  <Plus size={20} />
                </Button>
              </div>
              <div className="flex justify-center mb-6">
                <Button onClick={handleSetGoal} className="bg-[#FF901F] hover:bg-[#E67F0C] text-white py-3 px-20 text-base font-semibold">
                  Set Goal
                </Button>
              </div>
              <p className="text-xs text-gray-500 text-center">You can change this anytime in Settings</p>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <Clock className="text-[#FF901F]" size={20} />,
              value: showRealData ? (todayMinutes >= 60 ? `${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m` : `${todayMinutes}m`) : '0m',
              label: 'Today',
              extra: goalSet && showRealData ? <Progress value={todayProgress} className="h-1.5 mt-3" /> : null,
            },
            {
              icon: <Flame className="text-[#FF901F]" size={20} />,
              value: showRealData ? streak : 0,
              label: 'Day Streak',
              extra: null,
            },
            {
              icon: <TrendingUp className="text-[#FF901F]" size={20} />,
              value: showRealData ? `${avgProgress}%` : '0%',
              label: 'Avg Progress',
              extra: null,
            },
            {
              icon: <Music className="text-[#FF901F]" size={20} />,
              value: showRealData ? totalLessons : 0,
              label: 'Lessons',
              extra: null,
            },
          ].map((stat, i) => (
            <div key={i} style={{ padding: '20px' }} className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-orange-50 rounded-full p-2 shrink-0">{stat.icon}</div>
                <div className="min-w-0">
                  <div className="text-2xl font-bold text-black truncate">{stat.value}</div>
                  <div className="text-xs text-gray-500">{stat.label}</div>
                </div>
              </div>
              {stat.extra}
            </div>
          ))}
        </div>

        {/* Today's Goal Progress */}
        {goalSet && showRealData && (
          <div style={{ padding: '20px' }} className="border-2 border-[#FF901F] bg-gradient-to-br from-orange-50 to-white rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-black">Today's Goal</div>
              <div className="text-sm text-gray-600">
                {todayMinutes} / {dailyGoal} min
                {todayProgress >= 100 && <span className="ml-2 text-green-600 font-semibold">Complete!</span>}
              </div>
            </div>
            <Progress value={todayProgress} className="h-3" />
            <p className="text-xs text-gray-500 mt-2">
              {todayProgress >= 100
                ? "You've hit your goal for today. Keep it up!"
                : `${Math.max(0, dailyGoal - todayMinutes)} min remaining`}
            </p>
          </div>
        )}

        {/* Recent Lessons */}
        {showRealData && recentLessons.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-black">Recent Lessons</h2>
              <button
                onClick={() => onNavigate('lessons')}
                className="text-sm text-[#FF901F] hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-3">
              {recentLessons.map(lesson => (
                <div
                  key={lesson.id}
                  style={{ padding: '16px' }}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm cursor-pointer hover:border-[#FF901F] transition-colors"
                  onClick={() => onNavigate('lesson-detail', lesson.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {lesson.category && (
                          <Badge className={`text-xs ${getCategoryColor(lesson.category)}`}>
                            {lesson.category}
                          </Badge>
                        )}
                        {lesson.ragam && (
                          <span className="text-xs text-purple-600">{lesson.ragam}</span>
                        )}
                      </div>
                      <div className="font-semibold text-black truncate">{lesson.title}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={lesson.progress ?? 0} className="h-1.5 flex-1" />
                        <span className="text-xs text-gray-500 shrink-0">{lesson.progress ?? 0}%</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state for new / guest users with no lessons */}
        {showRealData && recentLessons.length === 0 && !isNewUser && (
          <div className="border-dashed border-2 border-gray-200 rounded-xl py-8 flex flex-col items-center gap-3 text-center px-6">
            <Music className="text-gray-300" size={40} />
            <p className="text-gray-500 font-medium">No lessons yet</p>
            <p className="text-sm text-gray-400">Add your first lesson to start tracking your practice</p>
            <Button
              onClick={() => onNavigate('lessons')}
              className="bg-[#FF901F] hover:bg-[#E67F0C] text-white mt-1"
            >
              Go to Lessons
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
