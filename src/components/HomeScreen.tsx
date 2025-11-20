import { useState } from 'react';
import { Play, Flame, Target, Clock, TrendingUp, Music, Award, ChevronRight, CheckCircle, Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import logoImage from '../assets/violify-logo.jpeg';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
  isGuestMode?: boolean;
  isNewUser?: boolean;
  userName?: string;
}

export default function HomeScreen({ onNavigate, isGuestMode = false, isNewUser = false, userName = 'Samarth' }: HomeScreenProps) {
  const [dailyGoal, setDailyGoal] = useState(30);
  const [goalSet, setGoalSet] = useState(() => {
    // Check if goal has been set before
    return localStorage.getItem('dailyGoalSet') === 'true';
  });

  const handleSetGoal = () => {
    // Save goal to localStorage
    localStorage.setItem('dailyGoal', dailyGoal.toString());
    localStorage.setItem('dailyGoalSet', 'true');
    setGoalSet(true);
  };

  const getWelcomeMessage = () => {
    if (isGuestMode) {
      return {
        title: "Welcome, Guest! 🎵",
        subtitle: "Explore Violify and start your musical journey"
      };
    }
    if (isNewUser) {
      return {
        title: `Welcome to Violify, ${userName}! 🎉`,
        subtitle: "Let's begin your journey to mastering Carnatic violin"
      };
    }
    return {
      title: `Welcome back, ${userName}! 👋`,
      subtitle: "Let's make today count with great practice!"
    };
  };

  const { title, subtitle } = getWelcomeMessage();
  const showStats = !isGuestMode && !isNewUser;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-24 lg:pb-8">
      {/* Header with Big Welcome */}
      <div id="home-header" className="bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-950 px-6 pt-8 pb-16 lg:rounded-none border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <img src={logoImage} alt="Violify" className="h-14 lg:hidden object-contain" />
            {/* Streak badge removed - will be added back when real data is available */}
          </div>

          {/* Big Welcome Message */}
          <div className="mb-6">
            <h1 className="text-4xl lg:text-5xl mb-2 text-black dark:text-white font-bold">{title}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8">
        {/* Practice Summary Card removed - will show real data from Firestore analytics */}

        {/* Quick Start Practice Button */}
        <Button
          id="practice-button"
          onClick={() => onNavigate('practice')}
          className="w-full bg-[#FF901F] hover:bg-[#E67F0C] text-white py-8 rounded-2xl shadow-xl shadow-[#FF901F]/20 mb-6 group"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-3">
                <Play size={24} fill="white" />
              </div>
              <div className="text-left">
                <div className="text-lg">Start Practice</div>
              </div>
            </div>
            <div className="bg-white/20 rounded-full p-2 group-hover:translate-x-1 transition-transform">
              <Play size={16} />
            </div>
          </div>
        </Button>

        {/* Daily Goal Setup for New Users */}
        {(isNewUser || isGuestMode) && !goalSet && (
          <>
            <Card className="mb-6 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/10 dark:to-gray-900 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                  <Target className="text-[#FF901F]" size={24} />
                  <span className="font-bold">Set Your Daily Practice Goal</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start your journey by setting a realistic daily practice goal. Consistency is key to mastering the violin!
                </p>

                <div className="flex items-center justify-center gap-4 mb-6">
                  <Button
                    onClick={() => setDailyGoal(Math.max(5, dailyGoal - 5))}
                    className="h-12 w-12 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#FF901F] border-2 border-gray-200 dark:border-gray-700 hover:border-[#FF901F] p-0 flex items-center justify-center shrink-0"
                  >
                    <Minus size={20} />
                  </Button>

                  <div className="flex items-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-2 border-[#FF901F] rounded-2xl px-6 py-4 justify-center">
                    <input
                      type="number"
                      value={dailyGoal}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setDailyGoal(Math.max(5, Math.min(180, val)));
                      }}
                      className="text-5xl font-bold text-[#FF901F] bg-transparent border-none outline-none text-center w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="5"
                      max="180"
                    />
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">min</span>
                  </div>

                  <Button
                    onClick={() => setDailyGoal(Math.min(180, dailyGoal + 5))}
                    className="h-12 w-12 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-[#FF901F] border-2 border-gray-200 dark:border-gray-700 hover:border-[#FF901F] p-0 flex items-center justify-center shrink-0"
                  >
                    <Plus size={20} />
                  </Button>
                </div>

                <div className="flex justify-center gap-2 mb-6">
                  <Badge className="bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 text-xs px-3 py-1">
                    Recommended: 30 min/day
                  </Badge>
                </div>

                <div className="flex justify-center mb-6">
                  <Button
                    onClick={handleSetGoal}
                    className="bg-[#FF901F] hover:bg-[#E67F0C] text-white py-3 px-20 text-base font-semibold"
                  >
                    Set Goal
                  </Button>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
                  Don't worry, you can change this anytime in Settings
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty Stats for New Users */}
        {(isNewUser || isGuestMode) && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-orange-50 dark:bg-orange-950/20 rounded-full p-2">
                      <Clock className="text-[#FF901F]" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl text-black dark:text-white">0h</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Today</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 italic">Start practicing to track your time!</p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-orange-50 dark:bg-orange-950/20 rounded-full p-2">
                      <Flame className="text-[#FF901F]" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl text-black dark:text-white">0</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 italic">Build your streak by practicing daily!</p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-orange-50 dark:bg-orange-950/20 rounded-full p-2">
                      <TrendingUp className="text-[#FF901F]" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl text-black dark:text-white">0%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Progress</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 italic">Your progress will show here!</p>
                </CardContent>
              </Card>

              <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-orange-50 dark:bg-orange-950/20 rounded-full p-2">
                      <Music className="text-[#FF901F]" size={20} />
                    </div>
                    <div>
                      <div className="text-2xl text-black dark:text-white">0</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Lessons</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 italic">Explore lessons to get started!</p>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Stats and analytics removed - will show real data from Firestore once user starts practicing */}

        {/* Recent Lessons removed - will show real data from Firestore when available */}

        {/* Achievements removed - will show real data from Firestore when available */}
      </div>
    </div>
  );
}
