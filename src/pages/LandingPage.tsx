import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBehaviours } from '../orchestrator/AppOrchestrator';
import { Trophy, Users, Calendar, MessageCircle, AlertCircle, AlertTriangle, ArrowRight, Settings } from 'lucide-react';
import { User } from '../data/types';

interface LandingPageProps {
  error?: string | null;
}

const LandingPage: React.FC<LandingPageProps> = ({ error }) => {
  const { authBehaviour, familyBehaviour } = useBehaviours();
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authBehaviour.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, [authBehaviour]);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await authBehaviour.signIn('', '');
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

  // Signed-in view - show welcome with user avatar and options
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
        {/* Left Side - Welcome */}
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
              Welcome back, {user.displayName.split(' ')[0]}!
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Ready to tackle your tasks today?
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
                  <p className="text-sm text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - User Info & Actions */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* User Avatar */}
            <div className="mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-3xl text-white">
                    {user.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {user.displayName}
              </h2>
              <p className="text-gray-500">
                {user.email}
              </p>
            </div>

            {/* Setup Required Banner */}
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Family setup needed</h4>
                  <p className="text-amber-700 text-sm mb-3">
                    Set up your family profiles to start using Dominic's Tasks
                  </p>
                  <button
                    onClick={() => navigate('/setup')}
                    className="flex items-center space-x-2 bg-amber-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors"
                  >
                    <Settings size={16} />
                    <span>Set Up Family</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Go to Tasks Button */}
            <button
              onClick={() => navigate('/tasks')}
              className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:opacity-50"
            >
              <span>Go to Tasks</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not signed in view - show login screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="flex-1 flex flex-col justify-center items-center p-8">
        <div className="max-w-4xl w-full text-center">
          {/* Logo */}
          <div className="mb-12">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/30">
              <span className="text-6xl">📋</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
            Dominic's Tasks
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
            The family task management app that helps everyone stay organized and productive
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
              >
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 mx-auto`}
                >
                  <feature.icon className="text-white" size={32} />
                </div>
                <h3 className="font-bold text-gray-800 mb-3 text-lg">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-700 font-medium">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full max-w-md flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/30 disabled:opacity-50"
          >
            {isSigningIn ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Get Started</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>

          {/* Footer */}
          <div className="mt-16 text-gray-500 text-sm">
            <p>No account required. Start using Dominic's Tasks right away!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
