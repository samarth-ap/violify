import { useState, useEffect } from 'react';
import { Home, Play, BookOpen, User } from 'lucide-react';
import OnboardingScreen from './components/OnboardingScreen';
import LoginScreen from './components/LoginScreen';
import SignUpScreen from './components/SignUpScreen';
import HomeScreen from './components/HomeScreen';
import PracticeScreen from './components/PracticeScreen';
import LessonLibraryScreen from './components/LessonLibraryScreen';
import LessonDetailScreen from './components/LessonDetailScreen';
import RepetitionCounterScreen from './components/RepetitionCounterScreen';
import PerformanceReportScreen from './components/PerformanceReportScreen';
import SettingsScreen from './components/SettingsScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import { DarkModeProvider } from './components/DarkModeContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import OnboardingTutorial from './components/OnboardingTutorial';
import logoImage from './assets/violify-logo.jpeg';

type Screen = 'onboarding' | 'login' | 'signup' | 'home' | 'practice' | 'repetition' | 'report' | 'lessons' | 'lesson-detail' | 'settings' | 'analytics';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const { isAuthenticated, loading, user } = useAuth();
  const [selectedLessonId, setSelectedLessonId] = useState<string | undefined>(undefined);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const navigate = (screen: string, lessonId?: string) => {
    if (lessonId) setSelectedLessonId(lessonId);
    setCurrentScreen(screen as Screen);
  };

  useEffect(() => {
    if (isAuthenticated && !loading) {
      setCurrentScreen('home');
      setIsGuestMode(false);
      const hasSeenApp = localStorage.getItem(`user_${user?.uid}_seen`);
      const isNew = !hasSeenApp;
      setIsNewUser(isNew);
      if (isNew) setShowTutorial(true);
      if (!hasSeenApp && user?.uid) {
        localStorage.setItem(`user_${user.uid}_seen`, 'true');
      }
    } else if (!isAuthenticated && !loading && !isGuestMode) {
      setCurrentScreen('onboarding');
    }
  }, [isAuthenticated, loading, isGuestMode, user]);

  const handleLogin = () => {
    setIsGuestMode(true);
    setCurrentScreen('home');
    setShowTutorial(true);
  };

  const handleGuestLogout = () => {
    setIsGuestMode(false);
    setCurrentScreen('onboarding');
    setShowTutorial(false);
  };

  const handleNavigateToLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setCurrentScreen('lesson-detail');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF901F] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    if (!isAuthenticated && !isGuestMode) {
      if (currentScreen === 'login') {
        return <LoginScreen onBack={() => setCurrentScreen('onboarding')} onSignUp={() => setCurrentScreen('signup')} />;
      }
      if (currentScreen === 'signup') {
        return <SignUpScreen onBack={() => setCurrentScreen('onboarding')} onLogin={() => setCurrentScreen('login')} />;
      }
      return <OnboardingScreen
        onLogin={handleLogin}
        onShowLogin={() => setCurrentScreen('login')}
        onShowSignUp={() => setCurrentScreen('signup')}
      />;
    }

    switch (currentScreen) {
      case 'home':
        return <HomeScreen
          onNavigate={navigate}
          isGuestMode={isGuestMode}
          isNewUser={isNewUser}
          userName={user?.displayName?.split(' ')[0] || 'there'}
        />;
      case 'practice':
        return <PracticeScreen onNavigate={navigate} selectedLessonId={selectedLessonId} />;
      case 'repetition':
        return <RepetitionCounterScreen onNavigate={navigate} />;
      case 'report':
        return <PerformanceReportScreen onNavigate={navigate} />;
      case 'lessons':
        return <LessonLibraryScreen onNavigate={navigate} onNavigateToLesson={handleNavigateToLesson} />;
      case 'lesson-detail':
        return <LessonDetailScreen onNavigate={navigate} lessonId={selectedLessonId} />;
      case 'settings':
        return <SettingsScreen
          onNavigate={navigate}
          isGuestMode={isGuestMode}
          onGuestLogout={handleGuestLogout}
        />;
      case 'analytics':
        return <AnalyticsScreen onNavigate={navigate} />;
      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  };

  const navItems = [
    { id: 'home' as Screen, icon: Home, label: 'Home', elementId: 'home-tab' },
    { id: 'practice' as Screen, icon: Play, label: 'Practice', elementId: 'practice-tab' },
    { id: 'lessons' as Screen, icon: BookOpen, label: 'Lessons', elementId: 'lessons-tab' },
    { id: 'settings' as Screen, icon: User, label: 'Profile', elementId: 'settings-tab' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated || isGuestMode ? (
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-card border-r border-border">
            <div className="flex items-center gap-3 px-4 py-4 pt-6">
              <img src={logoImage} alt="Violify Logo" className="h-24 w-auto object-contain" />
            </div>

            <nav className="flex-1 px-4 py-2">
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentScreen === item.id ||
                    (item.id === 'practice' && (currentScreen === 'repetition' || currentScreen === 'report'));

                  return (
                    <button
                      key={item.id}
                      id={item.elementId}
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
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="text-sm text-[#FF901F] mb-2">💡 Practice Tip</p>
                <p className="text-xs text-gray-600">
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
                    (item.id === 'practice' && (currentScreen === 'repetition' || currentScreen === 'report'));

                  return (
                    <button
                      key={item.id}
                      id={item.elementId}
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

          {showTutorial && (isNewUser || isGuestMode) && (
            <OnboardingTutorial onComplete={() => setShowTutorial(false)} />
          )}
        </div>
      ) : (
        renderScreen()
      )}
    </div>
  );
}

export default function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </DarkModeProvider>
  );
}
