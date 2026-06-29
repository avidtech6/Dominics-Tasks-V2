import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBehaviours } from '../orchestrator/AppOrchestrator';
import { Task } from '../data/types';
import {
  getWeekRange,
  getWeekDays,
  groupTasksByDay,
  isoDay,
  countCompleted,
  WEEKLY_QUOTES,
  pickQuote,
} from '../behaviours/WeeklyBehaviour';
import { format } from 'date-fns';
import WeeklyHero from '../components/WeeklyHero';
import DayRail from '../components/DayRail';
import DayLane from '../components/DayLane';
import WeekSummaryCard from '../components/WeekSummaryCard';

const Weekly: React.FC = () => {
  const { taskBehaviour } = useBehaviours();
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Initial + live load via subscribe
  useEffect(() => {
    const initial = taskBehaviour.getTasksSync();
    setTasks(initial);
    const unsub = taskBehaviour.subscribe(() => {
      setTasks(taskBehaviour.getTasksSync());
    });
    return () => unsub();
  }, [taskBehaviour]);

  const weekDays = useMemo(() => getWeekDays(today), [today]);
  const weekRange = useMemo(() => getWeekRange(today), [today]);
  const tasksByDay = useMemo(() => groupTasksByDay(tasks, weekRange), [tasks, weekRange]);

  const hasTasksByDay = useMemo(() => {
    const out: Record<string, number> = {};
    for (const d of weekDays) out[isoDay(d)] = (tasksByDay[isoDay(d)] ?? []).length;
    return out;
  }, [tasksByDay, weekDays]);

  const doneByDay = useMemo(() => {
    const out: Record<string, number> = {};
    for (const d of weekDays) out[isoDay(d)] = countCompleted(tasksByDay[isoDay(d)] ?? []);
    return out;
  }, [tasksByDay, weekDays]);

  const weekLabel = `${format(weekRange.start, 'd')} – ${format(weekRange.end, 'd MMM yyyy')}`;

  // Auto-scroll today's lane into view on mount
  useEffect(() => {
    const iso = isoDay(today);
    const el = document.getElementById(`day-lane-${iso}`);
    if (el) {
      // small delay so layout settles
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
    }
  }, [today]);

  const handleToggleComplete = async (task: Task) => {
    try {
      await taskBehaviour.completeTask(task.id);
    } catch (err) {
      console.error('[Weekly] completeTask failed:', err);
    }
  };

  // Tap a task → navigate to /tasks with edit=<id>. Tasks.tsx reads the
  // query param and opens its existing edit modal — no new modal wiring.
  const handleOpenTask = (task: Task) => {
    navigate(`/tasks?edit=${encodeURIComponent(task.id)}`);
  };

  return (
    <div className="space-y-6" data-page="weekly">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Weekly View</h1>
        <p className="text-sm text-gray-500">A calm overview of the week — tap a day or category to dive in.</p>
      </div>

      <WeeklyHero tasksByDay={tasksByDay} weekLabel={weekLabel} />

      <DayRail
        days={weekDays}
        today={today}
        hasTasksByDay={hasTasksByDay}
        doneByDay={doneByDay}
      />

      <div className="space-y-4" data-testid="day-lanes">
        {weekDays.map((d) => (
          <DayLane
            key={isoDay(d)}
            day={d}
            today={today}
            tasks={tasksByDay[isoDay(d)] ?? []}
            onOpenTask={handleOpenTask}
            onToggleComplete={handleToggleComplete}
          />
        ))}
      </div>

      <WeekSummaryCard
        tasksByDay={tasksByDay}
        weekStart={weekRange.start}
        weekEnd={weekRange.end}
      />
    </div>
  );
};

export default Weekly;