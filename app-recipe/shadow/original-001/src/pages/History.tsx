import React, { useState, useMemo, useEffect } from 'react';
import { useBehaviours } from '../orchestrator/AppOrchestrator';
import { format, startOfWeek, eachDayOfInterval, subDays, startOfMonth } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Trophy, Flame, Star, TrendingUp, CheckCircle, Target } from 'lucide-react';
import { getEPForNextLevel, getEPProgress } from '../data/utils';
import { User } from '../data/types';
import { UserProfile } from '../components/ParentDashboardBehaviour';

const History: React.FC = () => {
  const { authBehaviour, taskBehaviour } = useBehaviours();
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
  const [user, setUser] = useState<UserProfile | null>(null);

  const [completedTasks, setCompletedTasks] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const tasks = await taskBehaviour.getTasks();
      setCompletedTasks(tasks.filter((t: any) => t.status === 'done'));
      
      const currentUser = await authBehaviour.getCurrentUser();
      setUser(currentUser);
    };
    loadData();
  }, [authBehaviour, taskBehaviour]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCompleted = completedTasks.length;
    const totalEP = user?.stats?.totalEP || 0;
    const currentStreak = user?.stats?.currentStreak || 0;
    const level = 1; // Level not available in UserProfile interface

    // Tasks by type
    const tasksByType = completedTasks.reduce((acc, task) => {
      acc[task.taskType] = (acc[task.taskType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Tasks by day for chart
    const startDate = timeRange === 'week'
      ? startOfWeek(new Date())
      : startOfMonth(new Date());

    const dailyData = eachDayOfInterval({
      start: startDate,
      end: new Date(),
    }).map((date) => {
      const dayTasks = completedTasks.filter((t) =>
        t.completedAt && format(new Date(t.completedAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      return {
        date: format(date, timeRange === 'week' ? 'EEE' : 'MMM d'),
        tasks: dayTasks.length,
        xp: dayTasks.reduce((sum, t) => sum + t.pointsValue, 0),
      };
    });

    // Weekly EP data
    const weeklyData = Array.from({ length: 4 }, (_, i) => {
      const weekStart = subDays(new Date(), (i + 1) * 7);
      const weekEnd = subDays(new Date(), i * 7);
      const weekTasks = completedTasks.filter((t) => {
        if (!t.completedAt) return false;
        const taskDate = new Date(t.completedAt);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });
      return {
        week: `Week ${4 - i}`,
        xp: weekTasks.reduce((sum, t) => sum + t.pointsValue, 0),
        tasks: weekTasks.length,
      };
    }).reverse();

    // Task type distribution for pie chart
    const colorMap = {
      regular: '#3B82F6',
      assignment: '#8B5CF6',
      exam: '#EF4444',
      project: '#F59E0B',
      personal: '#10B981',
    };

    const typeData = Object.entries(tasksByType).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: colorMap[type as keyof typeof colorMap] || '#6B7280',
    }));

    return {
      totalCompleted,
      totalEP,
      currentStreak,
      level,
      tasksByType,
      dailyData,
      weeklyData,
      typeData,
      epProgress: getEPProgress(totalEP),
      epForNextLevel: getEPForNextLevel(totalEP),
    };
  }, [completedTasks, user, taskBehaviour, timeRange]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
          <TrendingUp className="text-green-500" size={28} />
          <span>History & Stats</span>
        </h1>
        <p className="text-gray-500">Track your progress and achievements</p>
      </div>

      {/* Level Progress Card */}
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Trophy size={32} />
            </div>
            <div>
              <p className="text-amber-100 text-sm">Current Level</p>
              <p className="text-3xl font-bold">Level {stats.level}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-amber-100 text-sm">Total EP</p>
            <p className="text-2xl font-bold">{stats.totalEP.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white/20 rounded-full h-4 overflow-hidden">
          <div
            className="bg-white h-full rounded-full transition-all duration-500"
            style={{ width: `${stats.epProgress}%` }}
          />
        </div>
        <p className="text-amber-100 text-sm mt-2">
          {stats.totalEP % 1000} / 1000 EP to Level {stats.level + 1}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Flame className="text-orange-500" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.currentStreak}</p>
          <p className="text-sm text-gray-500">Day Streak</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-green-500" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalCompleted}</p>
          <p className="text-sm text-gray-500">Tasks Done</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Star className="text-amber-500" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.totalEP.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total EP Earned</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Target className="text-blue-500" size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.level}</p>
          <p className="text-sm text-gray-500">Current Level</p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-xl p-1 flex">
          <button
            onClick={() => setTimeRange('week')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'week'
                ? 'bg-white text-gray-800 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              timeRange === 'month'
                ? 'bg-white text-gray-800 shadow'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Daily Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar dataKey="tasks" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task Type Distribution */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-800 mb-4">Tasks by Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stats.typeData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {stats.typeData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-500">
                  {String(item.name)} ({String(item.value)})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">Weekly EP Progress</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={stats.weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="week" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Line
              type="monotone"
              dataKey="xp"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={{ fill: '#F59E0B', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Completed Tasks */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-gray-800 mb-4">Recent Completed Tasks</h3>
        {completedTasks.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No completed tasks yet</p>
        ) : (
          <div className="space-y-3">
            {completedTasks.slice(0, 10).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                    style={{
                      backgroundColor: (task.taskType === 'regular' && '#3B82F6') ||
                                      (task.taskType === 'assignment' && '#8B5CF6') ||
                                      (task.taskType === 'exam' && '#EF4444') ||
                                      (task.taskType === 'project' && '#F59E0B') ||
                                      (task.taskType === 'personal' && '#10B981') ||
                                      '#6B7280',
                    }}
                  >
                    {task.taskType === 'regular' && '📋'}
                    {task.taskType === 'assignment' && '📝'}
                    {task.taskType === 'exam' && '🎯'}
                    {task.taskType === 'project' && '🚀'}
                    {task.taskType === 'personal' && '⭐'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-xs text-gray-500">
                      {task.completedAt && format(new Date(task.completedAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-amber-500">+{task.pointsValue} EP</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
