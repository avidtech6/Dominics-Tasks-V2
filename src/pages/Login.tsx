import React, { useState } from 'react';
import { Trophy, Users, Calendar, MessageCircle, AlertCircle } from 'lucide-react';
import { useBehaviours } from '../orchestrator/AppOrchestrator';

interface LoginProps {
  error?: string | null;
}

const Login: React.FC<LoginProps> = ({ error }) => {
  const { authBehaviour } = useBehaviours();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await authBehaviour.signIn('dev@example.com', 'password');
    } catch {
      // Error is handled by the auth context
    } finally {
      setIsSigningIn(false);
    }
  };

  const features = [
    {
      icon: Trophy,
      title: 'Productive Day',
      description: 'Earn EP, build momentum, and reach your goals',
      color: 'from-amber-400 to-orange-500',
    },
    {
      icon: Calendar,
      title: 'Smart Organization',
      description: 'Task types, deadlines, and calendar views',
      color: 'from-blue-400 to-indigo-500',
    },
    {
      icon: Users,
      title: 'Family Hub',
      description: 'Share tasks, resources, and communicate together',
      color: 'from-green-400 to-emerald-500',
    },
    {
      icon: MessageCircle,
      title: 'Family Chat',
      description: 'WhatsApp-style messaging for the whole family',
      color: 'from-pink-400 to-rose-500',
    },
  ];

  // Get current date formatted
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const formattedDate = today.toLocaleDateString('en-GB', dateOptions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-center items-center p-12 xl:p-20">
        <div className="max-w-xl text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30">
              <span className="text-5xl">📋</span>
            </div>
          </div>

          {/* Date Pill */}
          <div className="mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full">
              <Calendar className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-700 font-medium">{formattedDate}</span>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-gray-800 mb-4">
            Dominic's Tasks
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            Take it one step at a time!
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 text-left">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-4 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3`}
                >
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col justify-center items-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Dominic's Tasks</h1>
            <p className="text-blue-600 font-medium mt-2">Take it one step at a time!</p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="text-white" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome Back!
              </h2>
              <p className="text-gray-500">
                Sign in with your Google account to continue
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center justify-center mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-600 text-sm font-medium">Authentication Error</p>
                </div>
                <p className="text-red-600 text-sm text-center">{error}</p>
                {(error.includes('popup') || error.includes('blocked') || error.includes('browser') || error.includes('timeout') || error.includes('sign-in')) ? (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-red-500 text-xs text-center">
                      💡 <strong>Mobile tip:</strong> Make sure you have a stable internet connection and try using Chrome browser if you have issues.
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            <button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSigningIn ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Signing in... Please wait</span>
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Mobile redirect notice */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg lg:hidden">
              <p className="text-blue-600 text-xs text-center">
                📱 On mobile? You'll be redirected to sign in with Google, then brought back to the app automatically.
              </p>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Only authorized family members can access this app.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-400 mt-8">
            Dominic's Tasks & Family Hub © 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
