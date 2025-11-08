import { Sparkles, Target, TrendingUp, Music, ArrowRight, Zap, Award, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Card } from './ui/card';
import logoImage from 'figma:asset/55b61fb4264118c3bd6634877073eea5a4b97ae9.png';

interface OnboardingScreenProps {
  onLogin: () => void;
}

export default function OnboardingScreen({ onLogin }: OnboardingScreenProps) {
  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Left Side - Hero Image (Desktop Only) */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-[#FF901F] via-[#FFA64D] to-[#FFB366] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-20 text-white">
          <div className="mb-8">
            <img src={logoImage} alt="Violify Logo" className="w-64 h-auto object-contain" style={{ mixBlendMode: 'multiply' }} />
          </div>
          
          <h1 className="mb-6 text-white text-5xl leading-tight">
            Your Personal Carnatic Violin Coach
          </h1>
          
          <p className="text-xl text-white/90 mb-12 leading-relaxed max-w-lg">
            Transform your practice with AI-powered feedback, structured lessons, and comprehensive progress tracking.
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50K+</div>
              <div className="text-sm text-white/80">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">1M+</div>
              <div className="text-sm text-white/80">Practice Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">4.9★</div>
              <div className="text-sm text-white/80">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex flex-col items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <img src={logoImage} alt="Violify Logo" className="w-64 h-auto object-contain mx-auto" style={{ mixBlendMode: 'multiply' }} />
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="mb-3 text-gray-900">Welcome to Violify</h2>
            <p className="text-gray-600 text-lg">
              Start your journey to mastering Carnatic violin with AI-powered guidance
            </p>
          </div>

          {/* Login Buttons */}
          <div className="space-y-4 mb-10">
            <Button
              onClick={onLogin}
              className="w-full bg-[#FF901F] text-white hover:bg-[#E67F0C] py-7 rounded-xl shadow-lg shadow-[#FF901F]/20 transition-all hover:shadow-xl hover:shadow-[#FF901F]/30 hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
              <ArrowRight className="ml-auto" size={20} />
            </Button>

            <Button
              onClick={onLogin}
              className="w-full bg-black text-white hover:bg-gray-800 py-7 rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
              <ArrowRight className="ml-auto" size={20} />
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button
              onClick={onLogin}
              variant="outline"
              className="w-full border-2 border-gray-200 hover:border-[#FF901F] hover:bg-orange-50 py-7 rounded-xl transition-all hover:scale-[1.02]"
            >
              <Music className="mr-3 text-[#FF901F]" size={20} />
              Continue as Guest
              <ArrowRight className="ml-auto text-gray-400" size={20} />
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Card className="p-4 border-0 bg-gradient-to-br from-orange-50 to-white hover:shadow-md transition-all">
              <div className="bg-[#FF901F] rounded-lg p-2 w-10 h-10 flex items-center justify-center mb-3">
                <Sparkles size={20} className="text-white" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">AI Feedback</h4>
              <p className="text-xs text-gray-600">Real-time analysis</p>
            </Card>

            <Card className="p-4 border-0 bg-gradient-to-br from-blue-50 to-white hover:shadow-md transition-all">
              <div className="bg-blue-500 rounded-lg p-2 w-10 h-10 flex items-center justify-center mb-3">
                <Target size={20} className="text-white" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Goal Tracking</h4>
              <p className="text-xs text-gray-600">Stay on target</p>
            </Card>

            <Card className="p-4 border-0 bg-gradient-to-br from-green-50 to-white hover:shadow-md transition-all">
              <div className="bg-green-500 rounded-lg p-2 w-10 h-10 flex items-center justify-center mb-3">
                <TrendingUp size={20} className="text-white" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Progress</h4>
              <p className="text-xs text-gray-600">Track improvement</p>
            </Card>

            <Card className="p-4 border-0 bg-gradient-to-br from-purple-50 to-white hover:shadow-md transition-all">
              <div className="bg-purple-500 rounded-lg p-2 w-10 h-10 flex items-center justify-center mb-3">
                <Award size={20} className="text-white" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">Achievements</h4>
              <p className="text-xs text-gray-600">Earn rewards</p>
            </Card>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-500 text-xs leading-relaxed">
            By continuing, you agree to our{' '}
            <button className="text-[#FF901F] hover:underline">Terms of Service</button>
            {' '}and{' '}
            <button className="text-[#FF901F] hover:underline">Privacy Policy</button>
          </p>
        </div>
      </div>
    </div>
  );
}
