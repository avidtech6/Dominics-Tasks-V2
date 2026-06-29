/**
 * Achievements Page
 * Displays all achievements with progress tracking
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useBehaviours } from '../orchestrator/AppOrchestrator';
import { Achievement, Task } from '../data/types';
import ConfettiCelebration from '../components/ConfettiCelebration';
import { User } from '../data/types';
import { Trophy, Flame, Star, Target, BookOpen, Zap, Award } from 'lucide-react';
import AchievementBadge from '../components/AchievementBadge';

// Achievement Definitions
const ACHIEVEMENTS: Achievement[] = [
  // Daily Achievements
  {
    id: 'first_blood',
    title: 'First Step',
    description: 'Complete your first task',
    icon: '🌟',
    epReward: 100,
    category: 'daily',
    requirement: (user, tasks) => tasks.filter(t => t.status === 'done').length >= 1,
  },
  {
    id: 'week_warrior',
    title: 'Week Warrior',
    description: 'Complete 7 tasks in a week',
    icon: '💪',
    epReward: 200,
    category: 'daily',
    requirement: (user, tasks) => tasks.filter(t => t.status === 'done').length >= 7,
  },
  {
    id: 'month_master',
    title: 'Month Master',
    description: 'Complete 30 tasks in a month',
    icon: '👑',
    epReward: 500,
    category: 'daily',
    requirement: (user, tasks) => tasks.filter(t => t.status === 'done').length >= 30,
  },

  // Subject Achievements
  {
    id: 'math_master',
    title: 'Math Master',
    description: 'Complete 20 math tasks',
    icon: '🔢',
    epReward: 300,
    category: 'subject',
    requirement: (user, tasks) => tasks.filter(t => 
      t.status === 'done' && (t.tags?.includes('math') || t.tags?.includes('Math'))
    ).length >= 20,
  },
  {
    id: 'science_scholar',
    title: 'Science Scholar',
    description: 'Complete 20 science tasks',
    icon: '🔬',
    epReward: 300,
    category: 'subject',
    requirement: (user, tasks) => tasks.filter(t => 
      t.status === 'done' && (t.tags?.includes('science') || t.tags?.includes('Science'))
    ).length >= 20,
  },
  {
    id: 'computer_champion',
    title: 'Computer Champion',
    description: 'Complete 20 CS tasks',
    icon: '💻',
    epReward: 300,
    category: 'subject',
    requirement: (user, tasks) => tasks.filter(t => 
      t.status === 'done' && (t.tags?.includes('computerscience') || t.tags?.includes('Computer Science'))
    ).length >= 20,
  },

  // Time Achievements
  // Early Bird - Complete a task before 10 AM (more realistic for daily routine)
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a task before 10 AM',
    icon: '🐦',
    epReward: 100,
    category: 'time',
    requirement: (user, tasks) => tasks.filter(t => {
      if (t.status !== 'done' || !t.completedAt) return false;
      const hour = new Date(t.completedAt).getHours();
      return hour < 10;
    }).length >= 1,
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a task after 8 PM',
    icon: '🦉',
    epReward: 100,
    category: 'time',
    requirement: (user, tasks) => tasks.filter(t => {
      if (t.status !== 'done' || !t.completedAt) return false;
      const hour = new Date(t.completedAt).getHours();
      return hour >= 20;
    }).length >= 1,
  },
  {
    id: 'streak_7',
    title: '7-Day Streak',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    epReward: 250,
    category: 'time',
    requirement: (user) => (user.currentStreak || 0) >= 7,
  },
  {
    id: 'streak_30',
    title: '30-Day Streak',
    description: 'Maintain a 30-day streak',
    icon: '💪',
    epReward: 1000,
    category: 'time',
    requirement: (user) => (user.currentStreak || 0) >= 30,
  },

  // Special Achievements
  {
    id: 'century_club',
    title: 'Century Club',
    description: 'Complete 100 tasks',
    icon: '🏆',
    epReward: 1000,
    category: 'special',
    requirement: (user, tasks) => tasks.filter(t => t.status === 'done').length >= 100,
  },
  {
    id: 'level_10',
    title: 'Momentum Builder',
    description: 'Reach Level 10',
    icon: '🎖️',
    epReward: 500,
    category: 'special',
    requirement: (user) => (user.level || 0) >= 10,
  },
  {
    id: 'all_types',
    title: 'Jack of All Trades',
    description: 'Complete one of each task type',
    icon: '🎪',
    epReward: 300,
    category: 'special',
    requirement: (user, tasks) => {
      const doneTasks = tasks.filter(t => t.status === 'done');
      const types = new Set(doneTasks.map(t => t.taskType));
      return types.size >= 5;
    },
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Trophy },
  { id: 'daily', label: 'Daily', icon: Flame },
  { id: 'subject', label: 'Subject', icon: BookOpen },
  { id: 'time', label: 'Time', icon: Zap },
  { id: 'special', label: 'Special', icon: Award },
];

const Achievements: React.FC = () => {
  const { authBehaviour, taskBehaviour } = useBehaviours();
  const [user, setUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [celebrate, setCelebrate] = useState<{ show: boolean; title: string }>({ show: false, title: '' });

  // Per M08 recipe §A: ConfettiCelebration fires on task completion milestone.
  useEffect(() => {
    const unsub = taskBehaviour.subscribe(async (event: any) => {
      if (event?.type === 'task_updated' && event.task?.status === 'done') {
        // Simple milestone rule: 1st task = first_achievement. Real rules in AchievementBadgeBehaviour.
        const completed = await taskBehaviour.getTasks();
        const done = (completed || []).filter((t) => t.status === 'done');
        if (done.length === 1) {
          setCelebrate({ show: true, title: 'First Task Complete!' });
          setTimeout(() => setCelebrate((c) => ({ ...c, show: false })), 3500);
        }
      }
    });
    return () => unsub();
  }, [taskBehaviour]);

  // Load user data
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

  // Calculate earned achievements
  const { earnedIds, progress } = useMemo(() => {
    const earnedIds: string[] = [];
    let earnedCount = 0;

    if (user) {
      taskBehaviour.getTasks().then(tasks => {
        ACHIEVEMENTS.forEach(achievement => {
          if (achievement.requirement(user || undefined, tasks)) {
            earnedIds.push(achievement.id);
            earnedCount++;
          }
        });
      });
    }

    const progress = Math.round((earnedCount / ACHIEVEMENTS.length) * 100);

    return { earnedIds, progress };
  }, [user, taskBehaviour]);

  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'all') return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter(a => a.category === selectedCategory);
  }, [selectedCategory]);

  const earnedEP = useMemo(() => {
    return ACHIEVEMENTS
      .filter(a => earnedIds.includes(a.id))
      .reduce((sum, a) => sum + a.epReward, 0);
  }, [earnedIds]);

  return (
    <div className="space-y-6">
      <ConfettiCelebration
        show={celebrate.show}
        message={celebrate.title}
        onComplete={() => setCelebrate((c) => ({ ...c, show: false }))}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
            <Trophy className="text-amber-500" size={28} />
            <span>Achievements</span>
          </h1>
          <p className="text-gray-500">Unlock badges by completing tasks</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-white">
          <Trophy size={24} className="mb-2" />
          <p className="text-2xl font-bold">{earnedIds.length}/{ACHIEVEMENTS.length}</p>
          <p className="text-sm text-amber-100">Earned</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <Star size={24} className="text-amber-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">{earnedEP.toLocaleString()}</p>
          <p className="text-sm text-gray-500">EP Earned</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <Target size={24} className="text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-gray-800">{progress}%</p>
          <p className="text-sm text-gray-500">Complete</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Overall Progress</span>
          <span className="text-sm font-medium text-gray-800">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setSelectedCategory(id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
              selectedCategory === id
                ? 'bg-amber-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredAchievements.map((achievement) => {
          const isEarned = earnedIds.includes(achievement.id);
          return (
            <AchievementBadge
              key={achievement.id}
              achievement={achievement}
              earned={isEarned}
              onClick={() => setSelectedAchievement(achievement)}
            />
          );
        })}
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAchievement(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className={`w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-5xl ${
                earnedIds.includes(selectedAchievement.id) 
                  ? 'bg-amber-200' 
                  : 'bg-gray-200'
              }`}>
                {earnedIds.includes(selectedAchievement.id) 
                  ? selectedAchievement.icon 
                  : '🔒'
                }
              </div>
              <h2 className="text-xl font-bold text-gray-800 mt-4">
                {selectedAchievement.title}
              </h2>
              <p className="text-gray-600 mt-2">{selectedAchievement.description}</p>
              
              <div className="flex items-center justify-center space-x-2 mt-4">
                <Star className="text-amber-500" size={20} />
                <span className="font-semibold text-amber-600">
                  +{selectedAchievement.epReward} EP
                </span>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium text-gray-800 capitalize">
                  {selectedAchievement.category}
                </p>
              </div>

              <button
                onClick={() => setSelectedAchievement(null)}
                className="mt-6 w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Achievements;
