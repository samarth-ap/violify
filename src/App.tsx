import { useState, useEffect } from 'react';
import { Home, Play, BookOpen, User, Sparkles } from 'lucide-react';
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
import AIRecordingScreen from './components/AIRecordingScreen';
import { DarkModeProvider } from './components/DarkModeContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import OnboardingTutorial from './components/OnboardingTutorial';
import logoImage from './assets/violify-logo.jpeg';

type Screen = 'onboarding' | 'login' | 'signup' | 'home' | 'practice' | 'repetition' | 'report' | 'lessons' | 'lesson-detail' | 'settings' | 'analytics' | 'ai-recording';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const { isAuthenticated, loading, user } = useAuth();
  const [selectedLessonId, setSelectedLessonId] = useState<number | undefined>(undefined);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // If user is authenticated, navigate to home
    if (isAuthenticated && !loading) {
      setCurrentScreen('home');
      setIsGuestMode(false); // Reset guest mode if user authenticates
      // Check if user is new by checking if they have any stored data
      // For now, we'll consider them new on first sign-in
      // In production, you'd check against a backend
      const hasSeenApp = localStorage.getItem(`user_${user?.uid}_seen`);
      const isNew = !hasSeenApp;
      setIsNewUser(isNew);

      // Show tutorial for new users
      if (isNew) {
        setShowTutorial(true);
      }

      if (!hasSeenApp && user?.uid) {
        localStorage.setItem(`user_${user.uid}_seen`, 'true');
      }
    } else if (!isAuthenticated && !loading && !isGuestMode) {
      setCurrentScreen('onboarding');
    }
  }, [isAuthenticated, loading, isGuestMode, user]);

  const handleLogin = () => {
    // This is called when user continues as guest
    setIsGuestMode(true);
    setCurrentScreen('home');
    // Show tutorial for guest mode
    setShowTutorial(true);
  };

  const handleGuestLogout = () => {
    // Handle logout for guest mode
    setIsGuestMode(false);
    setCurrentScreen('onboarding');
    setShowTutorial(false);
  };

  const handleNavigateToLesson = (lessonId: number) => {
    setSelectedLessonId(lessonId);
    setCurrentScreen('lesson-detail');
  };

  // Show loading state while checking auth
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
    // Show auth-related screens only if not authenticated AND not in guest mode
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

    // If authenticated OR in guest mode, show the main app screens
    switch (currentScreen) {
      case 'home':
        return <HomeScreen
          onNavigate={setCurrentScreen}
          isGuestMode={isGuestMode}
          isNewUser={isNewUser}
          userName={user?.displayName?.split(' ')[0] || 'there'}
        />;
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
        return <SettingsScreen
          onNavigate={setCurrentScreen}
          isGuestMode={isGuestMode}
          onGuestLogout={handleGuestLogout}
        />;
      case 'analytics':
        return <AnalyticsScreen onNavigate={setCurrentScreen} />;
      case 'ai-recording':
        return <AIRecordingScreen onNavigate={setCurrentScreen} />;
      default:
        return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  const navItems = [
    { id: 'home' as Screen, icon: Home, label: 'Home', elementId: 'home-tab' },
    { id: 'practice' as Screen, icon: Play, label: 'Practice', elementId: 'practice-tab' },
    { id: 'lessons' as Screen, icon: BookOpen, label: 'Lessons', elementId: 'lessons-tab' },
    { id: 'ai-recording' as Screen, icon: Sparkles, label: 'Coach', elementId: 'ai-tab' },
    { id: 'settings' as Screen, icon: User, label: 'Profile', elementId: 'settings-tab' },
  ];

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

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
                    (item.id === 'practice' && (currentScreen === 'repetition' || currentScreen === 'report')) ||
                    (item.id === 'analytics' && currentScreen === 'analytics');
                  
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

          {/* Onboarding Tutorial */}
          {showTutorial && (isNewUser || isGuestMode) && (
            <OnboardingTutorial onComplete={handleTutorialComplete} />
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
