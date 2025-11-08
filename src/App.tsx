import { useState } from 'react';
import { Home, Play, BookOpen, User, BarChart3 } from 'lucide-react';
import OnboardingScreen from './components/OnboardingScreen';
import HomeScreen from './components/HomeScreen';
import PracticeScreen from './components/PracticeScreen';
import LessonLibraryScreen from './components/LessonLibraryScreen';
import LessonDetailScreen from './components/LessonDetailScreen';
import RepetitionCounterScreen from './components/RepetitionCounterScreen';
import PerformanceReportScreen from './components/PerformanceReportScreen';
import SettingsScreen from './components/SettingsScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import { DarkModeProvider } from './components/DarkModeContext';
import logoImage from 'figma:asset/55b61fb4264118c3bd6634877073eea5a4b97ae9.png';

type Screen = 'onboarding' | 'home' | 'practice' | 'repetition' | 'report' | 'lessons' | 'lesson-detail' | 'settings' | 'analytics';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<number | undefined>(undefined);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentScreen('home');
  };
  
  const handleNavigateToLesson = (lessonId: number) => {
    setSelectedLessonId(lessonId);
    setCurrentScreen('lesson-detail');
  };

  const renderScreen = () => {
    if (!isAuthenticated) {
      return <OnboardingScreen onLogin={handleLogin} />;
    }

    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={setCurrentScreen} />;
      case 'practice':
        return <PracticeScreen onNavigate={setCurrentScreen} selectedLessonId={selectedLessonId} />;
      case 'repetition':
        return <RepetitionCounterScreen onNavigate={setCurrentScreen} />;
      case 'report':
        return <PerformanceReportScreen onNavigate={setCurrentScreen} />;
      case 'lessons':
        return <LessonLibraryScreen onNavigate={setCurrentScreen} onNavigateToLesson={handleNavigateToLesson} />;
      case 'lesson-detail':
        return <LessonDetailScreen onNavigate={setCurrentScreen} lessonId={selectedLessonId} />;
      case 'settings':
        return <SettingsScreen onNavigate={setCurrentScreen} />;
      case 'analytics':
        return <AnalyticsScreen onNavigate={setCurrentScreen} />;
      default:
        return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  const navItems = [
    { id: 'home' as Screen, icon: Home, label: 'Home' },
    { id: 'practice' as Screen, icon: Play, label: 'Practice' },
    { id: 'lessons' as Screen, icon: BookOpen, label: 'Lessons' },
    { id: 'analytics' as Screen, icon: BarChart3, label: 'Analytics' },
    { id: 'settings' as Screen, icon: User, label: 'Profile' },
  ];

  return (
    <DarkModeProvider>
      <div className="min-h-screen bg-background">
        {isAuthenticated ? (
          <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r border-border">
            <div className="flex items-center gap-3 px-4 py-4 pt-6">
              <img src={logoImage} alt="Violify Logo" className="h-24 w-auto object-contain" style={{ mixBlendMode: 'multiply' }} />
            </div>
            
            <nav className="flex-1 px-4 py-2">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentScreen === item.id || 
                    (item.id === 'practice' && (currentScreen === 'repetition' || currentScreen === 'report')) ||
                    (item.id === 'analytics' && currentScreen === 'analytics');
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentScreen(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#FF901F] text-white shadow-lg shadow-[#FF901F]/20'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="px-6 py-8">
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl p-4">
                <p className="text-sm text-[#FF901F] mb-2">💡 Practice Tip</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Consistent daily practice is key to mastering Carnatic violin techniques.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 lg:ml-64">
            {renderScreen()}
          </main>

          {/* Mobile Bottom Navigation */}
          <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
            <div className="px-4 py-3">
              <div className="flex justify-around items-center">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentScreen === item.id || 
                    (item.id === 'practice' && (currentScreen === 'repetition' || currentScreen === 'report')) ||
                    (item.id === 'analytics' && currentScreen === 'analytics');
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentScreen(item.id)}
                      className={`flex flex-col items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                        isActive ? 'text-[#FF901F]' : 'text-muted-foreground'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
          </div>
        ) : (
          renderScreen()
        )}
      </div>
    </DarkModeProvider>
  );
}
