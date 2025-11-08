import { Play, Flame, Target, Clock, TrendingUp, Music, Award, ChevronRight, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import logoImage from 'figma:asset/55b61fb4264118c3bd6634877073eea5a4b97ae9.png';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 pb-24 lg:pb-8">
      {/* Header with Big Welcome */}
      <div className="bg-gradient-to-br from-orange-50 to-white dark:from-gray-900 dark:to-gray-950 px-6 pt-8 pb-16 lg:rounded-none border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <img src={logoImage} alt="Violify" className="h-14 lg:hidden object-contain" style={{ mixBlendMode: 'multiply' }} />
            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-orange-200 dark:border-orange-900 px-4 py-2 rounded-full">
              <Flame className="text-[#FF901F]" size={20} />
              <span className="text-black dark:text-white">12 Day Streak</span>
            </div>
          </div>
          
          {/* Big Welcome Message */}
          <div className="mb-6">
            <h1 className="text-4xl lg:text-5xl mb-2 text-black dark:text-white font-bold">Welcome back, Samarth! 👋</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">Let's make today count with great practice!</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8">
        {/* Practice Summary Card */}
        <Card className="mb-6 border-gray-200 bg-gradient-to-br from-[#FF901F] to-[#FFA64D] shadow-xl">
          <CardContent className="pt-6">
            <div className="mb-4">
              <h3 className="text-white"><span className="font-bold">This Week's Practice Summary</span></h3>
              <p className="text-white/80 text-sm">Check Analytics tab for detailed insights</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-white" size={20} />
                  <span className="text-white/80 text-sm">Minutes Practiced</span>
                </div>
                <div className="text-3xl text-white">425</div>
                <div className="text-white/70 text-sm mt-1">+15% from last week</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-white" size={20} />
                  <span className="text-white/80 text-sm">Mistakes Fixed</span>
                </div>
                <div className="text-3xl text-white">54</div>
                <div className="text-white/70 text-sm mt-1">Great improvement!</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start Practice Button */}
        <Button
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
                <div className="text-sm opacity-90">Continue where you left off</div>
              </div>
            </div>
            <div className="bg-white/20 rounded-full p-2 group-hover:translate-x-1 transition-transform">
              <Play size={16} />
            </div>
          </div>
        </Button>

        {/* Daily Goal */}
        <Card className="mb-6 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-black dark:text-white">
                <Target className="text-[#FF901F]" size={20} />
                <span className="font-bold">Daily Goal</span>
              </CardTitle>
              <span className="text-sm text-gray-600 dark:text-gray-400">25/30 min</span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={83} className="h-3 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">5 minutes to reach your goal! 🎯</p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-full p-2">
                  <Clock className="text-[#FF901F]" size={20} />
                </div>
                <div>
                  <div className="text-2xl text-black dark:text-white">45m</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Today</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-full p-2">
                  <TrendingUp className="text-[#FF901F]" size={20} />
                </div>
                <div>
                  <div className="text-2xl text-black dark:text-white">89%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm lg:block hidden">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-full p-2">
                  <Award className="text-[#FF901F]" size={20} />
                </div>
                <div>
                  <div className="text-2xl text-black dark:text-white">7</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Achievements</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm lg:block hidden">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-full p-2">
                  <Music className="text-[#FF901F]" size={20} />
                </div>
                <div>
                  <div className="text-2xl text-black dark:text-white">12</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Lessons</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Lessons */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-black dark:text-white">Recent Lessons</h2>
            <button
              onClick={() => onNavigate('lessons')}
              className="text-[#FF901F] text-sm hover:text-[#E67F0C]"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900 transition-all cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#FF901F] rounded-xl p-3 flex-shrink-0">
                    <Music className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-black dark:text-white">Varnam in Kalyani</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">15/20 repetitions completed</p>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900 transition-all cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="bg-gradient-to-br from-[#FF901F] to-[#FFA64D] rounded-xl p-3 flex-shrink-0">
                    <Music className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-black dark:text-white">Alapana Practice</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">8/10 repetitions completed</p>
                    <Progress value={80} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Achievements */}
        <Card className="mb-6 border-gray-200 bg-gradient-to-br from-orange-50 to-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Award className="text-[#FF901F]" size={20} />
              Recent Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="bg-[#FF901F] rounded-full p-4">
                <Flame className="text-white" size={32} />
              </div>
              <div>
                <h3 className="text-black mb-1">Week Warrior</h3>
                <p className="text-sm text-gray-600">Practiced 7 days in a row!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
