
import React, { useMemo } from 'react';
import { Task, Project } from '../types';

interface GanttViewProps {
  tasks: Task[];
  projects: Project[];
  onOpenTask: (task: Task) => void;
}

const GanttView: React.FC<GanttViewProps> = ({ tasks, projects, onOpenTask }) => {
  // DYNAMIC DATE LOGIC
  const { startDate, endDate, totalDays, months } = useMemo(() => {
      if (tasks.length === 0) {
          // Default to current month view if no tasks
          const now = new Date();
          const start = new Date(now.getFullYear(), now.getMonth(), 1);
          const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          return { startDate: start, endDate: end, totalDays: 30, months: [{ name: now.toLocaleString('ru-RU', { month: 'short' }), year: now.getFullYear() }] };
      }

      // Find min start and max end
      const startTimestamps = tasks.map(t => new Date(t.startDate).getTime()).filter(t => !isNaN(t));
      const endTimestamps = tasks.map(t => new Date(t.endDate).getTime()).filter(t => !isNaN(t));
      
      let minTime = Math.min(...startTimestamps);
      let maxTime = Math.max(...endTimestamps);

      // Add buffer (7 days before and after)
      minTime -= 7 * 24 * 60 * 60 * 1000;
      maxTime += 7 * 24 * 60 * 60 * 1000;

      const start = new Date(minTime);
      const end = new Date(maxTime);
      const diff = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);

      // Generate months array for header
      const ms = [];
      const curr = new Date(start);
      curr.setDate(1); // align to month start for iteration
      while (curr < end) {
          ms.push({ name: curr.toLocaleString('ru-RU', { month: 'short' }), year: curr.getFullYear() });
          curr.setMonth(curr.getMonth() + 1);
      }

      return { startDate: start, endDate: end, totalDays: diff, months: ms };
  }, [tasks]);

  const getPosition = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = (d.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    const pos = (diff / totalDays) * 100;
    return Math.max(0, Math.min(100, pos));
  };

  const getWidth = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diff = (e.getTime() - s.getTime()) / (1000 * 3600 * 24);
    const w = (diff / totalDays) * 100;
    return Math.max(0.5, w); // Min width visibility
  };

  const groupedTasks = projects.map(p => ({
      project: p,
      tasks: tasks.filter(t => t.projectId === p.id)
  })).filter(g => g.tasks.length > 0);

  const noProjectTasks = tasks.filter(t => !t.projectId);
  if (noProjectTasks.length > 0) {
      groupedTasks.push({ project: { id: 'none', name: 'Без модуля' }, tasks: noProjectTasks });
  }

  return (
    <div className="w-full h-full overflow-hidden flex flex-col bg-white dark:bg-[#1e1e1e] rounded-lg border border-notion-border dark:border-[#333] shadow-sm">
      {/* Timeline Header */}
      <div className="flex border-b border-notion-border dark:border-[#333] h-10 bg-gray-50 dark:bg-[#252525] shrink-0">
        <div className="w-64 border-r border-notion-border dark:border-[#333] shrink-0 p-3 text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center bg-gray-50 dark:bg-[#252525] z-20">
            Проект / Задача
        </div>
        <div className="flex-1 flex relative overflow-hidden">
           {months.map((m, i) => (
               <div key={`${m.name}-${m.year}-${i}`} className="flex-1 border-l border-gray-200 dark:border-[#333] text-xs text-gray-500 dark:text-gray-400 p-2 font-medium bg-gray-50 dark:bg-[#252525] text-center">
                   {m.name} {m.year}
               </div>
           ))}
        </div>
      </div>

      {/* Timeline Body */}
      <div className="overflow-y-auto flex-1 pb-20 custom-scrollbar relative">
        {/* Background Grid (Visual Only) */}
        <div className="absolute inset-0 flex pointer-events-none pl-64">
             {months.map((_, i) => (
                 <div key={i} className="flex-1 border-l border-dashed border-gray-100 dark:border-[#2a2a2a] h-full"></div>
             ))}
        </div>

        {groupedTasks.map(group => (
            <div key={group.project.id} className="mb-0">
                <div className="bg-gray-50/90 dark:bg-[#252525]/95 backdrop-blur px-3 py-1.5 text-[10px] uppercase font-bold text-gray-600 dark:text-gray-300 sticky top-0 border-b border-gray-100 dark:border-[#333] z-10">
                    {group.project.name}
                </div>
                {group.tasks.map(task => {
                    const left = getPosition(task.startDate);
                    const width = getWidth(task.startDate, task.endDate);
                    
                    return (
                        <div key={task.id} className="flex h-8 hover:bg-blue-50/30 dark:hover:bg-[#252525] border-b border-gray-50 dark:border-[#2a2a2a] group relative">
                             <div 
                                className="w-64 border-r border-notion-border dark:border-[#333] shrink-0 px-3 text-xs truncate text-notion-text dark:text-gray-300 flex items-center cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-[#1e1e1e] z-10" 
                                onClick={() => onOpenTask(task)}
                             >
                                {task.title}
                             </div>
                             <div className="flex-1 relative flex items-center my-1 pr-4">
                                 {/* Task Bar */}
                                 <div 
                                    onClick={() => onOpenTask(task)}
                                    className="absolute h-4 rounded-full bg-blue-500/80 border border-blue-600 dark:border-blue-400 hover:bg-blue-600 cursor-pointer transition-all shadow-sm flex items-center z-0"
                                    style={{
                                        left: `${left}%`,
                                        width: `${width}%`
                                    }}
                                    title={`${task.title}: ${task.startDate} - ${task.endDate}`}
                                 >
                                    <span className="text-[9px] text-white px-1.5 truncate w-full font-medium drop-shadow-sm select-none">
                                        {width > 10 ? task.title : ''}
                                    </span>
                                 </div>
                             </div>
                        </div>
                    );
                })}
            </div>
        ))}
        {tasks.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">Нет задач с датами для отображения</div>
        )}
      </div>
    </div>
  );
};

export default GanttView;
