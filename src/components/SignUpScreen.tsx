import { useState } from 'react';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import logoImage from '../assets/violify-logo.jpeg';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface SignUpScreenProps {
  onBack: () => void;
  onLogin: () => void;
}

export default function SignUpScreen({ onBack, onLogin }: SignUpScreenProps) {
  const { signInWithGoogle, signInWithApple, signUpWithEmail } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmail(email, password, username);
      toast.success('Account created successfully! Welcome to Violify!');
    } catch (error: any) {
      console.error('Email signup error:', error);

      // Handle specific Firebase auth errors
      if (error?.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Please log in instead.');
      } else if (error?.code === 'auth/invalid-email') {
        toast.error('Invalid email address. Please check and try again.');
      } else if (error?.code === 'auth/weak-password') {
        toast.error('Password is too weak. Please use a stronger password.');
      } else {
        toast.error(error?.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signInWithGoogle();
      toast.success('Signed up with Google!');
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error(error?.message || 'Failed to sign up with Google. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsAppleLoading(true);
      await signInWithApple();
      toast.success('Signed up with Apple!');
    } catch (error: any) {
      console.error('Apple sign-in error:', error);
      if (error?.code === 'auth/popup-closed-by-user') {
        toast.error('Sign-up was cancelled.');
      } else if (error?.code === 'auth/popup-blocked') {
        toast.error('Pop-up was blocked. Please allow pop-ups and try again.');
      } else {
        toast.error(error?.message || 'Failed to sign up with Apple. Please try again.');
      }
    } finally {
      setIsAppleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-8">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="mb-6 flex items-center text-gray-600 hover:text-[#FF901F] transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logoImage} alt="Violify" className="h-20 w-auto object-contain" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Create Your Violify Account
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Start your musical journey today
          </p>

          {/* Social Signup - Top Priority like Chess.com */}
          <div className="space-y-3 mb-6">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isAppleLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 rounded-lg border border-gray-300 transition-all flex items-center justify-center disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>

            <Button
              onClick={handleAppleSignIn}
              disabled={isAppleLoading || isGoogleLoading}
              className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
            >
              {isAppleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">OR</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-4 mb-6">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF901F] focus:border-transparent"
                required
              />
            </div>

            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF901F] focus:border-transparent"
                required
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF901F] focus:border-transparent"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#9ACD32] hover:bg-[#8AB82A] text-white py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mb-4">
            By signing up, you agree to our{' '}
            <button className="text-[#FF901F] hover:underline">Terms of Service</button>
            {' '}and{' '}
            <button className="text-[#FF901F] hover:underline">Privacy Policy</button>
          </p>

          {/* Login Link */}
          <div className="text-center">
            <span className="text-gray-600">Already have an account? </span>
            <button
              onClick={onLogin}
              className="text-[#FF901F] font-semibold hover:underline"
            >
              Log In
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
