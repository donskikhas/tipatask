
import React, { useRef, useState, useEffect } from 'react';
import { Project, Role, Task, User, StatusOption, PriorityOption, TableCollection, BusinessProcess } from '../types';
import { Trash2, Calendar, Layout, AlertCircle, ChevronDown, Check, Network, TrendingUp } from 'lucide-react';

interface TableViewProps {
  tasks: Task[];
  users: User[];
  projects: Project[];
  statuses: StatusOption[];
  priorities: PriorityOption[];
  tables?: TableCollection[];
  isAggregator?: boolean;
  currentUser: User;
  businessProcesses?: BusinessProcess[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenTask: (task: Task) => void;
}

// Helper to convert loose color names/classes to full badges
const resolveColorClass = (colorInput: string, type: 'status' | 'priority' | 'project'): string => {
    if (!colorInput) {
        if (type === 'status') return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
        if (type === 'priority') return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#333]';
    }
    
    // If it looks like a full class string with dark mode support, return as is
    if (colorInput.includes('bg-') && colorInput.includes('text-')) {
        return colorInput;
    }

    // Fallback for old color format
    let baseColor = 'gray';
    if (colorInput.includes('blue')) baseColor = 'blue';
    else if (colorInput.includes('green') || colorInput.includes('emerald')) baseColor = 'emerald';
    else if (colorInput.includes('red') || colorInput.includes('rose')) baseColor = 'rose';
    else if (colorInput.includes('yellow') || colorInput.includes('amber')) baseColor = 'amber';
    else if (colorInput.includes('orange')) baseColor = 'orange';
    else if (colorInput.includes('purple') || colorInput.includes('violet')) baseColor = 'violet';
    else if (colorInput.includes('pink')) baseColor = 'pink';
    else if (colorInput.includes('indigo')) baseColor = 'indigo';

    if (type === 'project') {
        return `text-${baseColor}-600 dark:text-${baseColor}-400 bg-${baseColor}-50 dark:bg-${baseColor}-900/20 border border-${baseColor}-100 dark:border-${baseColor}-800`;
    }
    
    // Для статусов и приоритетов используем более яркие цвета
    if (type === 'status') {
        return `bg-${baseColor}-500 dark:bg-${baseColor}-600 text-white border border-${baseColor}-600 dark:border-${baseColor}-500`;
    }
    
    if (type === 'priority') {
        return `bg-${baseColor}-100 dark:bg-${baseColor}-900/40 text-${baseColor}-700 dark:text-${baseColor}-300 border border-${baseColor}-300 dark:border-${baseColor}-700`;
    }
    
    return `bg-${baseColor}-100 text-${baseColor}-800 dark:bg-${baseColor}-900/30 dark:text-${baseColor}-300`;
};

const CustomSelect = ({ value, options, onChange, type }: { value: string, options: any[], onChange: (val: string) => void, type: 'status' | 'priority' | 'project' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => (type === 'project' ? o.id : o.name) === value);
    const label = selectedOption ? selectedOption.name : (type === 'project' ? 'Без модуля' : value);
    const colorClass = selectedOption ? resolveColorClass(selectedOption.color, type) : 'text-gray-500 bg-gray-50 dark:bg-[#333]';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={containerRef}>
            <div 
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all w-full text-center flex items-center justify-center gap-1.5 hover:scale-105 active:scale-95 shadow-sm ${colorClass}`}
            >
                <span className="truncate">{label}</span>
                <ChevronDown size={12} className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-auto min-w-full bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto custom-scrollbar p-1.5">
                    {type === 'project' && (
                         <div 
                            onClick={(e) => { e.stopPropagation(); onChange(''); setIsOpen(false); }}
                            className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#303030] rounded-lg cursor-pointer text-xs text-gray-500 dark:text-gray-400 mb-1 transition-colors whitespace-nowrap"
                        >
                            Без модуля
                        </div>
                    )}
                    {options.map(opt => {
                        const val = type === 'project' ? opt.id : opt.name;
                        const optColor = resolveColorClass(opt.color, type);
                        return (
                            <div 
                                key={opt.id}
                                onClick={(e) => { e.stopPropagation(); onChange(val); setIsOpen(false); }}
                                className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-[#303030] rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                            >
                                <span className={`text-xs font-medium ${optColor} px-2 py-0.5 rounded inline-block`}>{opt.name}</span>
                                {val === value && <Check size={14} className="text-blue-500 dark:text-blue-400 flex-shrink-0 ml-auto"/>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

const TableView: React.FC<TableViewProps> = ({ 
  tasks, 
  users, 
  projects, 
  statuses, 
  priorities, 
  tables = [],
  isAggregator = false,
  currentUser,
  businessProcesses = [],
  onUpdateTask,
  onDeleteTask,
  onOpenTask
}) => {

  const getSourcePageName = (tableId: string) => {
      const t = tables.find(tb => tb.id === tableId);
      return t ? t.name : '';
  };

  const getProcessName = (task: Task) => {
      if (!task.processId) return null;
      return businessProcesses.find(p => p.id === task.processId)?.title || null;
  };

  const getTaskSource = (task: Task) => {
      // Если задача привязана к сделке — показываем "Сделка"
      if (task.dealId) {
          return { name: 'Сделка', isProcess: false, isDeal: true };
      }
      // Если задача привязана к бизнес-процессу — показываем название процесса
      if (task.processId) {
          const processName = getProcessName(task);
          return { name: processName || 'Процесс', isProcess: true };
      }
      // Иначе показываем название страницы
      return { name: getSourcePageName(task.tableId), isProcess: false };
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-white dark:bg-[#191919]">
      <div className="flex-1 overflow-auto custom-scrollbar pb-20">
        <table className="w-full text-left text-sm border-collapse min-w-[900px]">
          <thead className="sticky top-0 bg-white dark:bg-[#191919] z-10 shadow-sm shadow-gray-100 dark:shadow-black/20">
            <tr className="border-b border-notion-border dark:border-[#333] text-notion-muted dark:text-gray-500">
              <th className="py-2 px-4 font-normal text-xs w-[30%] border-r border-transparent">Задача</th>
              {isAggregator && <th className="py-2 px-4 font-normal text-xs w-32">Источник</th>}
              <th className="py-2 px-4 font-normal text-xs w-36">Статус</th>
              <th className="py-2 px-4 font-normal text-xs w-48">Ответственный</th>
              <th className="py-2 px-4 font-normal text-xs w-32">Приоритет</th>
              <th className="py-2 px-4 font-normal text-xs w-40">Модуль</th>
              <th className="py-2 px-4 font-normal text-xs w-32">Срок</th>
              {currentUser.role === Role.ADMIN && <th className="py-2 px-4 w-10"></th>}
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => {
                return (
                    <tr key={task.id} className="border-b border-notion-border dark:border-[#2a2a2a] hover:bg-notion-hover/50 dark:hover:bg-[#222] group transition-colors">
                    {/* TASK TITLE */}
                    <td className="py-2 px-4 align-middle">
                        <div className="font-medium text-notion-text dark:text-gray-200 cursor-pointer hover:underline decoration-notion-muted truncate" onClick={() => onOpenTask(task)}>
                            {task.title}
                        </div>
                    </td>
                    
                    {/* SOURCE */}
                    {isAggregator && (() => {
                        const source = getTaskSource(task);
                        return (
                            <td className="py-2 px-4 align-middle">
                                <div className="flex items-center gap-1.5 text-xs">
                                    {source.isProcess ? (
                                        <>
                                            <Network size={12} className="text-indigo-500" />
                                            <span className="truncate max-w-[100px] text-indigo-600 dark:text-indigo-400 font-medium">{source.name}</span>
                                        </>
                                    ) : (source as any).isDeal ? (
                                        <>
                                            <TrendingUp size={12} className="text-blue-500" />
                                            <span className="truncate max-w-[100px] text-blue-600 dark:text-blue-400 font-medium">{source.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Layout size={12} className="text-gray-500 dark:text-gray-400" />
                                            <span className="truncate max-w-[100px] text-gray-500 dark:text-gray-400">{source.name}</span>
                                        </>
                                    )}
                                </div>
                            </td>
                        );
                    })()}

                    {/* STATUS */}
                    <td className="py-2 px-4 align-middle">
                        <CustomSelect 
                            value={task.status} 
                            options={statuses} 
                            type="status" 
                            onChange={(val) => onUpdateTask(task.id, { status: val })} 
                        />
                    </td>

                    {/* ASSIGNEE */}
                    <td className="py-2 px-4 align-middle text-notion-text">
                        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => onOpenTask(task)}>
                            <div className="flex -space-x-1.5 shrink-0">
                                {task.assigneeIds && task.assigneeIds.length > 0 ? (
                                    task.assigneeIds.map(uid => {
                                        const u = users.find(us => us.id === uid);
                                        if(!u) return null;
                                        return <img key={uid} src={u.avatar} className="w-6 h-6 rounded-full border border-white dark:border-[#252525]" title={u.name} />;
                                    })
                                ) : task.assigneeId ? (
                                    <img src={users.find(u => u.id === task.assigneeId)?.avatar} className="w-6 h-6 rounded-full border border-white dark:border-[#252525]" title={users.find(u => u.id === task.assigneeId)?.name} />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-[#333] border border-white dark:border-[#252525]"></div>
                                )}
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[100px]">
                                {task.assigneeIds && task.assigneeIds.length > 0 
                                    ? users.find(u => u.id === task.assigneeIds![0])?.name
                                    : task.assigneeId ? users.find(u => u.id === task.assigneeId)?.name : 'Не назначено'}
                            </span>
                        </div>
                    </td>

                    {/* PRIORITY */}
                    <td className="py-2 px-4 align-middle">
                        <CustomSelect 
                            value={task.priority} 
                            options={priorities} 
                            type="priority" 
                            onChange={(val) => onUpdateTask(task.id, { priority: val })} 
                        />
                    </td>

                    {/* MODULE */}
                    <td className="py-2 px-4 align-middle">
                        <CustomSelect 
                            value={task.projectId || ''} 
                            options={projects} 
                            type="project" 
                            onChange={(val) => onUpdateTask(task.id, { projectId: val || null })} 
                        />
                    </td>

                    {/* DATE */}
                    <td className="py-2 px-4 align-middle">
                        <DatePickerCell date={task.endDate} onChange={(val) => onUpdateTask(task.id, { endDate: val })} />
                    </td>
                    
                    {/* DELETE */}
                    {currentUser.role === Role.ADMIN && (
                        <td className="py-2 px-4 align-middle text-right">
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDeleteTask(task.id);
                                }}
                                className="text-gray-300 hover:text-red-500 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                                title="В архив"
                            >
                                <Trash2 size={14} />
                            </button>
                        </td>
                    )}
                    </tr>
                );
            })}
            {tasks.length === 0 && (
                <tr>
                    <td colSpan={isAggregator ? 8 : 7} className="text-center py-12 text-notion-muted dark:text-gray-500 bg-notion-bg-subtle/50 dark:bg-[#202020] rounded-lg mt-4 border border-dashed border-notion-border dark:border-[#333]">
                        <div className="flex flex-col items-center gap-2">
                            <AlertCircle size={24} className="opacity-20"/>
                            <span>Задач нет</span>
                        </div>
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DatePickerCell: React.FC<{ date: string, onChange: (val: string) => void }> = ({ date, onChange }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const isOverdue = new Date(date) < new Date() && new Date(date).toDateString() !== new Date().toDateString();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        try { if (inputRef.current) inputRef.current.showPicker(); } 
        catch (err) { inputRef.current?.focus(); }
    };

    return (
        <div className="relative group/date w-full cursor-pointer" onClick={handleClick}>
            <div className={`flex items-center gap-2 rounded px-2 py-1 transition-colors min-h-[24px] ${isOverdue ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'hover:bg-gray-100 dark:hover:bg-[#333] text-gray-600 dark:text-gray-400'}`}>
                <span className="text-xs pointer-events-none font-medium">{formatDate(date)}</span>
                <Calendar size={12} className={`md:opacity-0 md:group-hover/date:opacity-100 pointer-events-none ${isOverdue ? 'text-red-400' : 'text-gray-400'}`} />
            </div>
            <input 
                ref={inputRef} type="date" value={date} onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
};

export default TableView;
