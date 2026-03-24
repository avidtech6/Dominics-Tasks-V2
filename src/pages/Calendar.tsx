import React, { useState, useMemo } from 'react';
import { useBehaviours } from '../orchestrator/AppOrchestrator';
import { Task, TaskType } from '../data/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { getTaskTypeColor, getTaskTypeIcon } from '../data/utils';

const Calendar: React.FC = () => {
  const { taskBehaviour } = useBehaviours();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Get first day of week for padding
  const firstDayOfWeek = startOfMonth(currentDate).getDay();

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    const tasks = taskBehaviour.getTasksSync();
    return tasks.filter(
      (task) =>
        task.dueDate && isSameDay(new Date(task.dueDate), selectedDate) && task.status !== 'done'
    );
  }, [taskBehaviour, selectedDate]);

  // Get all upcoming deadlines
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const tasks = taskBehaviour.getTasksSync();
    return tasks
      .filter(
        (task) =>
          task.deadlineDate &&
          new Date(task.deadlineDate) > now &&
          task.status !== 'done'
      )
      .sort((a, b) =>
        new Date(a.deadlineDate!).getTime() - new Date(b.deadlineDate!).getTime()
      )
      .slice(0, 5);
  }, [taskBehaviour]);

  // Get overdue tasks
  const overdueTasks = useMemo(() => {
    const now = new Date();
    const tasks = taskBehaviour.getTasksSync();
    return tasks.filter(
      (task) =>
        (task.deadlineDate && new Date(task.deadlineDate) < now && task.status !== 'done') ||
        (task.dueDate && new Date(task.dueDate) < now && task.status === 'todo')
    );
  }, [taskBehaviour]);

  // Get tasks by date for calendar display
  const getTasksForDate = (date: Date): Task[] => {
    const tasks = taskBehaviour.getTasksSync();
    return tasks.filter(
      (task) =>
        task.dueDate && isSameDay(new Date(task.dueDate), date) && task.status !== 'done'
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) =>
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    );
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Calendar</h1>
          <p className="text-gray-500">View tasks and deadlines</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Today Button */}
          <button
            onClick={() => {
              setCurrentDate(new Date());
              setSelectedDate(new Date());
            }}
            className="mb-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-200 transition-colors"
          >
            Today
          </button>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for padding */}
            {Array.from({ length: firstDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square p-1" />
            ))}

            {/* Calendar days */}
            {calendarDays.map((day) => {
              const dayTasks = getTasksForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const hasTasks = dayTasks.length > 0;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square p-1 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-blue-500 text-white'
                      : isToday(day)
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-sm font-medium">{format(day, 'd')}</span>
                    {hasTasks && (
                      <div className="flex gap-0.5 mt-1">
                        {dayTasks.slice(0, 3).map((task, i) => (
                          <div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: getTaskTypeColor(task.taskType) }}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className={`text-[8px] ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                            +{dayTasks.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Task Type Legend */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-3 justify-center">
              {(['regular', 'assignment', 'exam', 'project', 'personal'] as TaskType[]).map(
                (type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getTaskTypeColor(type) }}
                    />
                    <span className="text-xs text-gray-500">
                      {getTaskTypeIcon(type)} {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Tasks */}
          {selectedDate && (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">
                {isToday(selectedDate)
                  ? "Today's Tasks"
                  : format(selectedDate, 'EEEE, MMMM d')}
              </h3>

              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle className="mx-auto mb-2" size={32} />
                  <p>No tasks scheduled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 bg-gray-50 rounded-xl"
                      style={{ borderLeft: `4px solid ${getTaskTypeColor(task.taskType)}` }}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span>{getTaskTypeIcon(task.taskType)}</span>
                        <span className="font-medium text-gray-800">{task.title}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>⭐ {task.pointsValue} EP</span>
                        {task.priority !== 'medium' && (
                          <span className="capitalize">• {task.priority}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <Clock className="text-blue-500" size={20} />
              <span>Upcoming Deadlines</span>
            </h3>

            {upcomingDeadlines.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No upcoming deadlines</p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((task) => {
                  const daysLeft = Math.ceil(
                    (new Date(task.deadlineDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );

                  return (
                    <div
                      key={task.id}
                      className="p-3 bg-blue-50 rounded-xl"
                      style={{ borderLeft: `4px solid ${getTaskTypeColor(task.taskType)}` }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800">{task.title}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            daysLeft <= 1
                              ? 'bg-red-100 text-red-600'
                              : daysLeft <= 3
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{getTaskTypeIcon(task.taskType)}</span>
                        <span>Due {format(new Date(task.deadlineDate!), 'MMM d')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <div className="bg-red-50 rounded-2xl shadow-sm p-6 border border-red-100">
              <h3 className="font-bold text-red-800 mb-4 flex items-center space-x-2">
                <AlertTriangle size={20} />
                <span>Overdue ({overdueTasks.length})</span>
              </h3>

              <div className="space-y-3">
                {overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 bg-white rounded-xl"
                    style={{ borderLeft: '4px solid #EF4444' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800">{task.title}</span>
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                        Overdue
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Was due {format(new Date(task.deadlineDate || task.dueDate!), 'MMM d')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
