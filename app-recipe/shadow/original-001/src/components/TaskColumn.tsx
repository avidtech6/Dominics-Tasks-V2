import React from 'react';
import { Task } from '../types';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  title: string;
  icon?: string;
  tasks: Task[];
  color?: string;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ title, icon, tasks, color }) => {
  if (tasks.length === 0) {
    return (
      <div className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${color || 'border-l-blue-500'}`}>
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
          {icon && <span>{icon}</span>}
          <span>{title}</span>
        </h3>
        <div className="text-center py-8 text-gray-400">
          <p>No tasks in this section</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl p-4 shadow-sm border-l-4 ${color || 'border-l-blue-500'}`}>
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center justify-between">
        <span className="flex items-center space-x-2">
          {icon && <span>{icon}</span>}
          <span>{title}</span>
        </span>
        <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </h3>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;
