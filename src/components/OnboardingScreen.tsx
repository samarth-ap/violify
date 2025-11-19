import { Sparkles, Target, TrendingUp, Music, ArrowRight, Award } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import logoImage from '../assets/violify-logo.jpeg';

interface OnboardingScreenProps {
  onLogin: () => void;
  onShowLogin: () => void;
  onShowSignUp: () => void;
}

export default function OnboardingScreen({ onLogin, onShowLogin, onShowSignUp }: OnboardingScreenProps) {
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
          <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-3xl p-8 inline-block">
            <img src={logoImage} alt="Violify Logo" className="w-64 h-auto object-contain mix-blend-multiply" />
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
            <img src={logoImage} alt="Violify Logo" className="w-48 h-auto object-contain mx-auto" />
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
              onClick={onShowLogin}
              className="w-full bg-[#FF901F] text-white hover:bg-[#E67F0C] py-7 rounded-xl shadow-lg shadow-[#FF901F]/20 transition-all hover:shadow-xl hover:shadow-[#FF901F]/30 hover:scale-[1.02]"
            >
              Log In
              <ArrowRight className="ml-auto" size={20} />
            </Button>

            <Button
              onClick={onShowSignUp}
              variant="outline"
              className="w-full border-2 border-[#FF901F] text-[#FF901F] hover:bg-orange-50 py-7 rounded-xl transition-all hover:scale-[1.02]"
            >
              Sign Up
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
