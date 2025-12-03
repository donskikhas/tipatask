
import React, { useState, useEffect, useRef } from 'react';
import { Project, Task, User, StatusOption, PriorityOption } from '../types';
import { X, Calendar as CalendarIcon, User as UserIcon, Tag, Plus, CheckCircle2, Archive, AlignLeft, Paperclip, Send, File, Image as ImageIcon, MessageSquare, Download, Flag, Link as LinkIcon, Check, ChevronDown } from 'lucide-react';

interface TaskModalProps {
  users: User[];
  projects: Project[];
  statuses: StatusOption[];
  priorities: PriorityOption[];
  currentUser: User;
  onSave: (task: Partial<Task>) => void;
  onClose: () => void;
  onCreateProject: (name: string) => void;
  onDelete?: (taskId: string) => void;
  onAddComment?: (taskId: string, text: string) => void;
  onAddAttachment?: (taskId: string, file: File) => void;
  task?: Partial<Task> | null; // Changed to Partial to accept pre-filled data
}

const TaskModal: React.FC<TaskModalProps> = ({ 
    users, projects, statuses, priorities, currentUser, 
    onSave, onClose, onCreateProject, onDelete, 
    onAddComment, onAddAttachment, task 
}) => {
  // Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>(priorities[0]?.name || '');
  const [projectId, setProjectId] = useState<string>(projects[0]?.id || '');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<string>(statuses[0]?.name || '');
  const [contentPostId, setContentPostId] = useState<string | undefined>(undefined);
  
  // Comment Input
  const [commentText, setCommentText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prevTaskId, setPrevTaskId] = useState<string | null>(null);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const assigneeDropdownRef = useRef<HTMLDivElement>(null);
  const [currentTask, setCurrentTask] = useState<Partial<Task> | null>(task);

  // Обновляем currentTask при изменении task пропа (для синхронизации комментариев)
  useEffect(() => {
    if (task) {
      setCurrentTask(task);
    } else {
      setCurrentTask(null);
    }
  }, [task]);

  useEffect(() => {
    // Determine if it's an existing task (has ID) or a new one
    if (currentTask && currentTask.id && currentTask.id !== prevTaskId) {
        setTitle(currentTask.title || '');
        setDescription(currentTask.description || '');
        setPriority(currentTask.priority || priorities[0]?.name || '');
        setProjectId(currentTask.projectId || '');
        setAssigneeId(currentTask.assigneeId || '');
        setAssigneeIds(currentTask.assigneeIds || (currentTask.assigneeId ? [currentTask.assigneeId] : []));
        setStartDate(currentTask.startDate || new Date().toISOString().split('T')[0]);
        setEndDate(currentTask.endDate || new Date().toISOString().split('T')[0]);
        setStatus(currentTask.status || statuses[0]?.name || '');
        setContentPostId(currentTask.contentPostId);
        setPrevTaskId(currentTask.id);
    } else if (currentTask && !currentTask.id && prevTaskId !== 'new_prefilled') {
        // New task with pre-filled data (e.g. contentPostId, dealId)
        setTitle(currentTask.title || '');
        setDescription(currentTask.description || '');
        setAssigneeId(currentTask.assigneeId || currentUser.id);
        setAssigneeIds(currentTask.assigneeIds || (currentTask.assigneeId ? [currentTask.assigneeId] : [currentUser.id]));
        setStatus(currentTask.status || statuses[0]?.name || '');
        setPriority(currentTask.priority || priorities[0]?.name || '');
        setProjectId(currentTask.projectId || '');
        setStartDate(currentTask.startDate || new Date().toISOString().split('T')[0]);
        setEndDate(currentTask.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        setContentPostId(currentTask.contentPostId);
        setPrevTaskId('new_prefilled');
    } else if (!currentTask && prevTaskId !== 'new') {
        // Completely new task
        setTitle('');
        setDescription('');
        setAssigneeId(currentUser.id);
        setAssigneeIds([currentUser.id]);
        setStatus(statuses[0]?.name || '');
        setContentPostId(undefined);
        setPrevTaskId('new');
    }
  }, [currentTask, currentUser, prevTaskId, priorities, statuses]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSave({
      id: currentTask?.id,
      title,
      description,
      priority,
      projectId: projectId || null,
      assigneeId: assigneeIds[0] || null, 
      assigneeIds,
      status: currentTask?.id ? status : (statuses[0]?.name || 'Не начато'),
      startDate,
      endDate,
      contentPostId,
      dealId: currentTask?.dealId // Сохраняем dealId из исходной задачи
    });
  };

  const handleSendComment = () => {
      if (!commentText.trim() || !currentTask?.id || !onAddComment) return;
      onAddComment(currentTask.id, commentText);
      setCommentText('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0] && currentTask?.id && onAddAttachment) {
          onAddAttachment(currentTask.id, e.target.files[0]);
      }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
          if (window.confirm("Сохранить изменения перед закрытием?")) {
              handleSubmit();
          } else {
              onClose();
          }
      }
  };

  const toggleAssignee = (uid: string) => {
      if (assigneeIds.includes(uid)) {
          setAssigneeIds(assigneeIds.filter(id => id !== uid));
      } else {
          setAssigneeIds([...assigneeIds, uid]);
      }
  };

  // Закрытие выпадающего списка при клике вне его
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(event.target as Node)) {
              setIsAssigneeDropdownOpen(false);
          }
      };
      if (isAssigneeDropdownOpen) {
          document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, [isAssigneeDropdownOpen]);

  const getStatusColor = (sName: string) => statuses.find(s => s.name === sName)?.color || 'bg-gray-100';
  const getPriorityColor = (pName: string) => priorities.find(p => p.name === pName)?.color || 'bg-gray-100';

  // Компонент для красивого выпадающего списка статусов и приоритетов
  const StatusPrioritySelect = ({ value, options, onChange, type, getColor }: { 
    value: string, 
    options: StatusOption[] | PriorityOption[], 
    onChange: (val: string) => void, 
    type: 'status' | 'priority',
    getColor: (name: string) => string
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedOption = options.find(o => o.name === value);
    const colorClass = getColor(value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative flex-1" ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center justify-between ${colorClass}`}
            >
                <span className="truncate">{value}</span>
                <ChevronDown size={16} className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-auto min-w-full bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto custom-scrollbar p-1">
                    {options.map(opt => {
                        const optColor = getColor(opt.name);
                        return (
                            <div 
                                key={opt.id}
                                onClick={() => {
                                    onChange(opt.name);
                                    setIsOpen(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-[#303030] rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                            >
                                <span className={`text-sm font-medium ${optColor} px-2 py-0.5 rounded inline-block`}>{opt.name}</span>
                                {opt.name === value && <Check size={16} className="text-blue-500 dark:text-blue-400 flex-shrink-0 ml-auto"/>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
  };

  // Компонент для выбора модуля
  const ModuleSelect = ({ value, options, onChange, onCreateProject }: {
    value: string,
    options: Project[],
    onChange: (val: string) => void,
    onCreateProject: (name: string) => void
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const selectedProject = options.find(p => p.id === value);

    // Функция для получения цвета модуля (как в TableView)
    const resolveProjectColor = (colorInput: string | undefined): string => {
        if (!colorInput) return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700';
        if (colorInput.includes('bg-') && colorInput.includes('text-')) return colorInput;
        
        // Fallback для старых форматов
        let baseColor = 'gray';
        if (colorInput.includes('blue')) baseColor = 'blue';
        else if (colorInput.includes('green') || colorInput.includes('emerald')) baseColor = 'emerald';
        else if (colorInput.includes('red') || colorInput.includes('rose')) baseColor = 'rose';
        else if (colorInput.includes('yellow') || colorInput.includes('amber')) baseColor = 'amber';
        else if (colorInput.includes('orange')) baseColor = 'orange';
        else if (colorInput.includes('purple') || colorInput.includes('violet')) baseColor = 'violet';
        else if (colorInput.includes('pink')) baseColor = 'pink';
        else if (colorInput.includes('indigo')) baseColor = 'indigo';
        
        return `text-${baseColor}-600 dark:text-${baseColor}-400 bg-${baseColor}-50 dark:bg-${baseColor}-900/20 border border-${baseColor}-100 dark:border-${baseColor}-800`;
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleCreateNew = () => {
        const name = prompt('Новый модуль:');
        if (name) {
            onCreateProject(name);
            setIsOpen(false);
        }
    };

    return (
        <div className="relative flex-1 flex gap-2" ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className="flex-1 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all flex items-center justify-between bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#303030]"
            >
                <span className="truncate">{selectedProject?.name || 'Без модуля'}</span>
                <ChevronDown size={16} className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            <button 
                type="button" 
                onClick={handleCreateNew}
                className="px-3 py-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-[#303030] rounded-lg transition-colors"
                title="Создать модуль"
            >
                <Plus size={18}/>
            </button>
            
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-auto min-w-full bg-white dark:bg-[#252525] border border-gray-200 dark:border-[#333] rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto custom-scrollbar p-1">
                    <div 
                        onClick={() => {
                            onChange('');
                            setIsOpen(false);
                        }}
                        className="px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-[#303030] rounded-lg cursor-pointer transition-colors text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap"
                    >
                        Без модуля
                    </div>
                    {options.map(project => {
                        const projectColor = resolveProjectColor(project.color);
                        return (
                            <div 
                                key={project.id}
                                onClick={() => {
                                    onChange(project.id);
                                    setIsOpen(false);
                                }}
                                className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-[#303030] rounded-lg cursor-pointer transition-colors whitespace-nowrap"
                            >
                                <span className={`text-sm font-medium ${projectColor} px-2 py-0.5 rounded inline-block`}>{project.name}</span>
                                {project.id === value && <Check size={16} className="text-blue-500 dark:text-blue-400 flex-shrink-0"/>}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200 p-0 md:p-4" onClick={handleBackdropClick} style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="bg-white dark:bg-[#1e1e1e] w-full h-full md:h-[85vh] md:max-w-5xl md:rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden border-0 md:border border-gray-200 dark:border-gray-800" onClick={e => e.stopPropagation()}>
        
        {/* LEFT COLUMN: DETAILS */}
        <div className="flex-1 flex flex-col min-w-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1e1e] h-auto md:h-auto min-h-0">
            {/* Header */}
            <div className="p-3 md:p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start shrink-0">
                <div className="flex-1 mr-2 md:mr-4 min-w-0">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Название задачи</label>
                    <input 
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full text-base md:text-lg font-semibold bg-white dark:bg-[#252525] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="Введите название..."
                    />
                </div>
                <div className="flex gap-1 md:gap-2 mt-5 shrink-0">
                    {contentPostId && (
                        <div className="hidden sm:flex items-center gap-1 text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded" title="Привязано к посту">
                            <LinkIcon size={14} /> Пост
                        </div>
                    )}
                    {currentTask?.id && onDelete && (
                        <button type="button" onClick={() => onDelete(currentTask.id!)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors" title="В архив">
                            <Archive size={18} />
                        </button>
                    )}
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Properties Grid */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-4 md:gap-y-5">
                    {/* Status */}
                    <div className="flex items-center gap-3">
                        <div className="w-28 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2"><CheckCircle2 size={16}/> Статус</div>
                        <StatusPrioritySelect
                            value={status}
                            options={statuses}
                            onChange={setStatus}
                            type="status"
                            getColor={getStatusColor}
                        />
                    </div>

                    {/* Priority */}
                    <div className="flex items-center gap-3">
                        <div className="w-28 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2"><Flag size={16}/> Приоритет</div>
                        <StatusPrioritySelect
                            value={priority}
                            options={priorities}
                            onChange={setPriority}
                            type="priority"
                            getColor={getPriorityColor}
                        />
                    </div>

                    {/* Assignee Multiple */}
                    <div className="flex items-center gap-3">
                        <div className="w-28 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2"><UserIcon size={16}/> Исполнители</div>
                        <div className="flex-1 relative" ref={assigneeDropdownRef}>
                            <div 
                                onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                                className="flex items-center gap-2 cursor-pointer bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-[#303030] transition-colors"
                            >
                                {assigneeIds.length > 0 ? (
                                    <div className="flex -space-x-2">
                                        {assigneeIds.map(uid => {
                                            const u = users.find(us => us.id === uid);
                                            return u ? <img key={uid} src={u.avatar} className="w-7 h-7 rounded-full border-2 border-white dark:border-[#252525]" title={u.name} /> : null;
                                        })}
                                    </div>
                                ) : <span className="text-sm text-gray-400">Не назначено</span>}
                                <Plus size={16} className="text-gray-400 ml-auto" />
                            </div>
                            
                            {/* Custom Dropdown */}
                            {isAssigneeDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 p-2 max-h-64 overflow-y-auto custom-scrollbar">
                                    {users.map(u => (
                                        <div 
                                            key={u.id} 
                                            onClick={() => {
                                                toggleAssignee(u.id);
                                            }} 
                                            className="flex items-center gap-3 p-2.5 hover:bg-gray-100 dark:hover:bg-[#333] rounded-lg cursor-pointer transition-colors"
                                        >
                                            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors ${assigneeIds.includes(u.id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-500 bg-white dark:bg-[#252525]'}`}>
                                                {assigneeIds.includes(u.id) && <CheckCircle2 size={12} className="text-white" />}
                                            </div>
                                            <img src={u.avatar} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600" />
                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1 truncate">{u.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Module */}
                    <div className="flex items-center gap-3">
                        <div className="w-28 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2"><Tag size={16}/> Модуль</div>
                        <ModuleSelect
                            value={projectId}
                            options={projects}
                            onChange={setProjectId}
                            onCreateProject={onCreateProject}
                        />
                    </div>

                    {/* Dates */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 col-span-1 md:col-span-2">
                        <div className="w-full sm:w-28 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2 shrink-0"><CalendarIcon size={16}/> Сроки</div>
                        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="flex-1 sm:flex-none bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-lg px-2 md:px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50"/>
                            <span className="text-gray-400 text-sm shrink-0">➜</span>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="flex-1 sm:flex-none bg-gray-50 dark:bg-[#252525] border border-gray-200 dark:border-gray-700 rounded-lg px-2 md:px-3 py-2 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/50"/>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-8">
                    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase flex items-center gap-2">
                        <AlignLeft size={16}/> Описание
                    </label>
                    <textarea 
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full min-h-[150px] bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none resize-y placeholder-gray-400 dark:placeholder-gray-600"
                        placeholder="Добавьте описание задачи..."
                    />
                </div>

                {/* Attachments */}
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-2">
                            <Paperclip size={16}/> Вложения
                        </label>
                        <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1.5 px-2 py-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                        >
                            <Plus size={14}/> Добавить
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                    </div>
                    
                    {task?.attachments && task.attachments.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3">
                            {task.attachments.map(att => (
                                <div key={att.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-[#252525] rounded-lg border border-gray-100 dark:border-gray-700 group">
                                    <div className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        {att.type.includes('image') ? <ImageIcon size={16}/> : <File size={16}/>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{att.name}</div>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400">{new Date(att.uploadedAt).toLocaleDateString()}</div>
                                    </div>
                                    <a href={att.url} download className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors md:opacity-0 md:group-hover:opacity-100">
                                        <Download size={14}/>
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400 italic">Нет вложений</div>
                    )}
                </div>
                
                {/* Footer Save Button (Visible mainly on desktop or bottom of scroll) */}
                <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end pb-10 md:pb-0">
                    <button 
                        type="button"
                        onClick={() => handleSubmit()} 
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors w-full md:w-auto"
                    >
                        {currentTask?.id ? 'Сохранить изменения' : 'Создать задачу'}
                    </button>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: COMMENTS (Bottom on Mobile) */}
        {currentTask?.id && (
            <div className="w-full md:w-80 bg-gray-50 dark:bg-[#121212] border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 flex flex-col shrink-0 h-auto md:h-auto min-h-[300px] md:min-h-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 bg-gray-50 dark:bg-[#121212]">
                    <MessageSquare size={18} className="text-gray-500"/>
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm">Комментарии</h3>
                    <span className="bg-gray-200 dark:bg-[#303030] text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full font-medium">{currentTask.comments?.length || 0}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50 dark:bg-[#121212]">
                    {currentTask.comments && currentTask.comments.length > 0 ? currentTask.comments.map(comment => {
                        const author = users.find(u => u.id === comment.userId);
                        return (
                            <div key={comment.id} className={`flex gap-3 ${comment.isSystem ? 'opacity-70' : ''}`}>
                                {!comment.isSystem && (
                                    <div className="flex-shrink-0">
                                        <img src={author?.avatar} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700" alt=""/>
                                    </div>
                                )}
                                <div className={`flex-1 ${comment.isSystem ? 'text-center' : ''}`}>
                                    {!comment.isSystem && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold text-gray-800 dark:text-gray-300">{author?.name}</span>
                                            <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    )}
                                    {comment.isSystem ? (
                                        <div className="text-xs text-gray-500 italic py-2 border-y border-gray-200 dark:border-gray-800 my-2">{comment.text}</div>
                                    ) : (
                                        <div className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 p-2.5 rounded-r-lg rounded-bl-lg shadow-sm">
                                            {comment.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="text-center text-gray-400 text-xs mt-10">
                            Нет комментариев. Напишите что-нибудь!
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#121212]">
                    <div className="relative">
                        <textarea 
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Написать комментарий..."
                            className="w-full bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg pl-3 pr-10 py-2 text-sm focus:ring-2 focus:ring-blue-500/50 resize-none min-h-[40px] max-h-[100px]"
                            onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment(); } }}
                        />
                        <button 
                            onClick={handleSendComment}
                            disabled={!commentText.trim()}
                            className="absolute right-2 bottom-1.5 p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1 text-right pr-1">Enter - отправить</div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default TaskModal;
